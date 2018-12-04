import start from './src'

// This is used for development testing
// import startTest from './build' // to test dist
// import startTest from './src'
// require('./src')

// NOTE: This must be placed as high up as possible
// Load .dot file as environment variables
require('dotenv').config()

start(process.env)
