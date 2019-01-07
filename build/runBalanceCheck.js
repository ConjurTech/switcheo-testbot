'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lib = require('./lib');

var act = _interopRequireWildcard(_lib);

var _utils = require('./utils');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const getTotalConfirmingBalances = (() => {
  var _ref = _asyncToGenerator(function* (switcheo, accounts) {
    let totalConfirmingBalances = 0;
    for (let i = 0; i < accounts.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      const balances = yield act.balances.list({ switcheo, account: accounts[i] });
      const confirmingHash = (0, _lodash.mapValues)(balances.confirming, function (confirmings) {
        return confirmings.length;
      });
      totalConfirmingBalances += Object.values(confirmingHash).reduce(function (a, b) {
        return a + b;
      }, 0);
    }
    return totalConfirmingBalances;
  });

  return function getTotalConfirmingBalances(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

const runBalanceCheck = (() => {
  var _ref2 = _asyncToGenerator(function* (switcheo, accounts) {
    let now = new Date();
    const firstStartedAt = now;
    let lastStaleTotalConfirmingAt = now;
    let lastTotalConfirming = 0;

    lastTotalConfirming = yield getTotalConfirmingBalances(switcheo, accounts);

    (0, _utils.linePrint)(`Time started: ${firstStartedAt}`);
    (0, _utils.linePrint)(`Started with number of pending balances: ${lastTotalConfirming}`);

    while (lastTotalConfirming) {
      /* eslint-disable no-await-in-loop */
      yield (0, _utils.sleep)(5000);
      const totalConfirming = yield getTotalConfirmingBalances(switcheo, accounts);
      now = new Date();
      if (totalConfirming !== lastTotalConfirming) {
        lastStaleTotalConfirmingAt = now;
        lastTotalConfirming = totalConfirming;
      }
      const _2mins = 2 * 60 * 1000;
      if (now - lastStaleTotalConfirmingAt > _2mins) {
        // throw if waited more than 2 mins, for confirming balance change
        throw new Error('Waited more than 2mins to clear');
      }
      (0, _utils.linePrint)(`Currently waiting for total number of pending balances: ${lastTotalConfirming}`);
      /* eslint-enable */
    }

    (0, _utils.linePrint)(`Time started: ${firstStartedAt}`);
    (0, _utils.linePrint)(`Time ended: ${lastStaleTotalConfirmingAt}`);

    return true;
  });

  return function runBalanceCheck(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
})();

exports.default = runBalanceCheck;