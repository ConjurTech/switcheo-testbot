import { BigNumber } from 'bignumber.js'

const ASSET_PRECISION = 8

export const formatPrecision = (value) => (
  new BigNumber(value).times(10 ** ASSET_PRECISION).toFixed(0, BigNumber.ROUND_DOWN)
)

export const actPrinter = (type, action, options, res) => {
  console.info(`---------------- Type: ${type} ----------------`)
  console.info(`---------------- Action: ${action} ----------------`)
  console.info('---------------- Options: ----------------')
  console.info(JSON.stringify(options, null, 2))
  console.info('---------------------------------------------')
  console.info(res)
}

export const linePrint = (res) => {
  console.info(`--- ${res} ---`)
}

export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
