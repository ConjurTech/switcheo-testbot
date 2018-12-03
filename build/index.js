'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _switcheoJs = require('switcheo-js');

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _lodash = require('lodash');

var _runSingleTest = require('./runSingleTest');

var _runSingleTest2 = _interopRequireDefault(_runSingleTest);

var _runLoopTest = require('./runLoopTest');

var _runLoopTest2 = _interopRequireDefault(_runLoopTest);

var _runBalanceCheck = require('./runBalanceCheck');

var _runBalanceCheck2 = _interopRequireDefault(_runBalanceCheck);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

global.Promise = _bluebird2.default;
// http://bluebirdjs.com/docs/api/promise.config.html
global.Promise.config({ longStackTraces: true });

const checkPrivateKeys = (env, wallets) => {
  const someMissingKeys = (0, _lodash.some)(wallets, wallet => !env[wallet]);
  if (someMissingKeys) throw new Error('Some private key not found. See README.md');
};
const checkWalletLength = (wallets, length) => {
  if (wallets.length < length) throw new Error(`Need at least ${length} wallets. See README.md`);
};

// eslint-disable-next-line global-require
const getConfig = env => env.LOCAL ? require('./.config.local') : require('./config');

const initialise = (env, { minAccounts = 1 }) => {
  const { wallets } = getConfig(env);
  const switcheo = new _switcheoJs.Client({
    net: 'TestNet'
  });

  checkPrivateKeys(env, wallets);
  checkWalletLength(wallets, minAccounts);
  const accounts = wallets.map(wallet => new _switcheoJs.Account({ blockchain: 'neo', provider: new _switcheoJs.NeoPrivateKeyProvider(env[wallet]) }));

  return [switcheo, accounts];
};

// Main Method
const runTest = (() => {
  var _ref = _asyncToGenerator(function* (env) {
    const { bot } = getConfig(env);

    const isSingleRun = bot && bot.single && bot.single.run;
    const isLoopRun = bot && bot.loop && bot.loop.run;
    if (!isSingleRun && !isLoopRun) return;

    const [switcheo, accounts] = initialise(env, { minAccounts: isSingleRun ? 1 : 2 });
    if (isSingleRun) {
      yield (0, _runSingleTest2.default)(switcheo, accounts, bot.single.commands);
    } else {
      // run bot
      const runnerConfig = {};
      yield (0, _runLoopTest2.default)(switcheo, accounts, bot.loop.config, runnerConfig);
    }
  });

  return function runTest(_x) {
    return _ref.apply(this, arguments);
  };
})();

const runChecks = (() => {
  var _ref2 = _asyncToGenerator(function* (env) {
    const [switcheo, accounts] = initialise(env, { minAccounts: 1 });
    yield (0, _runBalanceCheck2.default)(switcheo, accounts);
  });

  return function runChecks(_x2) {
    return _ref2.apply(this, arguments);
  };
})();

exports.default = (() => {
  var _ref3 = _asyncToGenerator(function* (env) {
    try {
      yield runTest(env);
      yield runChecks(env);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  });

  return function (_x3) {
    return _ref3.apply(this, arguments);
  };
})();