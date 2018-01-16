/**
 * Módulo JWT
 * @module index
 */
'use strict'

const {jws: {JWS}} = require('jsrsasign')
const uuidv4 = require('uuid/v4')
const uuidv5 = require('uuid/v5')
const debug = require('@tadashi/debug')('tadashi-jwt')

/**
 * Environment variables
 * @constant {string}  [TADASHI_ALG='HS512']                                        - Algoritimo que será utilizado
 */

/**
 * Environment variables
 * @constant {string}  [TADASHI_SECRET_KEY_JWT='de66bd178d5abc9e848787b678f9b613']  - Segredo utilizado na geração e validação do JWT
 */
const {
	TADASHI_ALG = 'HS512',
	TADASHI_SECRET_KEY_JWT = 'de66bd178d5abc9e848787b678f9b613'
} = process.env

const secret = {utf8: TADASHI_SECRET_KEY_JWT}
const alg = TADASHI_ALG

/**
 * Helper para criação de um id único
 * @private
 *
 * @returns {string} UUID V5
 */
function _jti() {
	const NAMESPACE = uuidv4()
	return uuidv5(`tadashi_${Number(Date.now()).toString(26)}`, NAMESPACE)
}

/**
 * Helper para validar `aud`
 * @private
 *
 * @returns {string} aud
 */
function _checkAud(_aud, aud) {
	if (Array.isArray(_aud) && _aud.includes(aud)) {
		return _aud
	}
	return [aud]
}

/**
 * Gera uma assinatura JWT (JSON Web Token)
 *
 * @param {(object|string)} payload      - Carga de dados
 * @param {object} [options={}]          - Opções
 * @param {number} [options.duration=0]  - Tempo de duração do JWT em milisegundos
 * @param {string} [options.iss]         - Identifica o app que fez a chamada
 * @param {string} [options.aud]         - Identifica os destinatários para os quais o JWT se destina
 * @returns {string} JWT
 */
function sign(payload, options = {}) {
	const {duration = 0, iss, aud} = options
	const _header = {alg, typ: 'JWT'}

	const tNow = Date.now()
	const tEnd = tNow + duration
	const _payload = Object.create(null)

	if (iss) {
		_payload.iss = [iss]
	}

	if (aud) {
		_payload.aud = String(aud).split(', ')
	}

	_payload.nbf = tNow
	_payload.iat = tNow
	if (duration > 0) {
		_payload.exp = tEnd
	}
	_payload.jti = _jti()
	_payload.data = payload

	const sHeader = JSON.stringify(_header)
	const sPayload = JSON.stringify(_payload)
	return JWS.sign(alg, sHeader, sPayload, secret)
}

/**
 * Verifica se a assinatura JWT (JSON Web Token) é válida
 *
 * @param {string} jwt                  - JWT (JSON Web Token)
 * @param {object} [options={}]         - Opções
 * @param {string} [options.iss=false]  - Identifica o app que fez a chamada
 * @param {string} [options.aud=false]  - Origem da chamada
 * @returns {boolean}
 */
function verify(jwt, options = {}) {
	try {
		const {iss = false, aud = false} = options
		const {payloadObj: data} = parse(jwt)
		const {iss: _iss, aud: _aud} = data
		const _claims = Object.create(null)
		_claims.alg = [alg]
		_claims.verifyAt = Date.now()
		if (_iss) {
			_claims.iss = [iss]
		}
		if (_aud) {
			_claims.aud = _checkAud(_aud, aud)
		}
		return JWS.verifyJWT(jwt, secret, _claims)
	} catch (err) {
		debug.error('verifyJWT', err.message)
		return false
	}
}

/**
 * Faz o parse do JWT (JSON Web Token)
 *
 * @param {string} jwt - JWT (JSON Web Token)
 * @returns {?object} O objeto contendo o cabeçalho e carga de dados
 */
function parse(jwt) {
	try {
		return JWS.parse(jwt)
	} catch (err) {
		debug.error('parseJWT', err.message)
		return null
	}
}

exports.sign = sign
exports.verify = verify
exports.parse = parse
