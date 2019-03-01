/**
 * @author jldamians <jlds161089@gmail.com>
 */

'use strict'

const request = require('request')
const Promise = require('bluebird')

/**
 * Invoca una WS del API de Facturactiva
 * @param {string} ws dirección de la web service
 * @param {string} auth valor para la autorización
 * @param {object} data información que se emitirá
 */
const _invokePostMethod = (ws, auth, data) => {
  const options = {
    url: ws,
    body: data,
    json: true,
    headers: {
      'Authorization': auth,
    },
    timeout: 30000 // 30s
  }

  return new Promise((resolve, reject) => {
    request.post(options, (err, httpResponse, body) => {
      if (err) {
        reject(err)
      } else {
        resolve(body)
      }
    })
  })
}


module.exports = _invokePostMethod