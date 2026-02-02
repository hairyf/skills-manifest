#!/usr/bin/env node
// Injected by skills-manifest install: sync add/remove with skills-manifest.json
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const originalCli = join(__dirname, '..', 'dist', 'cli.mjs')
const cwd = process.cwd()

function runSkillsManifest(args) {
  const inNodeModules = join(cwd, 'node_modules', 'skills-manifest', 'bin')
  const inCwd = join(cwd, 'bin')
  const binDir = existsSync(inNodeModules) ? inNodeModules : inCwd
  const entry = existsSync(join(binDir, 'index.dev.mjs')) ? join(binDir, 'index.dev.mjs') : join(binDir, 'index.mjs')
  if (!existsSync(entry)) return
  const r = spawnSync(process.execPath, [entry, ...args], { stdio: 'inherit', cwd })
  if (r.status !== 0) process.exit(r.status ?? 1)
}

const argv = process.argv.slice(2)
const skipManifest = argv.includes('--skip-manifest')
const forwardArgs = argv.filter(a => a !== '--skip-manifest')
const cmd = forwardArgs[0]

const result = spawnSync(process.execPath, [originalCli, ...forwardArgs], { stdio: 'inherit', cwd })
if (result.status !== 0) process.exit(result.status ?? 1)

if (cmd === 'add' && !skipManifest) {
  const rest = forwardArgs.slice(1)
  let repo = ''
  const skills = []
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === '--skill' && rest[i + 1]) { skills.push(rest[i + 1]); i++; continue }
    if (!rest[i].startsWith('-') && !repo) { repo = rest[i]; continue }
  }
  if (repo) runSkillsManifest(['add', repo, ...skills])
} else if (cmd === 'remove') {
  const rest = forwardArgs.slice(1)
  const skillNames = []
  for (const a of rest) { if (a.startsWith('-')) break; skillNames.push(a) }
  if (skillNames.length === 0) process.exit(0)
  const manifestPath = join(cwd, 'skills-manifest.json')
  if (!existsSync(manifestPath)) process.exit(0)
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))
  const repos = manifest.skills || {}
  for (const [repo, list] of Object.entries(repos)) {
    const arr = Array.isArray(list) ? list : (typeof list === 'object' && list !== null ? Object.keys(list).filter(k => list[k]) : [])
    const toRemove = skillNames.filter(s => arr.includes(s))
    if (toRemove.length > 0) runSkillsManifest(['remove', repo, ...toRemove])
  }
}
process.exit(0)
