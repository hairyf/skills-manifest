import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { syncFromSkills } from '../src/utils'

describe('syncFromSkills', () => {
  let tmpDir: string

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'skills-manifest-test-'))
  })

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true })
  })

  async function writeManifest(manifest: object) {
    await fs.writeFile(
      path.join(tmpDir, 'skills-manifest.json'),
      JSON.stringify(manifest, null, 2),
    )
  }

  async function readManifest() {
    const raw = await fs.readFile(path.join(tmpDir, 'skills-manifest.json'), 'utf-8')
    return JSON.parse(raw) as { skills: Record<string, string[] | Record<string, boolean>> }
  }

  it('no-op when argv is not add or remove', async () => {
    await writeManifest({ agents: ['cursor'], skills: {} })
    await syncFromSkills(['list'], { cwd: tmpDir })
    const m = await readManifest()
    expect(m.skills).toEqual({})
  })

  it('no-op when skills-manifest.json does not exist', async () => {
    await syncFromSkills(['add', 'owner/repo', '--skill', 's1'], { cwd: tmpDir })
    const exists = await fs.access(path.join(tmpDir, 'skills-manifest.json')).then(() => true).catch(() => false)
    expect(exists).toBe(false)
  })

  describe('add', () => {
    it('adds repo and skills from argv', async () => {
      await writeManifest({ agents: ['cursor'], skills: {} })
      await syncFromSkills(['add', 'owner/repo', '--skill', 's1', '--skill', 's2'], { cwd: tmpDir })
      const m = await readManifest()
      expect(m.skills).toEqual({ 'owner/repo': ['s1', 's2'] })
    })

    it('merges with existing skills for same repo', async () => {
      await writeManifest({ agents: ['cursor'], skills: { 'owner/repo': ['s0'] } })
      await syncFromSkills(['add', 'owner/repo', '--skill', 's1'], { cwd: tmpDir })
      const m = await readManifest()
      expect(m.skills['owner/repo']).toEqual(['s0', 's1'])
    })

    it('deduplicates skills', async () => {
      await writeManifest({ agents: ['cursor'], skills: { 'owner/repo': ['s1'] } })
      await syncFromSkills(['add', 'owner/repo', '--skill', 's1', '--skill', 's2'], { cwd: tmpDir })
      const m = await readManifest()
      expect(m.skills['owner/repo']).toEqual(['s1', 's2'])
    })

    it('no-op when no repo in argv', async () => {
      await writeManifest({ agents: ['cursor'], skills: { 'owner/repo': ['s1'] } })
      await syncFromSkills(['add', '--skill', 's2'], { cwd: tmpDir })
      const m = await readManifest()
      expect(m.skills).toEqual({ 'owner/repo': ['s1'] })
    })

    it('merges when existing repo is object format { [skill]: true }', async () => {
      await writeManifest({ agents: ['cursor'], skills: { 'owner/repo': { s0: true } } })
      await syncFromSkills(['add', 'owner/repo', '--skill', 's1'], { cwd: tmpDir })
      const m = await readManifest()
      expect(m.skills['owner/repo']).toEqual(['s0', 's1'])
    })
  })

  describe('remove', () => {
    it('removes skills from matching repos', async () => {
      await writeManifest({
        agents: ['cursor'],
        skills: {
          'a/repo': ['s1', 's2', 's3'],
          'b/repo': ['s1', 's4'],
        },
      })
      await syncFromSkills(['remove', 's1', 's3'], { cwd: tmpDir })
      const m = await readManifest()
      expect(m.skills['a/repo']).toEqual(['s2'])
      expect(m.skills['b/repo']).toEqual(['s4'])
    })

    it('removes repo when no skills left', async () => {
      await writeManifest({ agents: ['cursor'], skills: { 'owner/repo': ['s1'] } })
      await syncFromSkills(['remove', 's1'], { cwd: tmpDir })
      const m = await readManifest()
      expect(m.skills).toEqual({})
    })

    it('no-op when no skill names in argv', async () => {
      await writeManifest({ agents: ['cursor'], skills: { 'owner/repo': ['s1'] } })
      await syncFromSkills(['remove'], { cwd: tmpDir })
      const m = await readManifest()
      expect(m.skills).toEqual({ 'owner/repo': ['s1'] })
    })

    it('ignores options after first non-option', async () => {
      await writeManifest({ agents: ['cursor'], skills: { 'owner/repo': ['s1', 's2'] } })
      await syncFromSkills(['remove', 's1', '--yes'], { cwd: tmpDir })
      const m = await readManifest()
      expect(m.skills['owner/repo']).toEqual(['s2'])
    })

    it('removes from object-format skills { [skill]: true }', async () => {
      await writeManifest({ agents: ['cursor'], skills: { 'owner/repo': { s1: true, s2: true } } })
      await syncFromSkills(['remove', 's1'], { cwd: tmpDir })
      const m = await readManifest()
      expect(m.skills['owner/repo']).toEqual(['s2'])
    })
  })
})
