'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.asyncErrorHandler = exports.sleep = exports.linePrint = exports.actPrinter = exports.toNeoAssetAmount = undefined;

var _bignumber = require('bignumber.js');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const NEO_ASSET_PRECISION = 8;

const toNeoAssetAmount = exports.toNeoAssetAmount = value => {
  const bigNumber = new _bignumber.BigNumber(value);
  return bigNumber.times(Math.pow(10, NEO_ASSET_PRECISION)).toFixed(0);
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

const asyncErrorHandler = exports.asyncErrorHandler = (() => {
  var _ref = _asyncToGenerator(function* (run) {
    try {
      return run();
    } catch (err) {
      console.error(err);
      throw new Error(err);
    }
  });

  return function asyncErrorHandler(_x) {
    return _ref.apply(this, arguments);
  };
})();