#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

const argv = process.argv.slice(2);
const skipManifest = argv.includes('--skip-manifest');
const forwardArgs = argv.filter(arg => arg !== '--skip-manifest');
const [cmd] = forwardArgs;

// 1. 执行主 CLI 程序
const mainResult = spawnSync(process.execPath, [join(__dirname, '../dist/cli.mjs'), ...forwardArgs], { stdio: 'inherit' });

if (mainResult.status === 0 && !skipManifest && ['add', 'remove'].includes(cmd)) {
  try {
    const binPath = require.resolve('skills-manifest/bin/skills-manifest', { paths: [process.cwd()] });
    spawnSync(process.execPath, [binPath, 'sync', ...forwardArgs], { stdio: 'inherit' });
  } catch {
    console.warn('skills-manifest: failed to sync from skills. Sync add/remove with manifest will not run.')
  }
}

process.exit(mainResult.status ?? 1);