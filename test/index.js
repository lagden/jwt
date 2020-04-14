'use strict'

const test = require('ava')
const {sign, verify, parse} = require('..')

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

test('[more] sign, verify, and claims', t => {
	const jwt = sign({name: 'Lucas Tadashi'}, {aud: ['app:xxx', 'app:yyy'], iss: 'http://127.0.0.2'})
	const payload = verify(jwt, {audience: 'app:xxx'})
	t.is(payload.data.name, 'Lucas Tadashi')
})

test('[666] sign and verify', t => {
	const jwt = sign({id: 37046, name: 'Thiago Lagden', corretora: 666}, {iss: 'http://127.0.0.1'})
	const payload = verify(jwt, {issuer: 'http://127.0.0.1'})
	t.is(payload.data.corretora, 666)
})

test('[old jwt] verify', t => {
	const jwt = 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjozNzA0NiwibmFtZSI6IlRoaWFnbyBMYWdkZW4iLCJlbXByZXNhIjo4LCJ1bmlkYWRlIjoxLCJjb3JyZXRvcmEiOjF9LCJpc3MiOiJjaGF0OnRlbGVwb3J0IiwiYXVkIjoiaHR0cHM6Ly90ZWxlcG9ydC5jb20uYnIiLCJpYXQiOjE1NzgwMjc3NjIsIm5iZiI6MTU3ODAyNzc2Mn0.50bQ0iZVlVg7PBW9qb1OzW0nqXqHf0-NXu3h5Tqhv_YEpxxVHOSTCZIh2QZ5UijbTxgTKPw706UVvLCjlN-cig'
	const payload = verify(jwt, {}, 'f4348f039868786f4a93ca27c1f748b7')
	t.is(payload.data.empresa, 8)
})

test('[duration] times up', async t => {
	const jwt = sign({name: 'Sabrina Takamoto'}, {duration: 1})
	await sleep(2)
	const payload = verify(jwt)
	t.is(payload, null)
})

test('[secret] ok', t => {
	const jwt = sign({name: 'Sabrina Takamoto'}, {}, 'new_secret')
	const payload = verify(jwt, {}, 'new_secret')
	t.is(payload.data.name, 'Sabrina Takamoto')
})

test('[secret] fail', t => {
	const jwt = sign({name: 'Sabrina Takamoto'}, {}, 'new_secret')
	const payload = verify(jwt)
	t.is(payload, null)
})

test('[invalid aud] verify', t => {
	const jwt = sign({name: 'Rita'}, {aud: 'app:xxx'})
	const payload = verify(jwt, {audience: 'xxx'})
	t.is(payload, null)
})

test('[invalid iss] verify', t => {
	const jwt = sign({name: 'Jorge'}, {iss: 'http://jorge.in'})
	const payload = verify(jwt, {issuer: 'http://lagden.in'})
	t.is(payload, null)
})

test('[empty claim] sign', t => {
	const jwt = sign({name: 'Jorge'})
	const payload = verify(jwt, {issuer: 'http://jorge.in'})
	t.is(payload, null)
})

test('[empty claim] verify', t => {
	const jwt = sign({name: 'Jorge'}, {iss: 'http://jorge.in'})
	const payload = verify(jwt)
	t.is(payload.data.name, 'Jorge')
})

test('[missing] iss', t => {
	const jwt = sign({name: 'Lucas Tadashi'}, {aud: 'app:xxx'})
	const payload = verify(jwt, {audience: 'app:xxx', issuer: 'http://127.0.0.2'})
	t.is(payload, null)
})

test('[invalid] verify', t => {
	const payload = verify('invalid')
	t.is(payload, null)
})

test('[invalid] parse', t => {
	const obj = parse('invalid')
	t.is(obj, null)
})

test('[no sig] parse', t => {
	const obj = parse('eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJpc3MiOiJodHRwczovL2p3dC1pZHAuZXhhbXBsZS5jb20iLCJzdWIiOiJtYWlsdG86bWlrZUBleGFtcGxlLmNvbSIsIm5iZiI6MTUyMDM5MTEwMSwiZXhwIjoxNTIwMzk0NzAxLCJpYXQiOjE1MjAzOTExMDEsImp0aSI6ImlkMTIzNDU2IiwidHlwIjoiaHR0cHM6Ly9leGFtcGxlLmNvbS9yZWdpc3RlciJ9')
	t.is(obj, null)
})

test('[ok] parse', t => {
	const {data: {name}} = parse('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJkYXRhIjp7Im5hbWUiOiJTYWJyaW5hIFRha2Ftb3RvIn0sImlhdCI6MTU3ODAyNTAwMH0.-lfGV42N3p1aAQjFCbdVOaqgbHcv3PndY1Eiv2CF_WRFKW2_4YA-N_o3bxV_iKZ1RkUeZcVUgx7IhhE_rCZBfA')
	t.is(name, 'Sabrina Takamoto')
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
	t.is(payload2, null)
})
