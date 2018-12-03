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
    const orders = yield switcheo.getOrders({ pair: 'NRVEP_NEO' }, account);
    return (0, _helper.sortOrdersByCreatedAt)(orders);
  });

  return function list(_x) {
    return _ref.apply(this, arguments);
  };
})();

const makeCreateParams = (params, priceSteps) => {
  if (params.side === 'buy') {
    // buy cheap first, then increase buy price in steps
    const price = new _bignumber.BigNumber(params.price).plus(priceSteps).toFixed(8, _bignumber.BigNumber.ROUND_DOWN);
    const quantity = (0, _utils.formatPrecision)(params.quantity);
    return _extends({}, params, { price, quantity });
  } else if (params.side === 'sell') {
    // sell expensive first, then decrease buy price in steps
    const price = new _bignumber.BigNumber(params.price).minus(priceSteps).toFixed(8, _bignumber.BigNumber.ROUND_DOWN);
    const quantity = (0, _utils.formatPrecision)(params.quantity);
    return _extends({}, params, { price, quantity });
  }
  throw new Error('Invalid side!');
};

const create = (() => {
  var _ref2 = _asyncToGenerator(function* ({ switcheo, account }, orderParams, { num = 1, priceSteps = 0, parallel = false }) {
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
    const promises = cancelOrders({ switcheo, account }, openOrders);

    return Promise.all(promises).then(function (res) {
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