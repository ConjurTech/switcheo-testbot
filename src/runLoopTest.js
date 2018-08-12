import { cloneDeep } from 'lodash'
import Chance from 'chance'
import { BigNumber } from 'bignumber.js'
import { sleep, linePrint } from './utils'
import * as act from './lib'
import { filterOpenOrders } from './lib/orders/filters'

const { isInvalidSignatureError, isBidPriceInvalidError,
  isOrderTakenError, isOrderFilledOrCancelledError } = act.errors

const seed = Math.floor(Math.random() * 10000)
const chance = new Chance(seed)

console.info(`Using seed: ${seed}`)

const listOrders = async (...params) => act.orders.list(...params)
const createOrder = async (...params) => act.orders.create(...params)
const cancelOrder = async (...params) => act.orders.cancel(...params)
// const cancelAllOrder = async (...params) => act.orders.cancelAll(...params)
const cancelAllOpenOrders = async (...params) => act.orders.cancelAllOpen(...params)
const clearOpenOrdersForAccounts = async (switcheo, accounts) => {
  try {
    // Cancel all existing open orders
    for (const account of accounts) {
      // eslint-disable-next-line no-await-in-loop
      await cancelAllOpenOrders({ switcheo, account })
    }
  } catch (err) {
    if (isInvalidSignatureError(err)) {
      await sleep(500) // courtesy wait
      await clearOpenOrdersForAccounts(switcheo, accounts)
    }
    throw new Error(err)
  }
}

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

// Set sellParams price to match
const createOrderParams = (side, flip, buyParams, sellParams, { num, priceSteps }) => {
  if (priceSteps) {
    // eslint-disable-next-line no-param-reassign
    sellParams[0].price = buyParams[0].price + (num - 1) * priceSteps
  }
  return ((side === 'buy' && !flip) || (side === 'sell' && flip) ? buyParams : sellParams)
}

const getRandomFloat = (base, range) =>
  chance.floating({ fixed: 8, min: base - range, max: base + range })

const formatRandomLoopRes = (results) =>
  results.map((result) => {
    const [action, params, res] = result
    if (action === 'buy' || action === 'sell') {
      const preppedRes = {}
      if (res[0] && res[0].id) {
        preppedRes.orderId = res[0].id
        preppedRes.makes = res[0].makes.length
        preppedRes.makeIds = res[0].makes.map(m => m.id)
        preppedRes.fills = res[0].fills.length
        preppedRes.fillIds = res[0].fills.map(f => f.id)
      } else {
        preppedRes.error = res.message
      }

      return { action, params: params[0], result: preppedRes }
    } else if (action === 'cancel') {
      const preppedRes = {}

      if (res.id) {
        preppedRes.orderId = res.id
      } else {
        preppedRes.error = res.message
      }

      return { action, params, result: preppedRes }
    }

    throw new Error('unknown action for formatRandomLoopRes')
  })

