import type { SkillsManifest } from '../types'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { defineCommand } from 'citty'
import { addDevDependency, installDependencies } from 'nypm'
import { patchSkillsCli } from './patch'

const DEFAULT_MANIFEST: SkillsManifest = {
  agents: ['cursor', 'claude-code'],
  skills: {},
}

export const init = defineCommand({
  meta: { name: 'init', description: 'Initialize skills configuration' },
  async run() {
    const cwd = process.cwd()

    // 1. 依赖安装 (合并调用)
    await addDevDependency(['skills', 'skills-manifest'], { cwd })
    await installDependencies({ cwd })
    await patchSkillsCli()

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
