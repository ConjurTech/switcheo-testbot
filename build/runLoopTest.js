'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _lodash = require('lodash');

var _chance = require('chance');

var _chance2 = _interopRequireDefault(_chance);

var _bignumber = require('bignumber.js');

var _utils = require('./utils');

var _lib = require('./lib');

var act = _interopRequireWildcard(_lib);

var _filters = require('./lib/orders/filters');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const { isOrderTakenError, isOrderSpreadInvalidError, isOrderFilledOrCancelledError, isOwnOrderInvalidError } = act.errors;

const seed = Math.floor(Math.random() * 10000);
const chance = new _chance2.default(seed);

console.info(`Using seed: ${seed}`);

const listOrders = (() => {
  var _ref = _asyncToGenerator(function* (...params) {
    return act.orders.list(...params);
  });

  return function listOrders() {
    return _ref.apply(this, arguments);
  };
})();
const createOrder = (() => {
  var _ref2 = _asyncToGenerator(function* (...params) {
    return act.orders.create(...params);
  });

  return function createOrder() {
    return _ref2.apply(this, arguments);
  };
})();
const cancelOrder = (() => {
  var _ref3 = _asyncToGenerator(function* (...params) {
    return act.orders.cancel(...params);
  });

  return function cancelOrder() {
    return _ref3.apply(this, arguments);
  };
})();
// const cancelAllOrder = async (...params) => act.orders.cancelAll(...params)
const cancelAllOpenOrders = (() => {
  var _ref4 = _asyncToGenerator(function* (...params) {
    return act.orders.cancelAllOpen(...params);
  });

  return function cancelAllOpenOrders() {
    return _ref4.apply(this, arguments);
  };
})();
const clearOpenOrdersForAccounts = (() => {
  var _ref5 = _asyncToGenerator(function* (switcheo, accounts) {
    try {
      // Cancel all existing open orders
      for (const account of accounts) {
        // eslint-disable-next-line no-await-in-loop
        yield cancelAllOpenOrders({ switcheo, account });
      }
    } catch (err) {
      throw new Error(err);
    }
  });

  return function clearOpenOrdersForAccounts(_x, _x2) {
    return _ref5.apply(this, arguments);
  };
})();

const printOrders = (account, orders) => {
  orders.forEach(order => {
    const fillOrders = order.fills.map(f => f.id);
    const makeOrders = order.makes.map(m => m.id);
    if (fillOrders.length) {
      (0, _utils.linePrint)(`address: ${account.address.slice(0, 4)}, order fills: ${fillOrders}`);
    }

    if (makeOrders.length) {
      (0, _utils.linePrint)(`address: ${account.address.slice(0, 4)}, order makes: ${makeOrders}`);
    }
  });
};

// Set sellParams price to match
const createOrderParams = (side, flip, buyParams, sellParams, { num, priceSteps }) => {
  if (priceSteps) {
    // eslint-disable-next-line no-param-reassign
    sellParams[0].price = buyParams[0].price + (num - 1) * priceSteps;
  }
  return side === 'buy' && !flip || side === 'sell' && flip ? buyParams : sellParams;
};

const getRandomFloat = (base, range) => chance.floating({ fixed: 8, min: base - range, max: base + range });

const formatRandomLoopRes = results => results.map(result => {
  const [action, params, res] = result;
  if (action === 'buy' || action === 'sell') {
    const preppedRes = {};
    if (res[0] && res[0].id) {
      preppedRes.orderId = res[0].id;
      preppedRes.makes = res[0].makes.length;
      preppedRes.makeIds = res[0].makes.map(m => m.id);
      preppedRes.fills = res[0].fills.length;
      preppedRes.fillIds = res[0].fills.map(f => f.id);
    } else {
      preppedRes.error = res.message;
    }

    return { action, params: params[0], result: preppedRes };
  } else if (action === 'cancel') {
    const preppedRes = {};

    if (res.id) {
      preppedRes.orderId = res.id;
    } else {
      preppedRes.error = res.message;
    }

    return { action, params, result: preppedRes };
  }

  throw new Error('unknown action for formatRandomLoopRes');
});

