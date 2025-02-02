/**
 * Módulo JWT
 * @module jwt
 */

import process from 'node:process'
import { TextDecoder } from 'node:util'
import { Buffer } from 'node:buffer'
import { createSecretKey, KeyObject } from 'node:crypto'
import { base64url, jwtVerify, SignJWT } from 'jose'
import hexID from '@tadashi/hex-id'
import debug from 'debug'

const { decode } = base64url

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

const { TADASHI_ALG = 'HS512', TADASHI_SECRET_KEY_JWT = 'a2e4822a98337283e39f7b60acf85ec9' } = process.env

/**
 * Generates a cryptographic key for signing JWTs.
 * @param {string} [key=TADASHI_SECRET_KEY_JWT] - The secret key to use.
 * @returns {KeyObject} - The generated secret key object.
 */
function _generateKey(key = TADASHI_SECRET_KEY_JWT) {
	const secret = Buffer.alloc(64, 0x00)
	secret.write(key)
	return createSecretKey(secret)
}

/**
 * Signs a payload creating a JWT.
 * @param {Object} payload - The payload to sign.
 * @param {Object} [options={}] - Options for the JWT.
 * @param {boolean} [options.useData=true] - Wrap payload in a data object.
 * @param {boolean|number} [options.nbf] - Not before claim.
 * @param {boolean|number|string} [options.jti] - JWT ID claim.
 * @param {Object} [options.header={alg: TADASHI_ALG, typ: 'JWT'}] - JWT header.
 * @param {string|KeyObject} [secret=TADASHI_SECRET_KEY_JWT] - Secret key for signing.
 * @returns {Promise<string>} - The signed JWT.
 */
export async function sign(payload, options = {}, secret = TADASHI_SECRET_KEY_JWT) {
	const {
		useData = true,
		nbf = true,
		jti = true,
		header = {
			alg: TADASHI_ALG,
			typ: 'JWT',
		},
	} = options

	const _payload = useData ? { data: { ...payload } } : { ...payload }

	if (jti) {
		options.jti = jti === true ? hexID() : jti
	}

	if (nbf) {
		options.nbf = nbf === true ? Math.floor(Date.now() / 1000) - 10 : nbf
	}

	const jwtInstance = new SignJWT(_payload)
	for (const k of Object.keys(options)) {
		if (claimsMap.has(k)) {
			const m = claimsMap.get(k)
			jwtInstance[m](options[k])
		}
	}

	const _key = secret instanceof KeyObject ? secret : _generateKey(secret)
	const jwt = await jwtInstance.setProtectedHeader(header).sign(_key)

	_log('header', header)
	_log('_payload', JSON.stringify(_payload, undefined, '  '))

	return jwt
}

/**
 * Verifies a JWT.
 * @param {string} jwt - The JWT to verify.
 * @param {Object} [options={}] - Verification options.
 * @param {string|KeyObject} [secret=TADASHI_SECRET_KEY_JWT] - Secret key for verification.
 * @returns {Promise<Object>} - The decoded and verified JWT payload.
 */
export function _verify(jwt, options = {}, secret = TADASHI_SECRET_KEY_JWT) {
	const _key = secret instanceof KeyObject ? secret : _generateKey(secret)
	return jwtVerify(jwt, _key, options)
}

/**
 * Asynchronously verifies a JWT and logs errors if verification fails.
 * @param {string} jwt - The JWT to verify.
 * @param {Object} [options={}] - Verification options.
 * @param {string|KeyObject} [secret=TADASHI_SECRET_KEY_JWT] - Secret key for verification.
 * @returns {Promise<Object|undefined>} - The decoded and verified JWT payload, or undefined if verification fails.
 */
export async function verify(jwt, options = {}, secret = TADASHI_SECRET_KEY_JWT) {
	try {
		const res = await _verify(jwt, options, secret)
		return res
	} catch (error) {
		_error('verify', error.message)
	}
}

/**
 * Parses a JWT and extracts the payload.
 * @param {string} jwt - The JWT to parse.
 * @returns {Object|undefined} - The decoded payload, or undefined if parsing fails.
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
