import { Switcheo } from 'switcheo-js'
import { toNeoAssetAmount } from './utils'
import { listOrders, createOrders, filterOpenOrders, cancelAllOpenOrders } from './lib/orders'

// Load dotenv
require('dotenv').config()

// Main Method
const run = async () => {
  const switcheo = new Switcheo({
    net: 'TestNet',
    blockchain: 'neo',
  })


  console.log(process.env)

  const account = switcheo.createAccount({ privateKey: process.env.USER_1_PRIVATE_KEY })

  const orderParams = {
    pair: 'SWTH_NEO',
    blockchain: 'neo',
    side: 'buy',
    price: (0.00060008).toFixed(8),
    wantAmount: toNeoAssetAmount(16.83108918),
    useNativeTokens: true,
    orderType: 'limit',
  }

  // console.log(await listOrders(switcheo, account))

  createOrders(switcheo, account, orderParams, { numOfOrders: 2, cancelImmediately: false })
  // console.log(await cancelAllOpenOrders(switcheo, account))
}

run()
