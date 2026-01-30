import { defineConfig } from 'tsdown'
import pkg from './package.json' with { type: 'json' }

export default defineConfig({
  external: Object.keys(pkg.dependencies || {}),
  fixedExtension: true,
  entry: ['src/**/*.ts'],
  format: ['esm'],
  clean: true,
  dts: true,
})
