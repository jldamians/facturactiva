/**
 * @author jldamians <jlds161089@gmail.com>
 */

'use strict'

const url = require('url')

const config = require('./config')
const methods = require('./methods')


/**
 * Invoca la WS para la emisión de comprobantes
 * @param {string} documentInformation
 * @param {any} credentials
 */
const _documentsEmission = async (documentInformation, credentials) => {
  const authorization = `Bearer ${credentials}`

  const documentsEmissionWS = url.resolve(config.server, '/emission/documents')

  return await methods.invokePostMethod(documentsEmissionWS, authorization, documentInformation)
}


exports.documentsEmission = _documentsEmission