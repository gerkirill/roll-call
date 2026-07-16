const ACCENT = '\u0301';

export function getAccentIndex(s: string): number {
  const idx = s.indexOf(ACCENT);
  return idx <= 0 ? -1 : idx - 1;
}

export function setAccent(s: string, charIndex: number): string {
  const clean = removeAccent(s);
  return clean.slice(0, charIndex + 1) + ACCENT + clean.slice(charIndex + 1);
}

export function removeAccent(s: string): string {
  return s.replace(ACCENT, '');
}

export function splitChars(s: string): string[] {
  return removeAccent(s).split('');
}
