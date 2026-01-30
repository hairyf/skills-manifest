export type Repo = boolean | { [skill: string]: boolean }
export interface Skills { [repo: string]: Repo }
export interface SkillsManifest {
  skills: Skills
  agents: string[]
}
