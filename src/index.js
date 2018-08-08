import { Switcheo } from 'switcheo-js'
import { cloneDeep } from 'lodash'
import { actPrinter } from './utils'
import * as act from './lib'
import config from './config'
import localConfig from './.config.local'

// NOTE: This must be placed as high up as possible
// Load .dot file as environment variables
require('dotenv').config()

const { wallets, bot } = process.env.LOCAL ? localConfig : config

const enabledCommands = c => c.run

const initialise = () => {
  const switcheo = new Switcheo({
    net: 'TestNet',
    blockchain: 'neo',
  })

  const privateKey1 = wallets[0]
  if (!process.env[privateKey1]) {
    throw new Error('No private key found. See README.md')
  }
  const account = switcheo.createAccount({ privateKey: process.env[privateKey1] })

  return [switcheo, account]
}

const runSingle = async (switcheo, account, commands) => {
  commands.filter(enabledCommands).forEach(async (command) => {
    const { type, action, params = [], options = {} } = cloneDeep(command)
    const res = await act[type][action]({ switcheo, account }, ...params, options)
    if (options && options.print) {
      actPrinter(type, action, options, res)
    }
  })
}

// Main Method
const run = async () => {
  const [switcheo, account] = initialise()

  const shouldRunSingleCommand = bot && bot.single && bot.single.run
  if (shouldRunSingleCommand) {
    runSingle(switcheo, account, bot.single.commands)
  } else {
    // run bot
  }
}

run()
