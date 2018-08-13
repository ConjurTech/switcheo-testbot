import { Switcheo } from 'switcheo-js'
import bluebird from 'bluebird'
import { some } from 'lodash'
import runSingleTest from './runSingleTest'
import runLoopTest from './runLoopTest'
import runBalanceCheck from './runBalanceCheck'
import { asyncErrorHandler } from './utils'

global.Promise = bluebird

const checkPrivateKeys = (env, wallets) => {
  const someMissingKeys = some(wallets, (wallet) => !env[wallet])
  if (someMissingKeys) throw new Error('Some private key not found. See README.md')
}
const checkWalletLength = (wallets, length) => {
  if (wallets.length < length) throw new Error(`Need at least ${length} wallets. See README.md`)
}

// eslint-disable-next-line global-require
const getConfig = (env) => (env.LOCAL ? require('./.config.local') : require('./config'))

const initialise = (env, { minAccounts = 1 }) => {
  const { wallets } = getConfig(env)
  const switcheo = new Switcheo({
    net: 'TestNet',
    blockchain: 'neo',
  })

  checkPrivateKeys(env, wallets)
  checkWalletLength(wallets, minAccounts)
  const accounts = wallets.map(wallet => switcheo.createAccount({ privateKey: env[wallet] }))

  return [switcheo, accounts]
}

// Main Method
const runTest = (env) => asyncErrorHandler(async () => {
  const { bot } = getConfig(env)

  const isSingleRun = bot && bot.single && bot.single.run
  const isLoopRun = bot && bot.loop && bot.loop.run
  if (!isSingleRun && !isLoopRun) return

  const [switcheo, accounts] = initialise(env, { minAccounts: isSingleRun ? 1 : 2 })
  if (isSingleRun) {
    await runSingleTest(switcheo, accounts, bot.single.commands)
  } else {
    // run bot
    const runnerConfig = {}
    await runLoopTest(switcheo, accounts, bot.loop.config, runnerConfig)
  }
})

const runChecks = (env) => asyncErrorHandler(async () => {
  const [switcheo, accounts] = initialise(env, { minAccounts: 1 })
  await runBalanceCheck(switcheo, accounts)
})

export default (env) => asyncErrorHandler(async () => {
  try {
    await runTest(env)
    await runChecks(env)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
})
