import { BigNumber } from 'bignumber.js'

export const filterOpenOrders = (orders) => orders.filter(o => o.status === 'processed'
  && o.makes.length
  && !(new BigNumber(o.makes.find(m => m.status !== 'expired').availableAmount)).eq(0)
)
export const filterFilledOnlyOrders = (orders) => orders.filter(o => o.status === 'processed' && o.makes.length === 0)
