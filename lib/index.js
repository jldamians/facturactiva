'use strict'

const cpe = require('./cpeEmission')

function Electronic(credentials, payload = undefined) {
	let _args = {
		payload,
		credentials
	}

  Object.defineProperty(this, 'payload', {
    get: () => { return _args.information.payload },
    set: (value) => { _args.information.payload = value }
  })

  Object.defineProperty(this, 'credentials', {
    get: () => { return _args.information.credentials },
    set: (value) => { _args.information.credentials = value }
  })

  Object.defineProperty(this, 'response', {
    get: () => { return _args.information.response },
    set: (value) => { _args.information.response = value }
  })
}

