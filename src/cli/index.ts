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
    const repos = Object.keys(config.skills)
    for (const repo of repos) {
      if (typeof config.skills[repo] === 'boolean') {
        const args = ['add', repo, '--agent', ...config.agents, '--all', '--yes']
        await x('skills', args, { nodeOptions: { stdio: 'inherit' } })
        continue
      }

      const skills: string[] = Array.isArray(config.skills[repo])
        ? config.skills[repo]
        // @ts-expect-error - allow object with boolean values
        : Object.keys(config.skills[repo]).filter(skill => config.skills[repo][skill] === true)

      const args = ['add', repo, '--skill', ...skills, '--agent', ...config.agents, '--yes']
      await x('skills', args, { nodeOptions: { stdio: 'inherit' } })
    }
  },
})

runMain(main)
