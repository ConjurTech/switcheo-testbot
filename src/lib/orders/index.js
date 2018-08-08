import { sortOrdersByCreatedAt } from './helper'
import { filterOpenOrders } from './filters'

export * from './filters'

export const listOrders = async (switcheo, account) => {
  const orders = await switcheo.listOrders({ address: account.scriptHash, pair: 'SWTH_NEO' })
  return sortOrdersByCreatedAt(orders)
}

export const createOrders = (switcheo, account, orderParams, { numOfOrders = 1, cancelImmediately = false }) => {
  for (let i = 0; i < numOfOrders; i++) {
    switcheo.createOrder(orderParams, account).then(order => {
      console.log(order.id)
      if (cancelImmediately) switcheo.cancelOrder({ orderId: order.id }, account).then(res => console.log(res))
    })
  }
}

const cancelOrders = (switcheo, account, orders = []) =>
  orders.map(o => switcheo.cancelOrder({ orderId: o.id }, account))

export const cancelAllOpenOrders = async (switcheo, account) => {
  const orders = await listOrders(switcheo, account)
  const openOrders = filterOpenOrders(orders)
  return Promise.all(cancelOrders(switcheo, account, openOrders))
}
