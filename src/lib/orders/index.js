import { BigNumber } from 'bignumber.js'
import { sortOrdersByCreatedAt, deferredCreate, printCreatedOrders } from './helper'
import { filterOpenOrders } from './filters'
import { formatPrecision, linePrint } from '../../utils'

export * from './filters'

const list = async ({ switcheo, account }) => {
  const orders = await switcheo.getOrders({ pair: 'NRVEP_NEO' }, account)
  return sortOrdersByCreatedAt(orders)
}

const makeCreateParams = (params, priceSteps) => {
  if (params.side === 'buy') {
    // buy cheap first, then increase buy price in steps
    const price = new BigNumber(params.price).plus(priceSteps).toFixed(8, BigNumber.ROUND_DOWN)
    const quantity = formatPrecision(params.quantity)
    return { ...params, price, quantity }
  } else if (params.side === 'sell') {
    // sell expensive first, then decrease buy price in steps
    const price = new BigNumber(params.price).minus(priceSteps).toFixed(8, BigNumber.ROUND_DOWN)
    const quantity = formatPrecision(params.quantity)
    return { ...params, price, quantity }
  }
  throw new Error('Invalid side!')
}

const create = async ({ switcheo, account }, orderParams,
  { num = 1, priceSteps = 0, parallel = false }) => {
  const deferredPromises = []
  let orders = []

  for (let i = 0; i < num; i++) {
    deferredPromises.push(deferredCreate.bind(null, switcheo, account,
      makeCreateParams(orderParams, priceSteps * i)))
  }

  if (parallel) {
    const promises = deferredPromises.map(p => p())
    orders = await Promise.all(promises)
    printCreatedOrders(orders)
  } else {
    for (let i = 0; i < deferredPromises.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      const order = await deferredPromises[i]()
      printCreatedOrders(orders)
      orders.push(order)
    }
  }

  return orders
}

const cancelOrder = ({ switcheo, account }, orderId) => switcheo.cancelOrder({ orderId }, account)

const cancelOrders = ({ switcheo, account }, orders = []) =>
  orders.map(o => cancelOrder({ switcheo, account }, o.id))

const cancelAllOpenOrders = async ({ switcheo, account }) => {
  const orders = await list({ switcheo, account })
  const openOrders = filterOpenOrders(orders)
  const promises = cancelOrders({ switcheo, account }, openOrders)

  return Promise.all(promises).then(res => res.forEach(o => linePrint(`order canceled: ${o.id}`)))
}

// act.orders.*
export {
  list,
  create,
  cancelOrder as cancel,
  cancelOrders as cancelAll,
  cancelAllOpenOrders as cancelAllOpen,
}
