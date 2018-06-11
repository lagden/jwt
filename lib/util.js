'use strict'

const {jws: {JWS}} = require('jsrsasign')

function parseJWT(jwt) {
	const {
		headerObj,
		payloadObj,
		sigHex = false
	} = JWS.parse(jwt)

	const result = Object.create(null)
	result.header = headerObj
	result.payload = payloadObj
	if (sigHex) {
		result.sig = sigHex
	}

	return result
}

function matchClaims(jwt, claimsRequired) {
	const {payload} = parseJWT(jwt)
	const payloadKeys = Object.keys(payload)
	return claimsRequired.every(claim => payloadKeys.includes(claim))
}

exports.matchClaims = matchClaims
exports.parseJWT = parseJWT
