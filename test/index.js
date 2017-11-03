'use strict'

import test from 'ava'
import {sign, verify, parse} from '../.'

function sleep(ms) {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve()
		}, ms)
	})
}

test('[basic] sign, verify and parse', t => {
	const jwt = sign({name: 'Lucas Tadashi'})
	const isValid = verify(jwt, 'app:key', 'http://127.0.0.1')
	const {payloadObj: payload} = parse(jwt)
	t.true(isValid)
	t.is(payload.data.name, 'Lucas Tadashi')
})

test('[duration] sign, verify', async t => {
	const jwt = sign({name: 'Sabrina Takamoto'}, {duration: 1})
	await sleep(10)
	const isValid = verify(jwt, 'app:key', 'http://127.0.0.1')
	t.false(isValid)
})

test('[invalid] verify', t => {
	const jwt = sign({name: 'Rita'})
	const isValid = verify(jwt)
	t.false(isValid)
})

test('[JWT invalid] verify', t => {
	const isValid = verify('invalid', 'app:key', 'http://127.0.0.1')
	t.false(isValid)
})

test('[invalid] parse', t => {
	const obj = parse('invalid')
	t.is(obj, null)
})
