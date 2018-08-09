const { sortOrdersByCreatedAt } = require('./helper')
const filters = require('./filters')
const { toNeoAssetAmount, linePrint } = require('../../utils')

const { filterOpenOrders } = filters

const list = async ({ switcheo, account }) => {
  const orders = await switcheo.listOrders({ address: account.scriptHash, pair: 'SWTH_NEO' })
  return sortOrdersByCreatedAt(orders)
}

const create = async ({ switcheo, account }, orderParams, { num = 1, cancelImmediately = false }) => {
  orderParams.price = (orderParams.price).toFixed(8) // eslint-disable-line no-param-reassign
  orderParams.wantAmount = toNeoAssetAmount(orderParams.wantAmount) // eslint-disable-line no-param-reassign
  const promises = []

  for (let i = 0; i < num; i++) {
    const promise = new Promise(async (resolve, reject) => {
      try {
        // eslint-disable-next-line no-await-in-loop
        let order = await switcheo.createOrder(orderParams, account)
        linePrint(`order created: ${order.id}`)

        if (cancelImmediately) {
          // eslint-disable-next-line no-await-in-loop
          order = await cancelOrder(switcheo, account, order.id)
          linePrint(`order canceled: ${order.id}`)
        }

        resolve(order)
      } catch (err) {
        reject(err)
      }
    })
    promises.push(promise)
  }

  const res = await Promise.all(promises)
  return res
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
module.exports = {
  ...filters,
  list,
  create,
  cancelAllOpen: cancelAllOpenOrders,
}
