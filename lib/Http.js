'use strict';

const request = require('request');

const Promise = require('bluebird');

class Http {
  constructor() {
    this._url = null;
    this._auth = null;
    this._body = null;

    this._json = true;
    this._timeout = 30000; // 30 seg
  }

  /**
   * Realizar petición POST
   */
  async post() {
    const options = {
      url: this._url,
      body: this._body,
      json: this._json,
      headers: {
        'Authorization': this._auth,
      },
      timeout: this._timeout,
    };

    return new Promise((resolve, reject) => {
      request.post(options, (error, response, body) => {
        if (!!error === true) {
          reject(error);
        } else {
          resolve(response.toJSON());
        }
      });
    });
  }
}

module.exports = Http;
