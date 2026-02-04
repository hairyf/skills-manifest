import type { SkillsManifest } from '../types'
import fs from 'node:fs/promises'
import { loadConfig } from 'c12'
import { defineCommand } from 'citty'

export const add = defineCommand({
  meta: {
    name: 'add',
    description: 'Add repo and skills to manifest',
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
    const skills = positionals.slice(1)

    const existing = config.skills[repo]
    const existingList = Array.isArray(existing)
      ? existing
      : typeof existing === 'object' && existing !== null
        ? Object.keys(existing).filter(k => (existing as Record<string, boolean>)[k])
        : []
    const skillsToAdd = [...new Set([...existingList, ...skills])]

    config.skills[repo] = skillsToAdd
    const content = JSON.stringify(config, null, 2)
    await fs.writeFile(configFile, content)
    console.log(`Added ${repo} to skills-manifest.json`)
  },
})
