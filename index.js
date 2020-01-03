/**
 * Módulo JWT
 * @module index
 */

'use strict'

const {JWT, JWK} = require('jose')
const hexid = require('@tadashi/hex-id')
const debug = require('debug')

const _error = debug('tadashi-jwt:error')
const _log = debug('tadashi-jwt:log')

/**
 * Environment variables
 * @constant {string}  [TADASHI_ALG='HS512']                                        - Algoritimo utilizado
 * @constant {string}  [TADASHI_SECRET_KEY_JWT='de66bd178d5abc9e848787b678f9b613']  - Segredo utilizado na geração e validação do JWT
 */
const {
	TADASHI_ALG = 'HS512',
	TADASHI_SECRET_KEY_JWT = 'de66bd178d5abc9e848787b678f9b613'
} = process.env

/**
 * Gera uma assinatura JWT (JSON Web Token)
 *
 * @param {object}  payload                          - Carga de dados
 * @param {object}  [options={}]                     - Opções
 * @param {number}  [options.useData=true]           - Coloca o payload dentro da propriedade "data"
 * @param {string}  [options.iss]                    - Claim (https://tools.ietf.org/html/rfc7519#section-4.1.1)
 * @param {string}  [options.sub]                    - Claim (https://tools.ietf.org/html/rfc7519#section-4.1.2)
 * @param {string}  [options.aud]                    - Claim (https://tools.ietf.org/html/rfc7519#section-4.1.3)
 * @param {number}  [options.duration=0]             - Tempo de expiração (em segundos) (https://tools.ietf.org/html/rfc7519#section-4.1.4)
 * @param {number}  [options.ignoreNbf=false]        - Claim (https://tools.ietf.org/html/rfc7519#section-4.1.5)
 * @param {number}  [options.ignoreIat=false]        - Claim (https://tools.ietf.org/html/rfc7519#section-4.1.6)
 * @param {string}  [options.jti]                    - Claim (https://tools.ietf.org/html/rfc7519#section-4.1.7)
 * @param {string}  [options.typ=JWT]                - Tipo do token - Header (https://tools.ietf.org/html/rfc7519#section-5.1)
 * @param {string}  [options.alg=HS512]              - Algoritimo utilizado para gerar o token
 * @param {string}  [secret=TADASHI_SECRET_KEY_JWT]  - Segredo de validação do token
 * @returns {string} JWT
 */
function sign(payload, options = {}, secret = TADASHI_SECRET_KEY_JWT) {
	const {
		typ = 'JWT',
		alg = TADASHI_ALG,
		duration = 0,
		useData = true,
		ignoreNbf = false,
		ignoreIat = false
	} = options

	const tNow = Math.floor(Date.now() / 1000)
	const tEnd = tNow + duration

	let _payload = {}
	const _claims = ['jti', 'iss', 'aud', 'sub', 'iat']
	const _options = {
		algorithm: alg,
		header: {typ}
	}

	if (useData) {
		_payload.data = {...payload}
	} else {
		_payload = {...payload}
	}

	for (const k of Object.keys(options)) {
		if (_claims.includes(k)) {
			_payload[k] = options[k]
		}
	}

	if (duration > 0) {
		_payload.exp = tEnd
	}

	if (_payload.jti === true) {
		_payload.jti = hexid()
	}

	_options.ignoreIat = ignoreIat
	_options.ignoreNbf = ignoreNbf
	_options.algorithm = alg
	_options.header = {typ}

	const _key = JWK.asKey({
		kty: 'oct',
		k: secret
	})

	_log('sign -> _options', _options)

	return JWT.sign(_payload, _key, _options)
}

/**
 * Verifica se o JWT é válido
 *
 * É possível passar via `options` o `clockTolerance`  - Diferença de tempo aceitável entre signatário e verificador em segundos
 *
 * @param {string} jwt                                 - JSON Web Token
 * @param {object} [options={}]                        - Opções (https://github.com/panva/jose/blob/master/docs/README.md#jwtverifytoken-keyorstore-options)
 * @param {string} [secret=TADASHI_SECRET_KEY_JWT]     - Segredo para gerar o JWT
 * @returns {?object} O objeto completo ou null
 */
function verify(jwt, options = {}, secret = TADASHI_SECRET_KEY_JWT) {
	try {
		const _key = JWK.asKey({kty: 'oct', k: secret})
		return JWT.verify(jwt, _key, options)
	} catch (error) {
		_error('verify', error.message)
	}

	return null
}

/**
 * Faz o parse do JWT (JSON Web Token)
 *
 * @param {string} jwt - JWT (JSON Web Token)
 * @returns {?object)} O objeto somente com a carga ou null
 */
function parse(jwt) {
	try {
		return JWT.decode(jwt, {complete: false})
	} catch (error) {
		_error('parse', error.message)
	}

	return null
}

exports.sign = sign
exports.verify = verify
exports.parse = parse
