/**
 * @author jldamians <jlds161089@gmail.com>
 */

'use strict'

const url = require('url')

const config = require('./config')
const methods = require('./methods')


/**
 * Invoca la WS para el canje de token
 * @param {string} clientKey
 * @param {string} clientSecret
 * @param {string} grantType
 */
const _tokenExchange = async (clientKey, clientSecret, grantType = 'client_credentials') => {
	const tokenExchangeWS = url.resolve(config.server, 'oauth2/token')

	const credentials = new Buffer(`${clientKey}:${clientSecret}`)

	const authorization = `Basic ${credentials.toString('base64')}`

	const args = {
	  grant_type: grantType
	}

	return await methods.invokePostMethod(tokenExchangeWS, authorization, args)
}


exports.tokenExchange = _tokenExchange