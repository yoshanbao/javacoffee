import { build } from 'esbuild';
import { mkdir, copyFile } from 'node:fs/promises';

await mkdir('assets/vendor', { recursive: true });
await build({
  entryPoints: ['scripts/motion-entry.js'],
  outfile: 'assets/vendor/motion.js',
  bundle: true,
  minify: true,
  format: 'iife',
  globalName: 'JavaRaysMotion',
  target: ['safari16', 'chrome110', 'firefox115'],
  legalComments: 'eof',
});
await copyFile('node_modules/motion/LICENSE.md', 'assets/vendor/MOTION-LICENSE.md');
console.log('Local Motion bundle generated.');
