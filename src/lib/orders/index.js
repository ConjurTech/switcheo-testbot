import { sortOrdersByCreatedAt } from './helper'
import { filterOpenOrders } from './filters'
import { toNeoAssetAmount, linePrint } from '../../utils'

export * from './filters'

const list = async ({ switcheo, account }) => {
  const orders = await switcheo.listOrders({ address: account.scriptHash, pair: 'SWTH_NEO' })
  return sortOrdersByCreatedAt(orders)
}

const create = ({ switcheo, account }, orderParams, { num = 1, cancelImmediately = false }) => {
  orderParams.price = (orderParams.price).toFixed(8) // eslint-disable-line no-param-reassign
  orderParams.wantAmount = toNeoAssetAmount(orderParams.wantAmount) // eslint-disable-line no-param-reassign
  for (let i = 0; i < num; i++) {
    switcheo.createOrder(orderParams, account).then(order => {
      linePrint(`order created: ${order.id}`)

      if (cancelImmediately) {
        cancelOrder(switcheo, account, order.id).then(res => linePrint(`order canceled: ${res.id}`))
      }
    })
  }
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
