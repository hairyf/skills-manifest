import { defineCommand, runMain } from 'citty'
import pkg from '../../package.json' with { type: 'json' }
import { add } from './add'
import { init } from './init'
import { install } from './install'
import { remove } from './remove'
import { sync } from './sync'

const main = defineCommand({
  meta: {
    name: 'skills-manifest',
    version: pkg.version,
    description: 'A lightweight manifest manager for skills',
  },
  subCommands: {
    add,
    init,
    install,
    remove,
    sync,
  },
})

runMain(main)