const runRandomLoop = async (switcheo, accounts, config, runnerConfig = {}) => {
  const { flipCreateParams = false } = runnerConfig
  const { randomLength = 1, orders } = cloneDeep(config)

  const promises = []
  for (let i = 0; i < randomLength; i++) {
    linePrint(`@@@ Random Length: ${i + 1} @@@`)
    const actions = ['buy', 'sell', 'cancel']
    const randomAction = chance.pickone(actions)
    const randomAccount = chance.pickone(accounts)

    try {
      if (randomAction === 'buy' || randomAction === 'sell') {
        const randomPrice = new BigNumber(getRandomFloat(orders.create.buyParams[0].price, orders.create.priceRange))
        const randomOfferAmount = new BigNumber(
          getRandomFloat(orders.create.buyParams[0].offerAmount, orders.create.amountRange))

        const createOrderOptions = { num: 1 }
        const createOrdersBuy = cloneDeep(orders.create.buyParams)
        const buyWant = randomOfferAmount.div(randomPrice).toFixed(8, BigNumber.ROUND_DOWN)
        const sellWant = randomOfferAmount.toFixed(8, BigNumber.ROUND_DOWN)

        createOrdersBuy[0].price = randomPrice.toFixed(8, BigNumber.ROUND_DOWN)
        createOrdersBuy[0].wantAmount = buyWant
        createOrdersBuy[0].offerAmount = sellWant

        const createOrdersSell = cloneDeep(orders.create.sellParams)
        createOrdersSell[0].price = randomPrice.toFixed(8, BigNumber.ROUND_DOWN)
        createOrdersSell[0].wantAmount = sellWant
        createOrdersSell[0].offerAmount = buyWant

        const promise = new Promise((resolve) => {
          const orderParams = createOrderParams(
            randomAction, flipCreateParams, createOrdersBuy, createOrdersSell, createOrderOptions)
          createOrder({ switcheo, account: randomAccount }, ...orderParams, orderParams)
            .then(res => resolve([randomAction, orderParams, res]))
            .catch(err => resolve([randomAction, orderParams, err]))
        })
        promises.push(promise)
      } else if (randomAction === 'cancel') {
        const account = randomAccount
        // eslint-disable-next-line no-await-in-loop
        const openOrders = filterOpenOrders(await listOrders({ switcheo, account }))
        if (!openOrders.length) continue

        const randomOrder = chance.pickone(openOrders)
        const orderId = randomOrder.id
        const promise = new Promise((resolve) => {
          cancelOrder({ switcheo, account }, orderId)
            .then(res => resolve([randomAction, { orderId }, res]))
            .catch(err => resolve([randomAction, { orderId }, err]))
        })
        promises.push(promise)
      } // Other random actions will be added to this if else
    } catch (err) {
      // ocassionally, verify_sig function from switcheo-api fails, we just continue
      if (isInvalidSignatureError(err)) {
        // continue without throwing error
      } else if (isBidPriceInvalidError(err)) {
        // continue without throwing error
      } else {
        console.error('Run Random Loop Error')
        throw new Error(err)
      }
    }
  }

  const res = await Promise.all(promises)
  linePrint('Random Loop Results:')
  console.info(JSON.stringify(formatRandomLoopRes(res), null, 2))
}

const runRaceLoop = async (switcheo, accounts, config, runnerConfig = {}) => {
  const { flipCreateParams = false } = runnerConfig
  const { interval = 1000, raceLength = 1, orders } = cloneDeep(config)

  linePrint(`@@@ Race Length: ${raceLength} @@@`)
  if (!raceLength) return

  try {
    let res
    const { priceSteps, num = 1 } = orders.create

    const createOrdersBuy = orders.create.buyParams
    const createOrdersSell = orders.create.sellParams
    const createOrderOptions = { num, priceSteps }

    res = await createOrder({ switcheo, account: accounts[0] },
      ...createOrderParams('buy', flipCreateParams, createOrdersBuy, createOrdersSell, createOrderOptions),
      { ...createOrderOptions, parallel: true }) // ideally, this account will always do makes
    printOrders(accounts[0], res)

    res = await createOrder({ switcheo, account: accounts[1] },
      ...createOrderParams('sell', flipCreateParams, createOrdersBuy, createOrdersSell, createOrderOptions),
      createOrderOptions)
    printOrders(accounts[1], res) // ideally, this account will always do fills
  } catch (err) {
    // ocassionally, verify_sig function from switcheo-api fails, so we try to run again
    if (isInvalidSignatureError(err)) {
      await sleep(500) // courtesy wait
      await runRaceLoop(switcheo, accounts, config, {
        ...runnerConfig,
        flipCreateParams, // don't flip, retry with same args again
      })
      return
    } else if (isOrderTakenError(err)) {
      // continue without throwing error
    } else if (isOrderFilledOrCancelledError(err)) {
      // continue without throwing error
    } else {
      console.error('Run Race Loop Error')
      throw new Error(err)
    }
  }

  // get rid of dust makes
  await clearOpenOrdersForAccounts(switcheo, accounts)

  // sleep and loop
  await sleep(interval)
  await runRaceLoop(switcheo, accounts, { ...config, raceLength: raceLength - 1 }, {
    ...runnerConfig,
    flipCreateParams: !flipCreateParams,
    hasClearedInitialOpenOrders: true,
  })
}

// Main logic for bot
const runLoopTest = async (switcheo, accounts, config, runnerConfig = {}) => {
  await clearOpenOrdersForAccounts(switcheo, accounts)

  await runRaceLoop(switcheo, accounts, config, runnerConfig)
  await runRandomLoop(switcheo, accounts, config, runnerConfig)

  await clearOpenOrdersForAccounts(switcheo, accounts)
}

export default runLoopTest
