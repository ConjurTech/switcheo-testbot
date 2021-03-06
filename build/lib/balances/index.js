"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const list = (() => {
  var _ref = _asyncToGenerator(function* ({ switcheo, account }) {
    return switcheo.getBalances(account);
  });

  return function list(_x) {
    return _ref.apply(this, arguments);
  };
})();

exports.list = list;