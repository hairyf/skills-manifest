import type { SkillsManifest } from '../types'
import fs from 'node:fs/promises'
import { loadConfig } from 'c12'
import { defineCommand } from 'citty'

export const remove = defineCommand({
  meta: {
    name: 'remove',
    description: 'Remove repo or skills from manifest',
  },
  args: {
    repo: {
      type: 'positional',
      description: 'Repository (e.g. owner/repo or full URL)',
      required: true,
    },
  },
  async run({ args }) {
    const { config, configFile } = await loadConfig<SkillsManifest>({
      configFile: 'skills-manifest',
    })
    if (!configFile)
      throw new Error('skills-manifest.json not found. Run `skills-manifest init` first.')

    const repo = args.repo as string
    const positionals = (args._ as string[]) ?? []
    const skillsToRemove = positionals.slice(1)

    if (!(repo in config.skills))
      throw new Error(`Repo ${repo} not found in manifest`)

    if (skillsToRemove.length === 0) {
      delete config.skills[repo]
      console.log(`Removed ${repo} from skills-manifest.json`)
    }
    else {
      const existing = config.skills[repo]
      const existingList = Array.isArray(existing)
        ? existing
        : typeof existing === 'object' && existing !== null
          ? Object.keys(existing).filter(k => (existing as Record<string, boolean>)[k])
          : []
      const skillsToKeep = existingList.filter(s => !skillsToRemove.includes(s))
      if (skillsToKeep.length === 0) {
        delete config.skills[repo]
        console.log(`Removed ${repo} from skills-manifest.json`)
      }
      else {
        config.skills[repo] = skillsToKeep
        console.log(`Removed skills from ${repo} in skills-manifest.json`)
      }
    }

    const content = JSON.stringify(config, null, 2)
    await fs.writeFile(configFile, content)
  },
})
