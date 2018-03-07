'use strict'

function parseJWT(jwt) {
	const parts = jwt.split('.')
	if (parts.length !== 2 && parts.length !== 3) {
		throw new Error('malformed jwt: wrong number of \'.\' splitted elements')
	}

	const headerBuffer = Buffer.from(parts[0], 'base64')
	const payloadBuffer = Buffer.from(parts[1], 'base64')
	let signBuffer
	if (parts.length === 3) {
		signBuffer = Buffer.from(parts[2], 'base64')
	}

	const result = Object.create(null)
	result.header = JSON.parse(headerBuffer.toString('utf8'))
	result.payload = JSON.parse(payloadBuffer.toString('utf8'))
	if (signBuffer) {
		result.sig = signBuffer.toString('hex')
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
