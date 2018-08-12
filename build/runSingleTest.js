'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _utils = require('./utils');

var _lib = require('./lib');

var act = _interopRequireWildcard(_lib);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const enabledCommands = c => c.run;

const runSingleTest = (() => {
  var _ref = _asyncToGenerator(function* (switcheo, accounts, commands) {
    const account = accounts[0];

    commands.filter(enabledCommands).forEach((() => {
      var _ref2 = _asyncToGenerator(function* (command) {
        const { type, action, params = [], options = {} } = (0, _lodash.cloneDeep)(command);
        const res = yield act[type][action]({ switcheo, account }, ...params, options);
        if (options && options.print) {
          (0, _utils.actPrinter)(type, action, options, res);
        }
      });

      return function (_x4) {
        return _ref2.apply(this, arguments);
      };
    })());
  });

  return function runSingleTest(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
})();

exports.default = runSingleTest;