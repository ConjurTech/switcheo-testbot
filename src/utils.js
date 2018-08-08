const { BigNumber } = require('bignumber.js')

const NEO_ASSET_PRECISION = 8

export const toNeoAssetAmount = (value) => {
  const bigNumber = new BigNumber(value)
  const assetMultiplier = Math.pow(10, NEO_ASSET_PRECISION)
  return bigNumber.times(assetMultiplier).toFixed(0)
}
