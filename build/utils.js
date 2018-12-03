'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sleep = exports.linePrint = exports.actPrinter = exports.formatPrecision = undefined;

var _bignumber = require('bignumber.js');

const ASSET_PRECISION = 8;

const formatPrecision = exports.formatPrecision = value => new _bignumber.BigNumber(value).times(Math.pow(10, ASSET_PRECISION)).toFixed(0, _bignumber.BigNumber.ROUND_DOWN);

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