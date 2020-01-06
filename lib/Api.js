'use strict';

const url = require('url');

const Http = require('./Http');

//const config = require('./config');

class Api extends Http {
  constructor(server = null) {
    super();

    this._server = server;
  }

  /**
   * Emitir documentos electrónicos
   * @param {string} token
   * @param {object} body
   */
  async documents(token, body) {
    this._url = url.resolve(this._server, '/emission/documents');

    this._auth = `Bearer ${token}`;

    this._body = body;

    return await this.post();
  }

  /**
   * Emitir anulaciones y resúmenes
   * @param {string} token
   * @param {object} body
   */
  async summaries(token, body) {
    this._url = url.resolve(this._server, '/emission/summaries');

    this._auth = `Bearer ${token}`;

    this._body = body;

    return await this.post();
  }

  /**
   * Obtener token de acceso
   * @param {string} key
   * @param {string} secret
   */
  async token(key, secret) {
    const credentials = new Buffer(`${key}:${secret}`);

    this._url = url.resolve(this._server, '/oauth2/token');

    this._auth = `Basic ${credentials.toString('base64')}`;

    this._body = {
      grant_type: 'client_credentials',
    };

    return await this.post();
  }
}

module.exports = Api;
