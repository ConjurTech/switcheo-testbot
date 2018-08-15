'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sleep = exports.linePrint = exports.actPrinter = exports.toNeoAssetAmount = undefined;

var _bignumber = require('bignumber.js');

const NEO_ASSET_PRECISION = 8;

const toNeoAssetAmount = exports.toNeoAssetAmount = value => {
  const bigNumber = new _bignumber.BigNumber(value);
  return bigNumber.times(Math.pow(10, NEO_ASSET_PRECISION)).dp(0).toNumber();
};

const actPrinter = exports.actPrinter = (type, action, options, res) => {
  console.info(`---------------- Type: ${type} ----------------`);
  console.info(`---------------- Action: ${action} ----------------`);
  console.info('---------------- Options: ----------------');
  console.info(JSON.stringify(options, null, 2));
  console.info('---------------------------------------------');
  console.info(res);
};

const linePrint = exports.linePrint = res => {
  console.info(`--- ${res} ---`);
};

const sleep = exports.sleep = ms => new Promise(resolve => setTimeout(resolve, ms));