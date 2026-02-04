import process from 'node:process'
import { defineCommand } from 'citty'
import { syncFromSkills } from '../utils'

export const sync = defineCommand({
  meta: { name: 'sync', description: 'Sync manifest from skills CLI argv (internal)' },
  async run() {
    const idx = process.argv.indexOf('sync')
    const argv = idx < 0 ? [] : process.argv.slice(idx + 1)
    await syncFromSkills(argv)
  },
})
