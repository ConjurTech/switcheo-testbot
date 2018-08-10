import { BigNumber } from 'bignumber.js'
import { sortOrdersByCreatedAt, deferredCreate, printCreatedOrders } from './helper'
import { filterOpenOrders } from './filters'
import { toNeoAssetAmount, linePrint } from '../../utils'

export * from './filters'

const list = async ({ switcheo, account }) => {
  const orders = await switcheo.listOrders({ address: account.scriptHash, pair: 'SWTH_NEO' })
  return sortOrdersByCreatedAt(orders)
}

const makeCreateParams = (_params, { i, length, priceSteps }) => {
  let params
  let price = new BigNumber(_params.price)

  if (_params.side === 'buy') {
    price = price.plus(priceSteps * i).toFixed(8, BigNumber.ROUND_DOWN)
    const offerAmount = new BigNumber(_params.offerAmount)
    const wantAmount = offerAmount.div(price).toFixed(8, BigNumber.ROUND_DOWN)

    params = { ..._params, price, wantAmount: toNeoAssetAmount(wantAmount) }
  } else {
    price = price.plus(priceSteps * (length - 1 - i)).toFixed(8, BigNumber.ROUND_DOWN)
    const wantAmount = new BigNumber(_params.wantAmount)

    params = { ..._params, price, wantAmount: toNeoAssetAmount(wantAmount) }
  }

  delete params.offerAmount

  return params
}

const create = async ({ switcheo, account }, orderParams,
  { num = 1, priceSteps = 0, parallel = false }) => {
  // orderParams.price = (orderParams.price).toFixed(8) // eslint-disable-line no-param-reassign
  // orderParams.wantAmount = toNeoAssetAmount(orderParams.wantAmount) // eslint-disable-line no-param-reassign
  const deferredPromises = []
  let orders = []

  for (let i = 0; i < num; i++) {
    deferredPromises.push(deferredCreate.bind(null, switcheo, account,
      makeCreateParams(orderParams, { i, length: num, priceSteps })))
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

const cancelOrder = (switcheo, account, orderId) =>
  switcheo.cancelOrder({ orderId }, account)
const cancelOrders = (switcheo, account, orders = []) =>
  orders.map(o => cancelOrder(switcheo, account, o.id))

const cancelAllOpenOrders = async ({ switcheo, account }) => {
  const orders = await list({ switcheo, account })
  const openOrders = filterOpenOrders(orders)

  return Promise.all(cancelOrders(switcheo, account, openOrders)).then((res) =>
    res.forEach(o => linePrint(`order canceled: ${o.id}`))
  )
}

// act.orders.*
export {
  list,
  create,
  cancelAllOpenOrders as cancelAllOpen,
}
