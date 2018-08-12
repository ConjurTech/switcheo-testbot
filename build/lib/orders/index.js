'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cancelAllOpen = exports.cancelAll = exports.cancel = exports.create = exports.list = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _filters = require('./filters');

Object.keys(_filters).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _filters[key];
    }
  });
});

var _bignumber = require('bignumber.js');

var _helper = require('./helper');

var _utils = require('../../utils');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const list = (() => {
  var _ref = _asyncToGenerator(function* ({ switcheo, account }) {
    const orders = yield switcheo.listOrders({ address: account.scriptHash, pair: 'SWTH_NEO' });
    return (0, _helper.sortOrdersByCreatedAt)(orders);
  });

  return function list(_x) {
    return _ref.apply(this, arguments);
  };
})();

const makeCreateParams = (_params, priceSteps) => {
  let params;
  let price = new _bignumber.BigNumber(_params.price);

  if (_params.side === 'buy') {
    // buy cheap first, then increase buy price in steps
    price = price.plus(priceSteps).toFixed(8, _bignumber.BigNumber.ROUND_DOWN);
    const offerAmount = new _bignumber.BigNumber(_params.offerAmount);
    const wantAmount = offerAmount.div(price).toFixed(8, _bignumber.BigNumber.ROUND_DOWN);

    params = _extends({}, _params, { price, wantAmount: (0, _utils.toNeoAssetAmount)(wantAmount) });
  } else {
    // sell expensive first, then decrease buy price in steps
    price = price.minus(priceSteps).toFixed(8, _bignumber.BigNumber.ROUND_DOWN);
    const wantAmount = new _bignumber.BigNumber(_params.wantAmount); // TODO: remove this

    params = _extends({}, _params, { price, wantAmount: (0, _utils.toNeoAssetAmount)(wantAmount) });
  }

  delete params.offerAmount;

  return params;
};

const create = (() => {
  var _ref2 = _asyncToGenerator(function* ({ switcheo, account }, orderParams, { num = 1, priceSteps = 0, parallel = false }) {
    // orderParams.price = (orderParams.price).toFixed(8) // eslint-disable-line no-param-reassign
    // orderParams.wantAmount = toNeoAssetAmount(orderParams.wantAmount) // eslint-disable-line no-param-reassign
    const deferredPromises = [];
    let orders = [];

    for (let i = 0; i < num; i++) {
      deferredPromises.push(_helper.deferredCreate.bind(null, switcheo, account, makeCreateParams(orderParams, priceSteps * i)));
    }

    if (parallel) {
      const promises = deferredPromises.map(function (p) {
        return p();
      });
      orders = yield Promise.all(promises);
      (0, _helper.printCreatedOrders)(orders);
    } else {
      for (let i = 0; i < deferredPromises.length; i++) {
        // eslint-disable-next-line no-await-in-loop
        const order = yield deferredPromises[i]();
        (0, _helper.printCreatedOrders)(orders);
        orders.push(order);
      }
    }

    return orders;
  });

  return function create(_x2, _x3, _x4) {
    return _ref2.apply(this, arguments);
  };
})();

const cancelOrder = ({ switcheo, account }, orderId) => switcheo.cancelOrder({ orderId }, account);

const cancelOrders = ({ switcheo, account }, orders = []) => orders.map(o => cancelOrder({ switcheo, account }, o.id));

const cancelAllOpenOrders = (() => {
  var _ref3 = _asyncToGenerator(function* ({ switcheo, account }) {
    const orders = yield list({ switcheo, account });
    const openOrders = (0, _filters.filterOpenOrders)(orders);

    return Promise.all(cancelOrders({ switcheo, account }, openOrders)).then(function (res) {
      return res.forEach(function (o) {
        return (0, _utils.linePrint)(`order canceled: ${o.id}`);
      });
    });
  });

  return function cancelAllOpenOrders(_x5) {
    return _ref3.apply(this, arguments);
  };
})();

// act.orders.*
exports.list = list;
exports.create = create;
exports.cancel = cancelOrder;
exports.cancelAll = cancelOrders;
exports.cancelAllOpen = cancelAllOpenOrders;