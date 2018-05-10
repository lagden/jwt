/**
 * Módulo JWT
 * @module index
 */

'use strict'

const {jws: {JWS}} = require('jsrsasign')
const uuidv4 = require('uuid/v4')
const uuidv5 = require('uuid/v5')
const debug = require('@tadashi/debug')('tadashi-jwt')
const {matchClaims, parseJWT} = require('./lib/util')

/**
 * Environment variables
 * @constant {string}  [TADASHI_ALG='HS512']                                        - Algoritimo utilizado
 * @constant {string}  [TADASHI_ALG_ACCEPTABLE='HS512 HS256']                       - Tipos de algoritimos aceitos na validação do JWT
 * @constant {string}  [TADASHI_SECRET_KEY_JWT='de66bd178d5abc9e848787b678f9b613']  - Segredo utilizado na geração e validação do JWT
 */
const {
	TADASHI_ALG = 'HS512',
	TADASHI_ALG_ACCEPTABLE = 'HS512 HS256',
	TADASHI_SECRET_KEY_JWT = 'de66bd178d5abc9e848787b678f9b613'
} = process.env

const alg = TADASHI_ALG
const algs = TADASHI_ALG_ACCEPTABLE

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
 * @param {(object|string)} payload                 - Carga de dados
 * @param {object} [options={}]                     - Opções
 * @param {number} [options.duration=0]             - Tempo de vida do JWT (em segundos)
 * @param {string} [options.iss]                    - Identificador do servidor ou sistema que emite o JWT
 * @param {string} [options.aud]                    - Identifica os destinatários deste JWT
 * @param {string} [options.sub]                    - Identificador do usuário que este JWT representa
 * @param {string} [options.jti]                    - JWT ID
 * @param {string} [secret=TADASHI_SECRET_KEY_JWT]  - Segredo para gerar o JWT
 * @returns {string} JWT
 */
function sign(payload, options = {}, secret = TADASHI_SECRET_KEY_JWT) {
	const {duration = 0} = options
	const _claims = ['jti', 'iss', 'aud', 'sub']
	const _header = {alg, typ: 'JWT'}

	const tNow = Math.floor(Date.now() / 1000)
	const tEnd = tNow + duration
	const _payload = Object.create(null)

	Object.keys(options).forEach(k => {
		if (_claims.includes(k)) {
			_payload[k] = options[k]
		}
	})

	if (duration > 0) {
		_payload.exp = tEnd
	}

	_payload.jti = _payload.jti || _jti()
	_payload.iat = tNow
	_payload.nbf = tNow
	_payload.data = payload

	const sHeader = JSON.stringify(_header)
	const sPayload = JSON.stringify(_payload)
	const sSecret = {utf8: secret}
	return JWS.sign(alg, sHeader, sPayload, sSecret)
}

/**
 * Verifica se o JWT é válido
 *
 * @param {string} jwt           - JWT (JSON Web Token)
 * @param {object} [options={}]  - Opções (obligatory claims)
 * @returns {boolean}
 */
function verify(jwt, options = {}, secret = TADASHI_SECRET_KEY_JWT) {
	try {
		const sSecret = {utf8: secret}
		const fields = Object.keys(options)
		const claims = Object.create(null)
		fields.forEach(k => {
			claims[k] = options[k].split(' ')
		})
		claims.alg = algs.split(' ')
		if (matchClaims(jwt, fields)) {
			return JWS.verifyJWT(jwt, sSecret, claims)
		}
		return false
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
		return parseJWT(jwt)
	} catch (err) {
		debug.error('parseJWT', err.message)
		return null
	}
}

exports.sign = sign
exports.verify = verify
exports.parse = parse
