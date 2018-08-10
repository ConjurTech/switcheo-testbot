import { cloneDeep } from 'lodash'
import { sleep, linePrint } from './utils'
import * as act from './lib'

const createOrder = async (...params) => act.orders.create(...params)

const printOrders = (orders) => {
  orders.forEach(order => {
    const fillOrders = order.fills.map(f => f.id)
    const makeOrders = order.makes.map(m => m.id)
    if (fillOrders.length) {
      linePrint(`order fills: ${fillOrders}`)
    }

    if (makeOrders.length) {
      linePrint(`order makes: ${makeOrders}`)
    }
  })
}

const createOrderParams = (side, flip, buyParams, sellParams) =>
  ((side === 'buy' && !flip) || (side === 'sell' && flip) ? buyParams : sellParams)

// Main logic for bot
const runLoop = async (switcheo, accounts, config, flipCreateParams = false) => {
  let res
  const { interval = 1000, orders } = cloneDeep(config)
  const createOrdersBuy = orders.create.buyParams
  const createOrdersSell = orders.create.sellParams

  const createOrderOptions = { num: 2 }

  res = await createOrder({ switcheo, account: accounts[0] },
    ...createOrderParams('buy', flipCreateParams, createOrdersBuy, createOrdersSell), createOrderOptions)
  printOrders(res)
  await sleep(100)

  res = await createOrder({ switcheo, account: accounts[1] },
    ...createOrderParams('sell', flipCreateParams, createOrdersBuy, createOrdersSell), createOrderOptions)
  printOrders(res)
  await sleep(100)

  await sleep(interval)
  await runLoop(switcheo, accounts, config, !flipCreateParams)
}

export default runLoop
