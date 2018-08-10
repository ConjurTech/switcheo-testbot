import { cloneDeep } from 'lodash'
import { sleep, linePrint } from './utils'
import * as act from './lib'

const createOrder = async (...params) => act.orders.create(...params)
const cancelAllOpenOrders = async (...params) => act.orders.cancelAllOpen(...params)

const printOrders = (account, orders) => {
  orders.forEach(order => {
    const fillOrders = order.fills.map(f => f.id)
    const makeOrders = order.makes.map(m => m.id)
    if (fillOrders.length) {
      linePrint(`address: ${account.address.slice(0, 4)}, order fills: ${fillOrders}`)
    }

    if (makeOrders.length) {
      linePrint(`address: ${account.address.slice(0, 4)}, order makes: ${makeOrders}`)
    }
  })
}

const createOrderParams = (side, flip, buyParams, sellParams) =>
  ((side === 'buy' && !flip) || (side === 'sell' && flip) ? buyParams : sellParams)

// Main logic for bot
const runLoop = async (switcheo, accounts, config, runnerConfig = {}) => {
  let res
  const { flipCreateParams = false, hasClearedInitialOpenOrders = false } = runnerConfig
  const { interval = 1000, orders } = cloneDeep(config)
  const { priceSteps } = orders.create

  const createOrdersBuy = orders.create.buyParams
  const createOrdersSell = orders.create.sellParams

  const createOrderOptions = { num: 20, priceSteps }

  if (!hasClearedInitialOpenOrders) {
    // Cancel all existing open orders
    for (const account of accounts) {
      // eslint-disable-next-line no-await-in-loop
      await cancelAllOpenOrders({ switcheo, account })
    }
  }

  // res = await createOrder({ switcheo, account: accounts[0] },
  //   ...createOrderParams('buy', flipCreateParams, createOrdersBuy, createOrdersSell), createOrderOptions)
  // printOrders(account, res)
  // await sleep(1)
  //
  // res = await createOrder({ switcheo, account: accounts[1] },
  //   ...createOrderParams('sell', flipCreateParams, createOrdersBuy, createOrdersSell), createOrderOptions)
  // printOrders(account, res)
  // await sleep(1)


  res = await createOrder({ switcheo, account: accounts[0] },
    ...createOrderParams('buy', flipCreateParams, createOrdersBuy, createOrdersSell),
    { ...createOrderOptions, parallel: true }) // ideally, this account will always do makes
  printOrders(accounts[0], res)

  res = await createOrder({ switcheo, account: accounts[1] },
    ...createOrderParams('sell', flipCreateParams, createOrdersBuy, createOrdersSell), createOrderOptions)
  printOrders(accounts[1], res) // ideally, this account will always do fills

  // sleep and loop
  await sleep(interval)
  await runLoop(switcheo, accounts, config, {
    ...runnerConfig,
    flipCreateParams: !flipCreateParams,
    hasClearedInitialOpenOrders: true,
  })
}

export default runLoop
