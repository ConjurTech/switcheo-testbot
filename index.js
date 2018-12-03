// This is used for development testing
// import startTest from './build' // to test dist
// import startTest from './src'
// require('./src')

// NOTE: This must be placed as high up as possible
// Load .dot file as environment variables
require('dotenv').config()

// Shim for trezor-connect in switcheo-js-dev
global.navigator = {}

const start = require('./src').default

start(process.env)
