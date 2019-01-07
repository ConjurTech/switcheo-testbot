import { mapValues } from 'lodash'
import * as act from './lib'
import { sleep, linePrint } from './utils'

const getTotalConfirmingBalances = async (switcheo, accounts) => {
  let totalConfirmingBalances = 0
  for (let i = 0; i < accounts.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    const balances = await act.balances.list({ switcheo, account: accounts[i] })
    const confirmingHash = mapValues(balances.confirming, confirmings => confirmings.length)
    totalConfirmingBalances += Object.values(confirmingHash).reduce((a, b) => a + b, 0)
  }
  return totalConfirmingBalances
}

const runBalanceCheck = async (switcheo, accounts) => {
  let now = new Date()
  const firstStartedAt = now
  let lastStaleTotalConfirmingAt = now
  let lastTotalConfirming = 0

  lastTotalConfirming = await getTotalConfirmingBalances(switcheo, accounts)

  linePrint(`Time started: ${firstStartedAt}`)
  linePrint(`Started with number of pending balances: ${lastTotalConfirming}`)

  while (lastTotalConfirming) {
    /* eslint-disable no-await-in-loop */
    await sleep(5000)
    const totalConfirming = await getTotalConfirmingBalances(switcheo, accounts)
    now = new Date()
    if (totalConfirming !== lastTotalConfirming) {
      lastStaleTotalConfirmingAt = now
      lastTotalConfirming = totalConfirming
    }
    const _2mins = 2 * 60 * 1000
    if (now - lastStaleTotalConfirmingAt > _2mins) { // throw if waited more than 2 mins, for confirming balance change
      throw new Error('Waited more than 2mins to clear')
    }
    linePrint(`Currently waiting for total number of pending balances: ${lastTotalConfirming}`)
    /* eslint-enable */
  }

  linePrint(`Time started: ${firstStartedAt}`)
  linePrint(`Time ended: ${lastStaleTotalConfirmingAt}`)

  return true
}

export default runBalanceCheck
