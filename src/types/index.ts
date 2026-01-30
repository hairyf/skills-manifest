export type Repo = boolean | { [skill: string]: boolean } | string[]
export interface Skills { [repo: string]: Repo }
export interface SkillsManifest {
  skills: Skills
  agents: string[]
}
