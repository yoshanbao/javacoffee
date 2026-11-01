import { cp, mkdir, rm } from 'node:fs/promises';
import { siteFiles } from './site-files.mjs';

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
for (const path of siteFiles) {
  await cp(path, `dist/${path}`, { recursive: true });
}
console.log('Static website built in dist/');
