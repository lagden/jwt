/**
 * Módulo JWT
 * @module index
 */
'use strict'

const {jws: {JWS}} = require('jsrsasign')
const uuidv4 = require('uuid/v4')
const uuidv5 = require('uuid/v5')
const debug = require('@tadashi/debug')

const {
	TADASHI_SECRET_KEY_JWT = 'de66bd178d5abc9e848787b678f9b613',
	TADASHI_CLAIM_ISS = 'app:key',
	TADASHI_CLAIM_AUD = 'http://127.0.0.1',
	TADASHI_ALG = 'HS512'
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
 * Gera uma assinatura JWT (JSON Web Token)
 *
 * @param {(object|string)} payload - Carga de dados
 * @param {object} [options={}] - Opções
 * @param {number} [options.duration=0] - Tempo de duração do JWT em milisegundos
 * @param {string} [options.iss=app:key] - Identifica o app que fez a chamada
 * @param {string} [options.aud=http://127.0.0.1] - Identifica os destinatários para os quais o JWT se destina
 * @returns {string} JWT
 */
function sign(payload, options = {}) {
	const {duration = 0, iss = TADASHI_CLAIM_ISS, aud = TADASHI_CLAIM_AUD} = options
	const _header = {alg, typ: 'JWT'}

	const tNow = Date.now()
	const tEnd = tNow + duration
	const _payload = Object.create(null)

	_payload.iss = iss
	_payload.aud = aud
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
 * @param {string} jwt - JWT (JSON Web Token)
 * @param {string} iss - Identificação do app
 * @param {string} aud - Origem da chamada
 * @returns {boolean}
 */
function verify(jwt, iss, aud = '') {
	const _claims = Object.create(null)
	_claims.alg = [alg]
	_claims.verifyAt = Date.now()
	_claims.iss = [iss]
	_claims.aud = aud.split(',')
	try {
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
