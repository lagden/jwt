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
	const payload = verify(jwt)
	t.is(payload.data.name, 'Sabrina Takamoto')
})

test('[more] sign, verify, parse and claims', t => {
	const jwt = sign({name: 'Lucas Tadashi'}, {aud: ['app:xxx', 'app:yyy'], iss: 'http://127.0.0.2'})
	const payload = verify(jwt, {audience: 'app:xxx'})
	t.is(payload.data.name, 'Lucas Tadashi')
})

test('[666] sign, verify and parse', t => {
	const jwt = sign({id: 37046, name: 'Thiago Lagden', corretora: 666}, {iss: 'http://127.0.0.1'})
	const payload = verify(jwt, {issuer: 'http://127.0.0.1'})
	t.is(payload.data.corretora, 666)
})

test('[duration] timeout', async t => {
	const jwt = sign({name: 'Sabrina Takamoto'}, {duration: 1})
	await sleep(2)
	const payload = verify(jwt)
	t.false(payload)
})

test('[invalid aud] verify', t => {
	const jwt = sign({name: 'Rita'}, {aud: 'app:xxx'})
	const payload = verify(jwt, {audience: 'xxx'})
	t.false(payload)
})

test('[invalid iss] verify', t => {
	const jwt = sign({name: 'Jorge'}, {iss: 'http://jorge.in'})
	const payload = verify(jwt, {issuer: 'http://lagden.in'})
	t.false(payload)
})

test('[empty claim] sign', t => {
	const jwt = sign({name: 'Jorge'})
	const payload = verify(jwt, {issuer: 'http://jorge.in'})
	t.false(payload)
})

test('[empty claim] verify', t => {
	const jwt = sign({name: 'Jorge'}, {iss: 'http://jorge.in'})
	const payload = verify(jwt)
	t.is(payload.data.name, 'Jorge')
})

test('[missing] iss', t => {
	const jwt = sign({name: 'Lucas Tadashi'}, {aud: 'app:xxx'})
	const payload = verify(jwt, {audience: 'app:xxx', issuer: 'http://127.0.0.2'})
	t.false(payload)
})

test('[invalid] verify', t => {
	const payload = verify('invalid')
	t.false(payload)
})

test('[invalid] parse', t => {
	const obj = parse('invalid')
	t.is(obj, null)
})

test('[no sig] parse', t => {
	const obj = parse('eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJpc3MiOiJodHRwczovL2p3dC1pZHAuZXhhbXBsZS5jb20iLCJzdWIiOiJtYWlsdG86bWlrZUBleGFtcGxlLmNvbSIsIm5iZiI6MTUyMDM5MTEwMSwiZXhwIjoxNTIwMzk0NzAxLCJpYXQiOjE1MjAzOTExMDEsImp0aSI6ImlkMTIzNDU2IiwidHlwIjoiaHR0cHM6Ly9leGFtcGxlLmNvbS9yZWdpc3RlciJ9')
	t.is(obj, null)
})

test('[basic] noData', t => {
	const jwt = sign({name: 'Sabrina Takamoto'}, {jti: '37046', useData: false})
	const payload = verify(jwt)
	t.is(payload.name, 'Sabrina Takamoto')
})

test('[basic] no nbf', t => {
	const jwt = sign({name: 'Sabrina Takamoto'}, {jti: true, ignoreNbf: true})
	const payload = verify(jwt)
	t.is(payload.data.name, 'Sabrina Takamoto')
})

test('[clockTolerance] validation', async t => {
	const jwt = sign({name: 'Sabrina Takamoto'}, {duration: 1})
	// wait
	await sleep(2)
	const payload = verify(jwt, {clockTolerance: '2s'})
	t.is(payload.data.name, 'Sabrina Takamoto')
	// times up
	await sleep(2)
	const payload2 = verify(jwt, {clockTolerance: '2s'})
	t.false(payload2)
})
