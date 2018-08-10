import { Switcheo } from 'switcheo-js'
import bluebird from 'bluebird'
import { some } from 'lodash'
import _config from './config'
import _localConfig from './.config.local'
import runSingle from './runSingle'
import runLoop from './runLoop'

// NOTE: This must be placed as high up as possible
// Load .dot file as environment variables
require('dotenv').config()

global.Promise = bluebird

const config = process.env.LOCAL ? _localConfig : _config

const checkPrivateKeys = (wallets) => {
  const someMissingKeys = some(wallets, (wallet) => !process.env[wallet])
  if (someMissingKeys) throw new Error('Some private key not found. See README.md')
}
const checkWalletLength = (wallets, length) => {
  if (wallets.length < length) throw new Error(`Need at least ${length} wallets. See README.md`)
}

const initialise = ({ isSingleRun }) => {
  const { wallets } = config
  const switcheo = new Switcheo({
    net: 'TestNet',
    blockchain: 'neo',
  })

  if (isSingleRun) {
    checkPrivateKeys(wallets)
    checkWalletLength(wallets, 1)

    const account = switcheo.createAccount({ privateKey: process.env[wallets[0]] })

    return [switcheo, [account]]
  }

  checkPrivateKeys(wallets)
  checkWalletLength(wallets, 2)

  const accounts = wallets.map(wallet => switcheo.createAccount({ privateKey: process.env[wallet] }))
  return [switcheo, accounts]
}

// Main Method
const run = async () => {
  const { bot } = config

  const isSingleRun = bot && bot.single && bot.single.run
  const isLoopRun = bot && bot.loop && bot.loop.run
  if (!isSingleRun && !isLoopRun) return

  const [switcheo, accounts] = initialise({ isSingleRun })

  try {
    if (isSingleRun) {
      await runSingle(switcheo, accounts, bot.single.commands)
    } else {
      // run bot
      await runLoop(switcheo, accounts, bot.loop.config)
    }
  } catch (err) {
    console.error(err)
    throw new Error(err)
  }
}

run()
