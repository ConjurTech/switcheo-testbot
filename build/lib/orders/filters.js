'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.filterFilledOnlyOrders = exports.filterOpenOrders = undefined;

var _bignumber = require('bignumber.js');

const filterOpenOrders = exports.filterOpenOrders = orders => orders.filter(o => o.status === 'processed' && o.makes.length && !new _bignumber.BigNumber(o.makes.find(m => m.status !== 'expired').available_amount).eq(0));
const filterFilledOnlyOrders = exports.filterFilledOnlyOrders = orders => orders.filter(o => o.status === 'processed' && o.makes.length === 0);