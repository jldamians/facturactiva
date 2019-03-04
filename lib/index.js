'use strict'

const cpe = require('./cpeEmission')

function Electronic(token, payload = null) {
	let _args = {
		payload,
		token
	}

  Object.defineProperty(this, 'payload', {
    get: () => { return _args.information.payload },
    set: (value) => { _args.information.payload = value }
  })

  Object.defineProperty(this, 'token', {
    get: () => { return _args.information.token },
    set: (value) => { _args.information.token = value }
  })

  Object.defineProperty(this, 'response', {
    get: () => { return _args.information.response },
    set: (value) => { _args.information.response = value }
  })
}

Electronic.prototype.emit = async function(payload = null) {
	const _success = _success.bind(this)

	const _failure = _failure.bind(this)

  if (payload != null) {
    this.payload = payload
  }

  if (this.payload == null) {
    throw new Error('No se ha ingresado el cpe')
  }

  if (this.token == null) {
    throw new Error('No se ha ingresado el token')
  }

	try {
		this.response = await cpe.documentsEmission(this.payload, this.token)

		if (_success() === true) {
			return {
        emissionState: '',
        sunatInternalError: false,
				forwardEnabled: false
			}
		} else if (_failure() === true) {

		} else {

		}
	} catch (e) {
		throw e
	}
}

// Estos códigos corresponden a los errores internos de SUNAT,
// los cuales nos servirán para gestionar los reenvios en caso de excepciones
Electronic.prototype.SUNAT_INTERNAL_ERROR_CODES = [
  '0100', // El sistema no puede responder su solicitud. Intente nuevamente o comuníquese con su Administrador
  // El sistema no puede responder su solicitud.
  '0109', // (El servicio de autenticación no está disponible)
  '0130', // (No se pudo obtener el ticket de proceso)
  '0131', // (No se pudo grabar el archivo en el directorio)
  '0132', // (No se pudo grabar escribir en el archivo zip)
  '0133', // (No se pudo grabar la entrada del log)
  '0134', // (No se pudo grabar en el storage)
  '0135', // (No se pudo encolar el pedido)
  '0136', // (No se pudo recibir una respuesta del batch)
  '0137', // (Se obtuvo una respuesta nula)
  '0138', // (Error en Base de Datos)
  // No se pudo procesar su solicitud.
  '0200', // (Ocurrio un error en el batch)
  '0201', // (Llego un requerimiento nulo al batch)
  '0202', // (No llego información del archivo ZIP)
  '0203', // (No se encontro archivos en la informacion del archivo ZIP)
  '0204', // (Este tipo de requerimiento solo acepta 1 archivo)
  '0250', // (Ocurrio un error desconocido al hacer unzip)
  '0251', // (No se pudo crear un directorio para el unzip)
  '0252', // (No se encontro archivos dentro del zip)
  '0253' // (No se pudo comprimir la constancia)
]

function _sunatInternalError() {
  const _failure = _failure.bind(this)

  let exception

	let sunatInternalError

  if (_failure() === true) {
    exception = this.response.errors[0]

    // Estos son errores que emite sunat tras las validaciones
    // que realiza en el proceso de recepción de los cpe's
    if (exception.code === '72') {
      // Cuando exista un error interno en los ws de sunat,
      // tendremos que indicar que el cpe deberá ser reenviado

      // Referencia de Errores: Manual del Programador - SUNAT
      // 1033: El comprobante fue registrado previamente con otros datos.

      // *** Escenario: Cuando se emite un comprobante y sunat lo acepta sin generar cdr,
      // *** factur@ctiva lo marca con estado envio erroneo, esto para que en los reenvios
      // *** el api primero realice la consulta del cdr antes de intentar emitirlo nuevamente.
      sunatInternalError = (
        exception.meta.hasOwnProperty('codigoErrorSUNAT') && (
          this.SUNAT_INTERNAL_ERROR_CODES.includes(exception.meta.codigoErrorSUNAT) ||
          exception.meta.codigoErrorSUNAT === '1033'
        )
      )

      return sunatInternalError
    } else {
      return false
    }
  } else {
    return false
  }
}

function _success() {
	return (
		this.response.hasOwnProperty('data') === true
	)
}

function _failure() {
	return (
		this.response.hasOwnProperty('errors') === true
	)
}

/**
 * Permite saber si el cpe ha sido aceptado por sunat (A, O y P)
 * @return {Boolean}
 */
function _isAccepted() {
	const _success = _success.bind(this)

	return _success() === true
}

/**
 * Permite saber si el cpe ha sido rechazado por sunat (R)
 * @return {Boolean}
 */
function _isRejected() {
  const _failure = _failure.bind(this)

  let exception

  if (_failure() === true) {
    exception = this.response.errors[0]

    // Estos son errores que emite sunat
    // al validar los cpe's emitidos
    if (exception.code === '72') {
      // Si "reenvioHabilitado" es "false" y/o "estadoEmision" es "R",
      // se entiende que el cpe ha sido "Rechazado" por sunat
      return (
        exception.meta.reenvioHabilitado === false || exception.meta.estadoEmision === 'R'
      )
    } else {
      return false
    }
  } else {
    return false
  }
}

/**
 * Permite saber si el cpe ha sido entregado a sunat,
 * es decir, si el cpe ha sido aceptado o rechazado
 * @return {Boolean}
 */
function _isDelivered() {
  const _isAccepted = _isAccepted.bind(this)

  const _isRejected = _isRejected.bind(this)

  return (
    _isAccepted() || _isRejected()
  )
}