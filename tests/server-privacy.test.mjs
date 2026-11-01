import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, writeFile, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { once } from 'node:events';

test('preview serves website files and blocks private files, traversal, and symlink leaks', async t => {
  const root = await mkdtemp(join(tmpdir(), 'javacoffee-privacy-'));
  await Promise.all(['assets', 'private', '.git'].map(name => mkdir(join(root, name))));
  await Promise.all([
    writeFile(join(root, 'index.html'), '<h1>Public home</h1>'),
    writeFile(join(root, 'menu.html'), '<h1>Public menu</h1>'),
    writeFile(join(root, 'styles.css'), 'body { color: green; }'),
    writeFile(join(root, 'assets', 'photo.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>'),
    writeFile(join(root, 'private', 'business_info.txt'), 'PRIVATE TEST FIXTURE'),
    writeFile(join(root, '.env'), 'PRIVATE TEST FIXTURE'),
    writeFile(join(root, '.git', 'config'), 'PRIVATE TEST FIXTURE'),
    writeFile(join(root, 'README.md'), 'INTERNAL TEST FIXTURE'),
  ]);
  await symlink(join(root, 'private', 'business_info.txt'), join(root, 'assets', 'leak.txt'));
  const child = spawn(process.execPath, [fileURLToPath(new URL('../scripts/serve.mjs', import.meta.url))], {
    cwd: root, env: { ...process.env, PORT: '0' }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  t.after(async () => {
    if (child.exitCode === null && child.signalCode === null) {
      const exited = once(child, 'exit');
      child.kill();
      await exited;
    }
    await rm(root, { recursive: true, force: true });
  });
  const origin = await new Promise((resolve, reject) => {
    let errors = '';
    const timer = setTimeout(() => reject(new Error('Preview did not start')), 5000);
    child.stderr.on('data', chunk => { errors += chunk; });
    child.stdout.on('data', chunk => {
      const match = String(chunk).match(/http:\/\/127\.0\.0\.1:\d+/);
      if (match) { clearTimeout(timer); resolve(match[0]); }
    });
    child.once('error', error => { clearTimeout(timer); reject(error); });
    child.once('exit', code => { clearTimeout(timer); reject(new Error(`Preview exited (${code}): ${errors}`)); });
  });
  for (const path of ['/', '/menu.html', '/styles.css', '/assets/photo.svg']) {
    await t.test(`public ${path}`, async () => {
      const response = await fetch(origin + path);
      assert.equal(response.status, 200);
      assert(!(await response.text()).includes('PRIVATE TEST FIXTURE'));
    });
  }
  for (const path of [
    '/private/business_info.txt', '/private/', '/.env', '/.git/config', '/README.md',
    '/scripts/serve.mjs', '/assets/../private/business_info.txt',
    '/assets/%2e%2e%2fprivate/business_info.txt', '/assets/leak.txt',
  ]) {
    await t.test(`blocked ${path}`, async () => {
      const response = await fetch(origin + path);
      assert.equal(response.status, 404);
      assert(!(await response.text()).includes('PRIVATE TEST FIXTURE'));
    });
  }
});
