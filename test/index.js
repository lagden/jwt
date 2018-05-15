'use strict'

import test from 'ava'
import {sign, verify, parse} from '..'

function sleep(s) {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve()
		}, s * 1000)
	})
}

test('[basic] sign, verify', t => {
	const jwt = sign({name: 'Sabrina Takamoto'})
	const isValid = verify(jwt)
	t.true(isValid)
})

test('[more] sign, verify, parse and claims', t => {
	const jwt = sign({name: 'Lucas Tadashi'}, {iss: 'app:xxx', aud: 'http://127.0.0.2'})
	const isValid = verify(jwt, {iss: 'app:xxx', aud: 'http://127.0.0.2 http://127.0.0.3'})
	const {payload} = parse(jwt)
	t.true(isValid)
	t.is(payload.data.name, 'Lucas Tadashi')
})

test('[666] sign, verify and parse', t => {
	const jwt = sign({id: 37046, name: 'Thiago Lagden', corretora: 666}, {aud: 'http://127.0.0.1'})
	const isValid = verify(jwt, {aud: 'http://127.0.0.1'})
	const {payload} = parse(jwt)
	t.true(isValid)
	t.is(payload.data.corretora, 666)
})

test('[duration] timeout', async t => {
	const jwt = sign({name: 'Sabrina Takamoto'}, {duration: 0.5})
	await sleep(1)
	const isValid = verify(jwt)
	t.false(isValid)
})

test('[invalid iss] verify', t => {
	const jwt = sign({name: 'Rita'}, {iss: 'app:xxx'})
	const isValid = verify(jwt, {iss: 'xxx'})
	t.false(isValid)
})

test('[invalid aud] verify', t => {
	const jwt = sign({name: 'Jorge'}, {aud: 'http://jorge.in'})
	const isValid = verify(jwt, {aud: 'http://lagden.in'})
	t.false(isValid)
})

test('[empty aud] sign', t => {
	const jwt = sign({name: 'Jorge'})
	const isValid = verify(jwt, {aud: 'http://jorge.in'})
	t.false(isValid)
})

test('[empty aud] verify', t => {
	const jwt = sign({name: 'Jorge'}, {aud: 'http://jorge.in'})
	const isValid = verify(jwt)
	t.true(isValid)
})

test('[empty iss] sign', t => {
	const jwt = sign({name: 'Rita'})
	const isValid = verify(jwt, {iss: 'xxx'})
	t.false(isValid)
})

test('[empty iss] verify', t => {
	const jwt = sign({name: 'Rita'}, {iss: 'app:xxx'})
	const isValid = verify(jwt)
	t.true(isValid)
})

test('[missing] aud', t => {
	const jwt = sign({name: 'Lucas Tadashi'}, {iss: 'app:xxx'})
	const isValid = verify(jwt, {iss: 'app:xxx', aud: 'http://127.0.0.2'})
	t.false(isValid)
})

test('[invalid] verify', t => {
	const isValid = verify('invalid')
	t.false(isValid)
})

test('[invalid] parse', t => {
	const obj = parse('invalid')
	t.is(obj, null)
})

test('[no sig] parse', t => {
	const obj = parse('eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJpc3MiOiJodHRwczovL2p3dC1pZHAuZXhhbXBsZS5jb20iLCJzdWIiOiJtYWlsdG86bWlrZUBleGFtcGxlLmNvbSIsIm5iZiI6MTUyMDM5MTEwMSwiZXhwIjoxNTIwMzk0NzAxLCJpYXQiOjE1MjAzOTExMDEsImp0aSI6ImlkMTIzNDU2IiwidHlwIjoiaHR0cHM6Ly9leGFtcGxlLmNvbS9yZWdpc3RlciJ9')
	t.is(obj.header.alg, 'none')
})

test('[basic] noData', t => {
	const jwt = sign({name: 'Sabrina Takamoto'}, {useData: false})
	const isValid = verify(jwt)
	t.true(isValid)
})
