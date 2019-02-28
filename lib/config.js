'use strict'

const config = require('./config.json')

const env = process.env.NODE_ENV || 'development'

const envConfig = config[env]

module.exports = envConfig