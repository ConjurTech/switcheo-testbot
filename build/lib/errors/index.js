'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
const isInvalidSignatureError = exports.isInvalidSignatureError = err => {
  const invalidSignatureMessage = 'Invalid signature';

  if (err.message.includes(invalidSignatureMessage)) {
    console.warn('INVALID_SIGNATURE_ERROR');
    return true;
  }
  return false;
};

const isBidPriceInvalidError = exports.isBidPriceInvalidError = err => {
  const bidPriceInvalidMessage = 'Bid price must be lower than your open asks';

  if (err.message.includes(bidPriceInvalidMessage)) {
    console.warn('BID_PRICE_INVALID_ERROR');
    return true;
  }
  return false;
};

const isOrderTakenError = exports.isOrderTakenError = err => {
  const orderTakenMessage = 'One or more offers to be filled has already been taken.';

  if (err.message.includes(orderTakenMessage)) {
    console.warn('ORDER_TAKEN_ERROR');
    return true;
  }
  return false;
};

const isOrderFilledOrCancelledError = exports.isOrderFilledOrCancelledError = err => {
  const orderFilledOrCancelledMessage = 'Order has already been filled or cancelled.';

  if (err.message.includes(orderFilledOrCancelledMessage)) {
    console.warn('ORDER_FILLED_OR_CANCELLED_ERROR');
    return true;
  }
  return false;
};