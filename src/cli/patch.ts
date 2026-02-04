import fs from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'

const require = createRequire(import.meta.url)

/** Replace node_modules/skills/bin/cli.mjs with wrapper (add/remove sync with skills-manifest.json, add --skip-manifest) */
export async function patchSkillsCli(): Promise<void> {
  const cwd = process.cwd()
  const cliPath = path.join(cwd, 'node_modules', 'skills', 'bin', 'cli.mjs')
  try {
    const stat = await fs.stat(cliPath)
    if (!stat.isFile())
      return
  }
  catch {
    return
  }
  const existing = await fs.readFile(cliPath, 'utf-8').catch(() => '')
  if (existing.includes('Injected by skills-manifest'))
    return
  let wrapperPath: string
  try {
    const pkgJsonPath = require.resolve('skills-manifest/package.json')
    wrapperPath = path.join(path.dirname(pkgJsonPath), 'patches', 'skills-cli.mjs')
  }
  catch {
    return
  }
  try {
    const wrapper = await fs.readFile(wrapperPath, 'utf-8')
    await fs.writeFile(cliPath, wrapper, 'utf-8')
  }
  catch {
    console.warn('skills-manifest: failed to inject wrapper. Sync add/remove with manifest will not run.')
  }
}
