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

/**
 * Permite realizar la emisión del cpe
 * @return {Object}
 */
Electronic.prototype.emit = async function() {
  const _failure = _failure.bind(this)

  const _success = _success.bind(this)

  const _isRejected = _isRejected.bind(this)

  const _getFailureState = _getFailureState.bind(this)

  const _getSuccessState = _getSuccessState.bind(this)

  const _getFailureExceptions = _getFailureExceptions.bind(this)

  const _getSuccessObservations = _getSuccessObservations.bind(this)

  const _itsAnSunatInternalError = _isSunatInternalError.bind(this)

  const _getFacturactivaErrorCode = _getFacturactivaErrorCode.bind(this)

  if (this.payload == null) {
    throw new Error('No se ha ingresado el cpe')
  }

  if (this.token == null) {
    throw new Error('No se ha ingresado el token')
  }

	try {
    let result = null

		this.response = await cpe.documentsEmission(this.payload, this.token)

		if (_success() === true) {
      result = {
        data: {
          state: _getSuccessState(),
          delivered: _getSuccessState() === 'P' : false : true,
          observations: _getSuccessObservations()
        }
      }
		} else if (_failure() === true) {
      result = {
        error: {
          state: _getFailureState(),
          exceptions: _getFailureExceptions(),
          delivered: false,
          metadata: {
            forwardingEnabled: true,
          },
        }
      }

      switch (_getFacturactivaErrorCode()) {
        case '72':
          if (_isRejected() === true) {
            result.error.delivered = true

            result.error.metadata.forwardingEnabled = false
          } else if (_itsAnSunatInternalError() === true) {
            result.error.metadata.internalException = 'ose'
          }

          break;
        case '70':
          result.error.delivered = true

          result.error.metadata.forwardingEnabled = false

          break;
        case '90':
          result.error.metadata.internalException = 'pse'

          break;
      }
		} else {
      result = {
        error: {
          exceptions: [{
            message: JSON.stringify(this.response)
          }],
          delivered: false,
          metadata: {
            forwardingEnabled: true,
          },
        }
      }
		}

    return result
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

/**
 * Permite determinar si la excepción ha
 * sido generada por un error interno en el ose
 * @return {Boolean}
 */
function _itsAnSunatInternalError() {
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

/**
 * Permite determinar si la emisión ha sido exitosa
 * @return {Boolean}
 */
function _success() {
	return (
		this.response.hasOwnProperty('data') === true
	)
}

/**
 * Permite determinar si la emisión ha sido fallida
 * @return {Boolean}
 */
function _failure() {
	return (
		this.response.hasOwnProperty('errors') === true
	)
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
 * Permite obtener el código de la excepción definido por facturactiva
 * @return {String} código de excepción de facturactiva
 */
function _getFacturactivaErrorCode() {
  const _failure = _failure.bind(this)

  let exception

  if (_failure() === true) {
    exception = this.response.errors[0]

    return exception.code
  } else {
    return '-'
  }
}

/**
 * Permite obtener las observaciones de emisión del cpe
 * @return {Array} Observaciones de la emisión
 */
function _getSuccessObservations() {
  const _success = _success.bind(this)

  if (_success() === true) {
    return this.response.data.observaciones.map((observation) => {
      return {
        code: observation.codigo,
        message: observation.mensaje
      }
    })
  } else {
    return []
  }
}

/**
 * Permite obtener el estado de la emisión del cpe
 * cuando la emisión ha sido satisfactoria
 * @return {String} Estado de emisión del cpe
 */
function _getSuccessState() {
  const _success = _success.bind(this)

  if (_success() === true) {
    return this.response.data.estadoEmision
  } else {
    return ''
  }
}

/**
 * Permite obtener las excepciones de emisión del cpe
 * @return {Array} Excepciones de la emisión
 */
function _getFailureExceptions() {
  const _failure = _failure.bind(this)

  let exception

  if (_failure() === true) {
    exception = this.response.errors[0]

    if (exception.code === '72') {
      return [{
        code: exception.meta.codigoErrorSUNAT,
        message: exception.detail,
        type: 'ose'
      }]
    } else {
      return [{
        code: exception.code,
        message: exception.detail,
        type: 'pse'
      }]
    }
  } else {
    return []
  }
}

/**
 * Permite obtener el estado de emisión del cpe
 * cuando la emisión ha sido fallida
 * @return {String} Estado de emisión del cpe
 */
function _getFailureState() {
  const _failure = _failure.bind(this)

  let exception

  if (_failure() === true) {
    exception = this.response.errors[0]

    if (exception.code === '72') {
      return exception.meta.estadoEmision
    } else {
      return ''
    }
  } else {
    return ''
  }
}
