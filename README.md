# skills-manifest

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

## Install

```bash
pnpm add skills skills-manifest -D
```

> The `skills add <args>` will not automatically update the `skills-manifest.json` file. Currently, [skills](https://github.com/vercel-labs/skills) does not support project-level.lock file. This project is only intended as temporary solution for sharing skills during collaborative work.

## Config

`skills-manifest.json`:

```json
{
  "agents": ["cursor", "claude"],
  "skills": {
    "vercel-labs/agent-skills": {
      "vercel-react-best-practices": true
    },
    "https://github.com/vercel-labs": {
      "find-skills": true
    }
  }
}
```

`.gitignore`:

```
skills
```

package.json:

```json
{
  "scripts": {
    "prepare": "skills-manifest install"
  }
}
```

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
