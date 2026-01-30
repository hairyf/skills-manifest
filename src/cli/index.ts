import type { SkillsManifest } from '../types'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { loadConfig } from 'c12'
import { defineCommand, runMain } from 'citty'
import { addDevDependency, installDependencies } from 'nypm'
import { x } from 'tinyexec'
import pkg from '../../package.json' with { type: 'json' }

const DEFAULT_MANIFEST: SkillsManifest = {
  agents: ['cursor'],
  skills: {},
}

const init = defineCommand({
  meta: { name: 'init', description: 'Initialize skills configuration' },
  async run() {
    const cwd = process.cwd()

    // 1. 依赖安装 (合并调用)
    await addDevDependency(['skills', 'skills-manifest'], { cwd })
    await installDependencies({ cwd })

    // 2. 初始化配置文件 (利用 try-catch 简化)
    const manifestPath = path.join(cwd, 'skills-manifest.json')
    if (!(await fs.stat(manifestPath).catch(() => null))) {
      const content = {
        $schema: 'https://raw.githubusercontent.com/hairyf/skills-manifest/main/skills-manifest.schema.json',
        ...DEFAULT_MANIFEST,
      }
      await fs.writeFile(manifestPath, JSON.stringify(content, null, 2))
    }

    // 3. 更新 .gitignore (简化去重逻辑)
    const gitignorePath = path.join(cwd, '.gitignore')
    const gitignore = await fs.readFile(gitignorePath, 'utf-8').catch(() => '')
    if (!gitignore.split('\n').includes('skills'))
      await fs.appendFile(gitignorePath, gitignore.endsWith('\n') ? 'skills\n' : '\nskills\n')

    // 4. 更新 package.json (链式操作)
    const pkgPath = path.join(cwd, 'package.json')
    const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'))

    const prepare = pkg.scripts?.prepare
    const cmd = 'skills-manifest install'

    if (!prepare) {
      pkg.scripts = { ...pkg.scripts, prepare: cmd }
    }
    else if (!prepare.includes(cmd)) {
      pkg.scripts.prepare = `${prepare} && ${cmd}`
    }

    await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2))
  },
})

const install = defineCommand({
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
    const TARGET_MAP = { cursor: '.cursor', opencode: '.opencode' }
    const agents = path.join(process.cwd(), '.agents')
    const fixedAgents = config.agents.filter((a: string) => a in TARGET_MAP)
    for (const agent of fixedAgents) {
      const dest = path.join(process.cwd(), TARGET_MAP[agent as keyof typeof TARGET_MAP])
      await fs.rm(dest, { recursive: true, force: true })
      await fs.cp(agents, dest, { recursive: true, verbatimSymlinks: false })
    }
  },
})

const main = defineCommand({
  meta: {
    name: 'skills-manifest',
    version: pkg.version,
    description: 'A lightweight manifest manager for skills',
  },
  subCommands: {
    init,
    install,
  },
})

runMain(main)
