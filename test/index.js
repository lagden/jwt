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

test('[default] sign, verify', t => {
	const jwt = sign({name: 'Sabrina Takamoto'})
	const isValid = verify(jwt)
	t.true(isValid)
})

test('[basic] sign, verify, parse and claims', t => {
	const jwt = sign({name: 'Lucas Tadashi'}, {iss: 'app:xxx', aud: 'http://127.0.0.3, http://127.0.0.2'})
	const isValid = verify(jwt, {iss: 'app:xxx', aud: 'http://127.0.0.2'})
	const {payloadObj: payload} = parse(jwt)
	t.true(isValid)
	t.is(payload.data.name, 'Lucas Tadashi')
})

test('do capeta', t => {
	const jwt = sign({id: 37046, name: 'Thiago Lagden', corretora: 666}, {aud: 'http://127.0.0.1'})
	const isValid = verify(jwt, {aud: 'http://127.0.0.1'})
	const {payloadObj: payload} = parse(jwt)
	t.true(isValid)
	t.is(payload.data.corretora, 666)
})

test('[duration] sign, verify', async t => {
	const jwt = sign({name: 'Sabrina Takamoto'}, {duration: 1})
	await sleep(10)
	const isValid = verify(jwt)
	t.false(isValid)
})

test('[invalid iss] verify', t => {
	const jwt = sign({name: 'Rita'})
	const isValid = verify(jwt, {iss: 'xxx'})
	t.false(isValid)
})

test('[invalid aud] verify', t => {
	const jwt = sign({name: 'Jorge'}, {aud: 'http://jorge.in'})
	const isValid = verify(jwt, {aud: 'http://lagden.in'})
	t.false(isValid)
})

test('[JWT invalid] verify', t => {
	const isValid = verify('invalid')
	t.false(isValid)
})

test('[invalid] parse', t => {
	const obj = parse('invalid')
	t.is(obj, null)
})