const runRandomLoop = (() => {
  var _ref6 = _asyncToGenerator(function* (switcheo, accounts, config, runnerConfig = {}) {
    const { flipCreateParams = false } = runnerConfig;
    const { randomLength = 1, orders } = (0, _lodash.cloneDeep)(config);

    const promises = [];
    for (let i = 0; i < randomLength; i++) {
      (0, _utils.linePrint)(`@@@ Random Length: ${i + 1} @@@`);
      const actions = ['buy', 'sell', 'cancel'];
      const randomAction = chance.pickone(actions);
      const randomAccount = chance.pickone(accounts);

      try {
        if (randomAction === 'buy' || randomAction === 'sell') {
          const randomPrice = new _bignumber.BigNumber(getRandomFloat(orders.create.buyParams[0].price, orders.create.priceRange)).toFixed(6, _bignumber.BigNumber.ROUND_DOWN);
          const randomQuantity = new _bignumber.BigNumber(getRandomFloat(orders.create.buyParams[0].quantity, orders.create.amountRange)).toFixed(2, _bignumber.BigNumber.ROUND_DOWN);

          const createOrderOptions = { num: 1 };
          const createOrdersBuy = (0, _lodash.cloneDeep)(orders.create.buyParams);

          createOrdersBuy[0].price = randomPrice;
          createOrdersBuy[0].quantity = randomQuantity;

          const createOrdersSell = (0, _lodash.cloneDeep)(orders.create.sellParams);
          createOrdersSell[0].price = randomPrice;
          createOrdersSell[0].quantity = randomQuantity;

          const promise = new Promise(function (resolve) {
            const orderParams = createOrderParams(randomAction, flipCreateParams, createOrdersBuy, createOrdersSell, createOrderOptions);
            createOrder({ switcheo, account: randomAccount }, ...orderParams, orderParams).then(function (res) {
              return resolve([randomAction, orderParams, res]);
            }).catch(function (err) {
              return resolve([randomAction, orderParams, err]);
            });
          });
          promises.push(promise);
        } else if (randomAction === 'cancel') {
          const account = randomAccount;
          // eslint-disable-next-line no-await-in-loop
          const openOrders = (0, _filters.filterOpenOrders)((yield listOrders({ switcheo, account })));
          if (!openOrders.length) continue;

          const randomOrder = chance.pickone(openOrders);
          const orderId = randomOrder.id;
          const promise = new Promise(function (resolve) {
            cancelOrder({ switcheo, account }, orderId).then(function (res) {
              return resolve([randomAction, { orderId }, res]);
            }).catch(function (err) {
              return resolve([randomAction, { orderId }, err]);
            });
          });
          promises.push(promise);
        } // Other random actions will be added to this if else
      } catch (err) {
        throw new Error(err);
      }
    }

    const res = yield Promise.all(promises);
    (0, _utils.linePrint)('Random Loop Results:');
    console.info(JSON.stringify(formatRandomLoopRes(res), null, 2));
  });

  return function runRandomLoop(_x3, _x4, _x5) {
    return _ref6.apply(this, arguments);
  };
})();

const runRaceLoop = (() => {
  var _ref7 = _asyncToGenerator(function* (switcheo, accounts, config, runnerConfig = {}) {
    const { flipCreateParams = false } = runnerConfig;
    const { interval = 1000, raceLength = 1, orders } = (0, _lodash.cloneDeep)(config);

    (0, _utils.linePrint)(`@@@ Race Length: ${raceLength} @@@`);
    if (!raceLength) return;

    try {
      let res;
      const { priceSteps, num = 1 } = orders.create;

      const createOrdersBuy = orders.create.buyParams;
      const createOrdersSell = orders.create.sellParams;
      const createOrderOptions = { num, priceSteps };

      res = yield createOrder({ switcheo, account: accounts[0] }, ...createOrderParams('buy', flipCreateParams, createOrdersBuy, createOrdersSell, createOrderOptions), _extends({}, createOrderOptions, { parallel: true })); // ideally, this account will always do makes
      printOrders(accounts[0], res);

      res = yield createOrder({ switcheo, account: accounts[1] }, ...createOrderParams('sell', flipCreateParams, createOrdersBuy, createOrdersSell, createOrderOptions), createOrderOptions);
      printOrders(accounts[1], res); // ideally, this account will always do fills
    } catch (err) {
      if (isOrderTakenError(err) || isOrderFilledOrCancelledError(err) || isOwnOrderInvalidError(err) || isOrderSpreadInvalidError(err)) {
        // continue without throwing for known race errors that can occur,
        // as we are simply spamming trades and checking balance at the end.
        console.info('Known race error occured.');
      } else {
        throw new Error(err);
      }
    }

    // sleep and loop
    yield (0, _utils.sleep)(interval);
    yield runRaceLoop(switcheo, accounts, _extends({}, config, { raceLength: raceLength - 1 }), _extends({}, runnerConfig, {
      flipCreateParams: !flipCreateParams,
      hasClearedInitialOpenOrders: true
    }));
  });

  return function runRaceLoop(_x6, _x7, _x8) {
    return _ref7.apply(this, arguments);
  };
})();

// Main logic for bot
const runLoopTest = (() => {
  var _ref8 = _asyncToGenerator(function* (switcheo, accounts, config, runnerConfig = {}) {
    yield clearOpenOrdersForAccounts(switcheo, accounts);
    yield runRaceLoop(switcheo, accounts, config, runnerConfig);
    yield clearOpenOrdersForAccounts(switcheo, accounts);
    yield runRandomLoop(switcheo, accounts, config, runnerConfig);
    yield clearOpenOrdersForAccounts(switcheo, accounts);
  });

  return function runLoopTest(_x9, _x10, _x11) {
    return _ref8.apply(this, arguments);
  };
})();

exports.default = runLoopTest;