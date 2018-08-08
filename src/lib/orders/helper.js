import { orderBy } from 'lodash'

export const sortOrdersByCreatedAt = (orders) => orderBy(orders, o => new Date(o.createdAt), 'desc')
