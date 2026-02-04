#!/usr/bin/env node
import { enableCompileCache } from 'node:module';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { join, dirname } from 'node:path';

if (enableCompileCache)
  try { enableCompileCache(); } catch {}

const argv = process.argv.slice(2);
const skipManifest = argv.includes('--skip-manifest');
const forwardArgs = argv.filter(arg => arg !== '--skip-manifest');
const [cmd] = forwardArgs;

if (!skipManifest && ['add', 'remove'].includes(cmd)) {
  const require = createRequire(import.meta.url);
  const manifestPkg = require.resolve('skills-manifest/package.json', { paths: [process.cwd()] });
  const binPath = join(dirname(manifestPkg), 'bin/index.mjs');
  spawnSync(process.execPath, [binPath, 'sync', ...forwardArgs], { stdio: 'inherit' });
}

await import('../dist/cli.mjs');