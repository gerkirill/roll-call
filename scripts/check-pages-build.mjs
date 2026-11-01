import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const output = path.resolve(import.meta.dirname, '../artifacts/perekladychka/dist/public');
const base = process.env.BASE_PATH ?? '/';
const read = (file) => readFileSync(path.join(output, file), 'utf8');
const html = read('index.html');
const manifest = JSON.parse(read('manifest.webmanifest'));

assert.equal(read('404.html'), html, 'Deep links must receive the same app shell');
assert.equal(manifest.start_url, base);
assert.equal(manifest.scope, base);
for (const icon of manifest.icons) {
  const url = new URL(icon.src, `https://example.com${base}manifest.webmanifest`);
  assert.ok(url.pathname.startsWith(base), `Icon outside app scope: ${url.pathname}`);
  assert.ok(existsSync(path.join(output, url.pathname.slice(base.length))));
}
for (const [, url] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  if (/^https?:/.test(url)) continue;
  assert.ok(url.startsWith(base), `Asset outside app base: ${url}`);
  assert.ok(existsSync(path.join(output, url.slice(base.length))), `Missing asset: ${url}`);
}
const [, fallback] = read('sw.js').match(/createHandlerBoundToURL\("([^"]+)"\)/) ?? [];
assert.ok(fallback, 'Missing service worker navigation fallback');
assert.equal(new URL(fallback, `https://example.com${base}sw.js`).pathname, `${base}index.html`);
assert.ok(read('changelog.md').length > 0);
console.log(`Pages build checks passed for ${base}`);
