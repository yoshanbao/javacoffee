import { createServer } from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { siteFiles } from './site-files.mjs';

const root = resolve(process.cwd());
const port = Number(process.env.PORT || 4173);
const pages = new Set(siteFiles.filter(path => path !== 'assets').map(path => resolve(root, path)));
const assets = resolve(root, 'assets') + sep;
const isPublicFile = file => pages.has(file) || file.startsWith(assets);
const types = { '.html': 'text/html; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2' };
const preview = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = resolve(root, pathname === '/' ? 'index.html' : `.${pathname}`);
    // Check both the request and resolved symlink target before reading a file.
    if (!isPublicFile(file) || !isPublicFile(await realpath(file)) || !(await stat(file)).isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Page not found');
      return;
    }
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(body);
  } catch { res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('Page not found'); }
});
preview.listen(port, '127.0.0.1', () => console.log(`Java Ray’s preview: http://127.0.0.1:${preview.address().port}`));
