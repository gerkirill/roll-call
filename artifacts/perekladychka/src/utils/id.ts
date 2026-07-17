const NANOID_ALPHABET = '_-0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

/** Generates a Nano ID using the default URL-safe 64-character alphabet. */
export function nanoid(size: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  let id = '';

  for (const byte of bytes) {
    id += NANOID_ALPHABET[byte & 63];
  }

  return id;
}
