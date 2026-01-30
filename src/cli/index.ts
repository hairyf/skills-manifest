import type { SkillsManifest } from '../types'
import { loadConfig } from 'c12'
import { defineCommand, runMain } from 'citty'
import { x } from 'tinyexec'
import pkg from '../../package.json' with { type: 'json' }

const main = defineCommand({
  meta: {
    name: 'install',
    version: pkg.version,
    description: 'Install skills',
  },
  async run() {
    const { config } = await loadConfig<SkillsManifest>({
      configFile: 'skills-manifest',
    })

    for (const repo of Object.keys(config.skills)) {
      if (typeof config.skills[repo] === 'boolean') {
        await x('skills', ['add', repo, '--agent', ...config.agents, '--all', '--yes'])
        continue
      }
      for (const skill of Object.keys(config.skills[repo]))
        await x('skills', ['add', repo, '--skill', skill, '--agent', ...config.agents, '--yes'])
    }
  },
})

runMain(main)
