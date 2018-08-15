import { orderBy } from 'lodash'
import { linePrint } from '../../utils'

export const printCreatedOrders = (orders) => orders.forEach(o => linePrint(`order created: ${o.id}`))

export const sortOrdersByCreatedAt = (orders) => orderBy(orders, o => new Date(o.createdAt), 'desc')

// switcheo.saveOrder() has to be defered
export const deferredCreate = (switcheo, account, orderParams) => new Promise((resolve, reject) => {
  try {
    const order = switcheo.saveOrder(orderParams, account)

    resolve(order)
  } catch (err) {
    reject(err)
  }
})
