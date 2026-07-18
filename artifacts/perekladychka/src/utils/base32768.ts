/*
Base32768 codec adapted from qntm/base32768.

MIT License
Copyright (c) 2021 qntm

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

const BITS_PER_CHAR = 15;
const BITS_PER_BYTE = 8;

const pairStrings = [
  'ҠҿԀԟڀڿݠޟ߀ߟကဟႠႿᄀᅟᆀᆟᇠሿበቿዠዿጠጿᎠᏟᐠᙟᚠᛟកសᠠᡟᣀᣟᦀᦟ᧠᧿ᨠᨿᯀᯟᰀᰟᴀᴟ⇠⇿⋀⋟⍀⏟␀␟─❟➀➿⠀⥿⦠⦿⨠⩟⪀⪿⫠⭟ⰀⰟⲀⳟⴀⴟⵀⵟ⺠⻟㇀㇟㐀䶟䷀龿ꀀꑿ꒠꒿ꔀꗿꙀꙟꚠꛟ꜀ꝟꞀꞟꡀꡟ',
  'ƀƟɀʟ',
];

const encodeLookup: Record<number, string[]> = {};
const decodeLookup = new Map<string, { bitCount: number; value: number }>();

pairStrings.forEach((pairString, rangeIndex) => {
  const pairs = pairString.match(/../gu);
  if (!pairs) throw new Error('Invalid Base32768 repertoire');

  const repertoire: string[] = [];
  pairs.forEach(pair => {
    const first = pair.codePointAt(0);
    const last = pair.codePointAt(1);
    if (first === undefined || last === undefined) {
      throw new Error('Invalid Base32768 repertoire range');
    }

    for (let codePoint = first; codePoint <= last; codePoint++) {
      repertoire.push(String.fromCodePoint(codePoint));
    }
  });

  const bitCount = BITS_PER_CHAR - BITS_PER_BYTE * rangeIndex;
  encodeLookup[bitCount] = repertoire;
  repertoire.forEach((character, value) => {
    decodeLookup.set(character, { bitCount, value });
  });
});

export function encodeBase32768(bytes: Uint8Array): string {
  let result = '';
  let value = 0;
  let bitCount = 0;

  for (const byte of bytes) {
    for (let bitIndex = BITS_PER_BYTE - 1; bitIndex >= 0; bitIndex--) {
      value = (value << 1) + ((byte >> bitIndex) & 1);
      bitCount++;

      if (bitCount === BITS_PER_CHAR) {
        const repertoire = encodeLookup[bitCount];
        if (!repertoire) throw new Error('Missing Base32768 repertoire');
        result += repertoire[value];
        value = 0;
        bitCount = 0;
      }
    }
  }

  if (bitCount !== 0) {
    while (!encodeLookup[bitCount]) {
      value = (value << 1) + 1;
      bitCount++;
    }
    result += encodeLookup[bitCount][value];
  }

  return result;
}

export function decodeBase32768(input: string): Uint8Array {
  const characters = Array.from(input);
  const bytes = new Uint8Array(Math.floor(characters.length * BITS_PER_CHAR / BITS_PER_BYTE));
  let byteCount = 0;
  let byte = 0;
  let byteBitCount = 0;

  characters.forEach((character, index) => {
    const decoded = decodeLookup.get(character);
    if (!decoded) throw new Error(`Unrecognised Base32768 character: ${character}`);
    if (decoded.bitCount !== BITS_PER_CHAR && index !== characters.length - 1) {
      throw new Error(`Secondary character found before end of input at position ${index}`);
    }

    for (let bitIndex = decoded.bitCount - 1; bitIndex >= 0; bitIndex--) {
      byte = (byte << 1) + ((decoded.value >> bitIndex) & 1);
      byteBitCount++;

      if (byteBitCount === BITS_PER_BYTE) {
        bytes[byteCount] = byte;
        byteCount++;
        byte = 0;
        byteBitCount = 0;
      }
    }
  });

  if (byte !== (1 << byteBitCount) - 1) {
    throw new Error('Padding mismatch');
  }

  return bytes.slice(0, byteCount);
}
