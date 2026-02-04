import type { SkillsManifest } from '../types'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { loadConfig } from 'c12'
import { defineCommand } from 'citty'
import { x } from 'tinyexec'
import { patchSkillsCli } from './patch'

const TARGET_MAP = { cursor: '.cursor', opencode: '.opencode' } as const

export const install = defineCommand({
  meta: {
    name: 'install',
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
        : Object.keys(config.skills[repo] as Record<string, boolean>).filter(skill => (config.skills[repo] as Record<string, boolean>)[skill] === true)

      const args = ['add', repo, '--skill', ...skills, '--agent', ...config.agents, '--yes']
      await x('skills', args, { nodeOptions: { stdio: 'inherit' } })
    }
    // fix: https://github.com/vercel-labs/skills/issues/105
    // copy and overwrite the .agents directory to .cursor or .opencode
    const agents = path.join(process.cwd(), '.agents')
    const fixedAgents = config.agents.filter((a: string) => a in TARGET_MAP)
    for (const agent of fixedAgents) {
      const dest = path.join(process.cwd(), TARGET_MAP[agent as keyof typeof TARGET_MAP])
      await fs.rm(dest, { recursive: true, force: true })
      await fs.cp(agents, dest, { recursive: true, verbatimSymlinks: false })
    }
    await patchSkillsCli()
  },
})
