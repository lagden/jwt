/**
 * Módulo JWT
 * @module jwt
 */

import process from 'node:process'
import {TextDecoder} from 'node:util'
import {Buffer} from 'node:buffer'
import {createSecretKey, KeyObject} from 'node:crypto'
import {SignJWT, jwtVerify, base64url} from 'jose'
import hexID from '@tadashi/hex-id'
import debug from 'debug'

const {decode} = base64url

const _error = debug('tadashi-jwt:error')
const _log = debug('tadashi-jwt:log')

const claimsMap = new Map()
claimsMap.set('iss', 'setIssuer')
claimsMap.set('sub', 'setSubject')
claimsMap.set('aud', 'setAudience')
claimsMap.set('exp', 'setExpirationTime')
claimsMap.set('nbf', 'setNotBefore')
claimsMap.set('iat', 'setIssuedAt')
claimsMap.set('jti', 'setJti')

/**
 * Environment variables
 * @constant {string}  [TADASHI_ALG='HS512']                                        - Algoritimo utilizado
 * @constant {string}  [TADASHI_SECRET_KEY_JWT='de66bd178d5abc9e848787b678f9b613']  - Segredo utilizado na geração e validação do JWT
 */
const {
	TADASHI_ALG = 'HS512',
	TADASHI_SECRET_KEY_JWT = 'a2e4822a98337283e39f7b60acf85ec9',
} = process.env

/**
 * Gera a chave
 *
 * @param {string} [secret=TADASHI_SECRET_KEY_JWT]  - Segredo para gerar o JWT
 * @returns {KeyObject} Retorna a chave criptografada
 */
function _generateKey(key = TADASHI_SECRET_KEY_JWT) {
	const secret = Buffer.alloc(64, 0x00)
	secret.write(key)
	return createSecretKey(secret)
}

/**
 * Gera uma assinatura JWT (JSON Web Token)
 *
 * @param {object}  payload                                    - Carga de dados
 * @param {object}  [options={}]                               - Opções
 * @param {number}  [options.useData=true]                     - Coloca o payload dentro da propriedade "data"
 * @param {string}  [options.iss]                              - Claim (https://tools.ietf.org/html/rfc7519#section-4.1.1)
 * @param {string}  [options.sub]                              - Claim (https://tools.ietf.org/html/rfc7519#section-4.1.2)
 * @param {string}  [options.aud]                              - Claim (https://tools.ietf.org/html/rfc7519#section-4.1.3)
 * @param {string|number}  [options.exp]                       - Claim (https://tools.ietf.org/html/rfc7519#section-4.1.4) (e.g., 2h or 5m)
 * @param {string|number}  [options.nbf]                       - Claim (https://tools.ietf.org/html/rfc7519#section-4.1.5)
 * @param {string|number}  [options.iat]                       - Claim (https://tools.ietf.org/html/rfc7519#section-4.1.6)
 * @param {string}  [options.jti]                              - Claim (https://tools.ietf.org/html/rfc7519#section-4.1.7)
 * @param {object}  [options.header={}]                        - Opções
 * @param {string}  [options.header.typ=JWT]                   - Tipo do token - Header (https://tools.ietf.org/html/rfc7519#section-5.1)
 * @param {string}  [options.header.alg=HS512]                 - Algoritimo utilizado para gerar o token
 * @param {string|KeyObject}  [secret=TADASHI_SECRET_KEY_JWT]  - Segredo de validação do token
 * @returns {string} JWT
 */
export async function sign(payload, options = {}, secret = TADASHI_SECRET_KEY_JWT) {
	const {
		useData = true,
		nbf,
		jti,
		header = {
			alg: TADASHI_ALG,
			typ: 'JWT',
		},
	} = options

	let _payload = {}

	if (useData) {
		_payload.data = {...payload}
	} else {
		_payload = {...payload}
	}

	if (jti === undefined) {
		options.jti = hexID()
	}

	if (nbf === undefined) {
		options.nbf = Math.floor(Date.now() / 1000) - 10
	}

	const jwtInstance = new SignJWT(_payload)
	for (const k of Object.keys(options)) {
		if (claimsMap.has(k)) {
			const m = claimsMap.get(k)
			jwtInstance[m](options[k])
		}
	}

	const _key = secret instanceof KeyObject ? secret : _generateKey(secret)
	const jwt = await jwtInstance
		.setProtectedHeader(header)
		.sign(_key)

	_log('header', header)
	_log('_key', _key)
	_log('_payload', _payload)

	return jwt
}

/**
 * Verifica se o JWT é válido
 *
 * É possível passar via `options` o `clockTolerance` - Diferença de tempo aceitável entre signatário e verificador em segundos
 *
 * @param {string} jwt                                        - JSON Web Token
 * @param {object} [options={}]                               - Opções (https://github.com/panva/jose/blob/main/docs/functions/jwt_verify.jwtVerify.md#readme)
 * @param {string|KeyObject} [secret=TADASHI_SECRET_KEY_JWT]  - Segredo para gerar o JWT
 * @returns {?object} O objeto completo ou null
 */
export async function verify(jwt, options = {}, secret = TADASHI_SECRET_KEY_JWT) {
	try {
		const _key = secret instanceof KeyObject ? secret : _generateKey(secret)
		const res = await jwtVerify(jwt, _key, options)
		return res
	} catch (error) {
		_error('verify', error.message)
	}
}

/**
 * Faz o parse do JWT (JSON Web Token)
 *
 * @param {string} jwt - JWT (JSON Web Token)
 * @returns {?object)} O objeto somente com a carga ou null
 */
export function parse(jwt) {
	try {
		const textDecoder = new TextDecoder()
		const payload = JSON.parse(textDecoder.decode(decode(jwt.split('.')[1])))
		return payload
	} catch (error) {
		_error('parse', error.message)
	}
}
