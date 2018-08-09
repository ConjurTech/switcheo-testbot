import { BigNumber } from 'bignumber.js'

const NEO_ASSET_PRECISION = 8

export const toNeoAssetAmount = (value) => {
  const bigNumber = new BigNumber(value)
  return bigNumber.times(10 ** NEO_ASSET_PRECISION).toFixed(0)
}

export const actPrinter = (type, action, options, res) => {
  /* eslint-disable no-console */
  console.log(`---------------- Type: ${type} ----------------`)
  console.log(`---------------- Action: ${action} ----------------`)
  console.log('---------------- Options: ----------------')
  console.log(JSON.stringify(options, null, 2))
  console.log('---------------------------------------------')
  console.log(res)
  /* eslint-enable */
}

export const linePrint = (res) => {
  // eslint-disable-next-line no-console
  console.log(`--- ${res} ---`)
}

export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
