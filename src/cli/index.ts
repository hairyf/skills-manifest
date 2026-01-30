import type { SkillsManifest } from '../types'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
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
    // fix: https://github.com/vercel-labs/skills/issues/105
    // copy and overwrite the .agents directory to .cursor or .opencode
    const TARGET_MAP = { cursor: '.cursor', opencode: '.opencode' }
    const agents = path.join(process.cwd(), '.agents')
    const fixedAgents = config.agents.filter(a => a in TARGET_MAP)
    for (const agent of fixedAgents) {
      const dest = path.join(process.cwd(), TARGET_MAP[agent as keyof typeof TARGET_MAP])
      await fs.rm(dest, { recursive: true, force: true })
      await fs.cp(agents, dest, { recursive: true, verbatimSymlinks: false })
    }
  },
})

runMain(main)
