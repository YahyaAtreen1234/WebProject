/**
 * Exercises the storage adapter end to end against the local driver.
 * Run: npx ts-node --compiler-options '{"module":"commonjs"}' scripts/storage-selftest.ts
 */
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';

async function main() {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'stonesland-storage-'));
  process.env.STORAGE_DRIVER = 'local';
  process.env.UPLOAD_DIR = tmp;
  process.env.MEDIA_BASE_PATH = '/media';
  process.env.MAX_UPLOAD_BYTES = String(1024 * 1024);

  const s = await import('../src/lib/storage');

  let pass = 0;
  let fail = 0;
  const check = (name: string, ok: boolean, detail = '') => {
    if (ok) { pass++; console.log(`  PASS  ${name}`); }
    else { fail++; console.log(`  FAIL  ${name} ${detail}`); }
  };

  // A real 1x1 PNG.
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64'
  );

  // --- store ---
  const stored = await s.storeUpload({ name: 'photo.png', type: 'image/png', data: png });
  check('URL is site-relative under the media base', stored.url.startsWith('/media/products/'), stored.url);
  check('reported size matches the bytes', stored.size === png.length);

  const onDisk = path.join(tmp, stored.key);
  check('file exists on disk', await fs.stat(onDisk).then(() => true).catch(() => false), onDisk);
  check('bytes on disk are byte-identical', (await fs.readFile(onDisk)).equals(png));

  // --- content addressing ---
  const again = await s.storeUpload({ name: 'other-name.png', type: 'image/png', data: png });
  check('same bytes produce the same key (no duplicates)', again.key === stored.key);

  // --- rejections ---
  const rejects = async (name: string, fn: () => Promise<unknown>, wantStatus: number) => {
    try { await fn(); check(name, false, '(no error thrown)'); }
    catch (e: any) { check(name, e?.status === wantStatus, `got status ${e?.status}: ${e?.message}`); }
  };

  await rejects('rejects a non-image type', () =>
    s.storeUpload({ name: 'x.exe', type: 'application/x-msdownload', data: png }), 415);

  await rejects('rejects a file over the size limit', () =>
    s.storeUpload({ name: 'big.png', type: 'image/png', data: Buffer.alloc(2 * 1024 * 1024) }), 413);

  // --- path traversal ---
  for (const bad of ['../escape.png', '/abs.png', 'a/../../b.png', 'a//b.png']) {
    let threw = false;
    try { s.assertSafeKey(bad); } catch { threw = true; }
    check(`rejects traversal key ${JSON.stringify(bad)}`, threw);
  }

  // --- inline data URLs ---
  check('recognises legacy data: URLs', s.isInlineDataUrl('data:image/png;base64,AAAA'));
  check('does not treat a normal URL as inline', !s.isInlineDataUrl('/media/products/2026/09/x.png'));
  await s.removeUpload('data:image/png;base64,AAAA'); // must not throw
  check('deleting a legacy data: URL is a no-op', true);

  // --- delete ---
  await s.removeUpload(stored.url);
  check('delete removes the file', !(await fs.stat(onDisk).then(() => true).catch(() => false)));
  await s.removeUpload(stored.url); // second delete must not throw
  check('deleting an already-deleted file is a no-op', true);

  await fs.rm(tmp, { recursive: true, force: true });

  console.log(`\n  ${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
