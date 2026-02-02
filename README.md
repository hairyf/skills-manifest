# skills-manifest

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

A lightweight manifest manager for [skills](https://github.com/vercel-labs/skills), enabling project-level skill synchronization and collaborative configuration.

> [!IMPORTANT]
> ~~The `skills add <args>` command will not automatically update the `skills-manifest.json` file.~~
> ~~Since [skills](https://github.com/vercel-labs/skills) does not currently support project-level lock files, this project serves as a temporary solution for sharing and persisting skills across collaborative environments.~~

## Init & sync with skills

Run once in your project:

```bash
npx skills-manifest init
```

This will:

- Install `skills` and `skills-manifest` as dev dependencies
- Create `skills-manifest.json` and add a `prepare` script that runs `skills-manifest install`
- Add `skills` to `.gitignore`

Then run:

```bash
skills-manifest install
```

`install` syncs skills from the manifest and **injects a wrapper** into `node_modules/skills` so that:

| When you run | skills-manifest also runs |
|--------------|---------------------------|
| `skills add <repo> [--skill ...]` | `skills-manifest add <repo> [...]` — the repo and skills are written to `skills-manifest.json` |
| `skills remove <skills...>` | `skills-manifest remove` for each repo that had those skills |

To add a skill **without** updating the manifest (e.g. one-off try), use:

```bash
skills add <repo> --skip-manifest
```

## Install (manual)

Alternatively, install without `init`:

```bash
pnpm add skills skills-manifest -D
```

## Config

`skills-manifest.json`:

```json
{
  "$schema": "https://raw.githubusercontent.com/hairyf/skills-manifest/main/skills-manifest.schema.json",
  "agents": ["cursor", "claude-code"],
  "skills": {
    "vercel-labs/agent-skills": {
      "vercel-react-best-practices": true
    },
    // or array of skills
    "https://github.com/vercel-labs": ["find-skills"]
  }
}
```

`.gitignore`:

```
skills
```

`package.json`:

```json
{
  "scripts": {
    "prepare": "skills-manifest install"
  }
}
```

## AGENTS.md for AI Agents

After you have configured `skills-manifest.json` and run `skills-manifest install` to generate the skills tree, we recommend using [OpenSkills](https://github.com/numman-ali/openskills) to produce an `AGENTS.md` that AI agents can consume:

```bash
npx openskills sync
```

This keeps your installed skills in sync with an `AGENTS.md` (or custom output path) so agents that read it (e.g. Claude Code, Cursor, Windsurf) can discover and use the same skills. See [OpenSkills](https://github.com/numman-ali/openskills) for options such as `--universal` and `-o <path>`.

## License

[MIT](./LICENSE) License © [Hairyf](https://github.com/hairyf)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/skills-manifest?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/skills-manifest
[npm-downloads-src]: https://img.shields.io/npm/dm/skills-manifest?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/skills-manifest
[bundle-src]: https://img.shields.io/bundlephobia/minzip/skills-manifest?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=skills-manifest
[license-src]: https://img.shields.io/github/license/antfu/skills-manifest.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/antfu/skills-manifest/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/skills-manifest
