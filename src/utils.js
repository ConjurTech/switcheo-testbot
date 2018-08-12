import { BigNumber } from 'bignumber.js'

const NEO_ASSET_PRECISION = 8

export const toNeoAssetAmount = (value) => {
  const bigNumber = new BigNumber(value)
  return bigNumber.times(10 ** NEO_ASSET_PRECISION).toFixed(0)
}

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

export const asyncErrorHandler = async (run) => {
  try {
    return run()
  } catch (err) {
    console.error(err)
    throw new Error(err)
  }
}
