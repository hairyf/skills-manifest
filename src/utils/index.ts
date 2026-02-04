import type { SkillsManifest } from '../types'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { loadConfig } from 'c12'

export interface SyncFromSkillsOptions {
  cwd?: string
}

/** Parse skills CLI-style argv and sync manifest (used by skills-cli patch). */
export async function syncFromSkills(argv: string[], options: SyncFromSkillsOptions = {}): Promise<void> {
  const cmd = argv[0]
  if (cmd !== 'add' && cmd !== 'remove')
    return

  const cwd = options.cwd ?? process.cwd()
  const configPath = path.join(cwd, 'skills-manifest.json')
  try {
    await fs.access(configPath)
  }
  catch {
    return
  }

  const { config, configFile } = await loadConfig<SkillsManifest>({
    configFile: 'skills-manifest',
    cwd,
  })
  if (!configFile)
    return

  if (cmd === 'add') {
    const rest = argv.slice(1)
    let repo = ''
    const skills: string[] = []
    for (let i = 0; i < rest.length; i++) {
      if (rest[i] === '--skill' && rest[i + 1]) {
        skills.push(rest[i + 1])
        i++
        continue
      }
      if (!rest[i].startsWith('-') && !repo) {
        repo = rest[i]
        continue
      }
    }
    if (!repo)
      return
    const existing = config.skills[repo]
    const existingList = Array.isArray(existing)
      ? existing
      : typeof existing === 'object' && existing !== null
        ? Object.keys(existing).filter(k => (existing as Record<string, boolean>)[k])
        : []
    config.skills[repo] = [...new Set([...existingList, ...skills])]
  }
  else {
    const rest = argv.slice(1)
    const skillNames = rest.filter(a => !a.startsWith('-'))
    if (skillNames.length === 0)
      return
    for (const [repo, list] of Object.entries(config.skills)) {
      const arr = Array.isArray(list)
        ? list
        : typeof list === 'object' && list !== null
          ? Object.keys(list).filter(k => (list as Record<string, boolean>)[k])
          : []
      const toRemove = skillNames.filter(s => arr.includes(s))
      if (toRemove.length === 0)
        continue
      const kept = arr.filter(s => !toRemove.includes(s))
      if (kept.length === 0)
        delete config.skills[repo]
      else config.skills[repo] = kept
    }
  }

  await fs.writeFile(configFile, JSON.stringify(config, null, 2))
}
