'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deferredCreate = exports.sortOrdersByCreatedAt = exports.printCreatedOrders = undefined;

var _lodash = require('lodash');

var _utils = require('../../utils');

const printCreatedOrders = exports.printCreatedOrders = orders => orders.forEach(o => (0, _utils.linePrint)(`order created: ${o.id}`));

const sortOrdersByCreatedAt = exports.sortOrdersByCreatedAt = orders => (0, _lodash.orderBy)(orders, o => new Date(o.createdAt), 'desc');

// switcheo.saveOrder() has to be defered
const deferredCreate = exports.deferredCreate = (switcheo, account, orderParams) => new Promise((resolve, reject) => {
  try {
    const order = switcheo.saveOrder(orderParams, account);

    resolve(order);
  } catch (err) {
    reject(err);
  }
});