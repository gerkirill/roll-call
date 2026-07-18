import type { AppData } from '../types';
import { decodeBase32768, encodeBase32768 } from './base32768';

const BASE64_PREFIX = 'pk1:';
const BASE32768_PREFIX = 'pk2:';

export type TextExportFormat = 'base64' | 'base32768';

// ── Binary ↔ Base64URL ──────────────────────────────────────────────────────

function uint8ToBase64url(bytes: Uint8Array): string {
  let binary = '';
  // Process in chunks to avoid call-stack limits on large arrays
  const CHUNK = 8192;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...Array.from(bytes.subarray(i, i + CHUNK)));
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64urlToUint8(str: string): Uint8Array {
  // Restore standard Base64 padding
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = (4 - (padded.length % 4)) % 4;
  const binary = atob(padded + '='.repeat(pad));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// ── gzip via native Compression Streams API ─────────────────────────────────

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

async function gzipCompress(input: Uint8Array): Promise<Uint8Array> {
  if (typeof CompressionStream === 'undefined') {
    throw new Error('цей браузер не підтримує CompressionStream');
  }

  const compressedStream = new Blob([toArrayBuffer(input)])
    .stream()
    .pipeThrough(new CompressionStream('gzip'));

  return new Uint8Array(await new Response(compressedStream).arrayBuffer());
}

async function gzipDecompress(input: Uint8Array): Promise<Uint8Array> {
  if (typeof DecompressionStream === 'undefined') {
    throw new Error('цей браузер не підтримує DecompressionStream');
  }

  const decompressedStream = new Blob([toArrayBuffer(input)])
    .stream()
    .pipeThrough(new DecompressionStream('gzip'));

  return new Uint8Array(await new Response(decompressedStream).arrayBuffer());
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function encodeShareString(
  data: AppData,
  format: TextExportFormat = 'base64',
): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(data));
  const compressed = await gzipCompress(bytes);
  return format === 'base32768'
    ? BASE32768_PREFIX + encodeBase32768(compressed)
    : BASE64_PREFIX + uint8ToBase64url(compressed);
}

/** Returns parsed AppData or null if the string is invalid / unrecognised. */
export async function decodeShareString(s: string): Promise<AppData | null> {
  try {
    const trimmed = s.trim();
    let compressed: Uint8Array;

    if (trimmed.startsWith(BASE64_PREFIX)) {
      compressed = base64urlToUint8(trimmed.slice(BASE64_PREFIX.length));
    } else if (trimmed.startsWith(BASE32768_PREFIX)) {
      compressed = decodeBase32768(trimmed.slice(BASE32768_PREFIX.length));
    } else {
      return null;
    }

    const decompressed = await gzipDecompress(compressed);
    const parsed = JSON.parse(new TextDecoder().decode(decompressed)) as Partial<AppData>;
    if (!Array.isArray(parsed?.soldiers) || !Array.isArray(parsed?.sessions)) return null;
    return parsed as AppData;
  } catch {
    return null;
  }
}
