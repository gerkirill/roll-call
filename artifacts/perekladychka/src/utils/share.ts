import type { AppData } from '../types';

const PREFIX = 'pk1:';

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

async function collectStream(readable: ReadableStream<Uint8Array>): Promise<Uint8Array> {
  const chunks: Uint8Array[] = [];
  const reader = readable.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) { out.set(c, offset); offset += c.length; }
  return out;
}

async function gzipCompress(input: Uint8Array): Promise<Uint8Array> {
  const cs = new CompressionStream('gzip');
  const writer = cs.writable.getWriter();
  await writer.write(input as unknown as Uint8Array<ArrayBuffer>);
  await writer.close();
  return collectStream(cs.readable);
}

async function gzipDecompress(input: Uint8Array): Promise<Uint8Array> {
  const ds = new DecompressionStream('gzip');
  const writer = ds.writable.getWriter();
  await writer.write(input as unknown as Uint8Array<ArrayBuffer>);
  await writer.close();
  return collectStream(ds.readable);
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function encodeShareString(data: AppData): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(data));
  const compressed = await gzipCompress(bytes);
  return PREFIX + uint8ToBase64url(compressed);
}

/** Returns parsed AppData or null if the string is invalid / unrecognised. */
export async function decodeShareString(s: string): Promise<AppData | null> {
  try {
    const trimmed = s.trim();
    if (!trimmed.startsWith(PREFIX)) return null;
    const compressed = base64urlToUint8(trimmed.slice(PREFIX.length));
    const decompressed = await gzipDecompress(compressed);
    const parsed = JSON.parse(new TextDecoder().decode(decompressed)) as Partial<AppData>;
    if (!Array.isArray(parsed?.soldiers) || !Array.isArray(parsed?.sessions)) return null;
    return parsed as AppData;
  } catch {
    return null;
  }
}
