import {generateSecret} from 'jose'
import test from 'ava'
import sleep from '@tadashi/sleep'
import {
	sign,
	verify,
	_verify,
	parse,
} from '../src/jwt.js'

test('[basic] sign, verify', async t => {
	const jwt = await sign({name: 'Sabrina Takamoto'})
	const {payload} = await verify(jwt)
	// t.snapshot(jwt)
	// t.snapshot(payload)
	t.is(payload.data.name, 'Sabrina Takamoto')
})

test('[more] sign, verify, and claims', async t => {
	const jwt = await sign({name: 'Lucas Tadashi'}, {aud: ['app:xxx', 'app:yyy'], iss: 'http://127.0.0.2'})
	const {payload} = await verify(jwt, {audience: 'app:xxx'})
	// t.snapshot(jwt)
	// t.snapshot(payload)
	t.is(payload.data.name, 'Lucas Tadashi')
})

test('[666] sign and verify', async t => {
	const jwt = await sign({
		id: 37_046,
		name: 'Thiago Lagden',
		corretora: 666,
	}, {
		iss: 'urn:test:issuer',
	})
	const res = await verify(jwt, {
		issuer: 'urn:test:issuer',
	})
	const {payload} = res
	// t.snapshot(res)
	t.is(payload.data.corretora, 666)
})

test('[old jwt] verify', async t => {
	const jwt = 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjozNzA0NiwibmFtZSI6IlRoaWFnbyBMYWdkZW4iLCJlbXByZXNhIjo4LCJ1bmlkYWRlIjoxLCJjb3JyZXRvcmEiOjF9LCJpc3MiOiJjaGF0OnRlbGVwb3J0IiwiYXVkIjoiaHR0cHM6Ly90ZWxlcG9ydC5jb20uYnIiLCJpYXQiOjE1NzgwMjc3NjIsIm5iZiI6MTU3ODAyNzc2Mn0.50bQ0iZVlVg7PBW9qb1OzW0nqXqHf0-NXu3h5Tqhv_YEpxxVHOSTCZIh2QZ5UijbTxgTKPw706UVvLCjlN-cig'
	const {payload} = await verify(jwt, {}, 'f4348f039868786f4a93ca27c1f748b7')
	t.is(payload.data.empresa, 8)
})

test('[expiration] times up', async t => {
	const jwt = await sign({
		name: 'Sabrina Takamoto',
	}, {
		exp: '2 seconds',
	})
	await sleep(3)
	const res = await verify(jwt)
	t.is(res, undefined)
})

test('[expiration] ok', async t => {
	const jwt = await sign({
		name: 'Sabrina Takamoto',
	}, {
		exp: '5 seconds',
	})
	await sleep(2)
	const {payload} = await verify(jwt)
	t.is(payload.data.name, 'Sabrina Takamoto')
})

test('[secret] ok', async t => {
	const jwt = await sign({name: 'Sabrina Takamoto'}, {}, 'new_secret')
	const {payload} = await verify(jwt, {}, 'new_secret')
	t.is(payload.data.name, 'Sabrina Takamoto')
})

test('[secret] fail', async t => {
	const jwt = await sign({name: 'Sabrina Takamoto'}, {}, 'new_secret')
	const res = await verify(jwt)
	t.is(res, undefined)
})

test('[secret] generateSecret', async t => {
	const key = await generateSecret('HS512')
	const jwt = await sign({name: 'Sabrina Takamoto'}, {}, key)
	const {payload} = await verify(jwt, {}, key)
	t.is(payload.data.name, 'Sabrina Takamoto')
})

test('[invalid aud] verify', async t => {
	const jwt = await sign({name: 'Rita'}, {aud: 'app:xxx'})
	const res = await verify(jwt, {audience: 'xxx'})
	t.is(res, undefined)
})

test('[invalid iss] verify', async t => {
	const jwt = await sign({name: 'Jorge'}, {iss: 'https://jorge.in'})
	const res = await verify(jwt, {issuer: 'https://lagden.in'})
	t.is(res, undefined)
})

test('[empty claim] sign', async t => {
	const jwt = await sign({name: 'Jorge'})
	const res = await verify(jwt, {issuer: 'http://jorge.in'})
	t.is(res, undefined)
})

test('[empty claim] verify', async t => {
	const jwt = await sign({name: 'Jorge'}, {iss: 'http://jorge.in'})
	const {payload} = await verify(jwt)
	t.is(payload.data.name, 'Jorge')
})

test('[missing] iss', async t => {
	const jwt = await sign({name: 'Lucas Tadashi'}, {aud: 'app:xxx'})
	const res = await verify(jwt, {audience: 'app:xxx', issuer: 'http://127.0.0.2'})
	t.is(res, undefined)
})

test('[invalid] verify', async t => {
	const res = await verify('invalid')
	t.is(res, undefined)
})

test('[invalid] parse', t => {
	const payload = parse('invalid')
	t.is(payload, undefined)
})

test('[no sig] parse', t => {
	const payload = parse('eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJpc3MiOiJodHRwczovL2p3dC1pZHAuZXhhbXBsZS5jb20iLCJzdWIiOiJtYWlsdG86bWlrZUBleGFtcGxlLmNvbSIsIm5iZiI6MTUyMDM5MTEwMSwiZXhwIjoxNTIwMzk0NzAxLCJpYXQiOjE1MjAzOTExMDEsImp0aSI6ImlkMTIzNDU2IiwidHlwIjoiaHR0cHM6Ly9leGFtcGxlLmNvbS9yZWdpc3RlciJ9')
	t.is(payload.jti, 'id123456')
})

test('[ok] parse', t => {
	const {data: {name}} = parse('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJkYXRhIjp7Im5hbWUiOiJTYWJyaW5hIFRha2Ftb3RvIn0sImlhdCI6MTU3ODAyNTAwMH0.-lfGV42N3p1aAQjFCbdVOaqgbHcv3PndY1Eiv2CF_WRFKW2_4YA-N_o3bxV_iKZ1RkUeZcVUgx7IhhE_rCZBfA')
	t.is(name, 'Sabrina Takamoto')
})

test('[basic] noData', async t => {
	const jwt = await sign({name: 'Sabrina Takamoto'}, {jti: '37046', useData: false})
	const {payload} = await verify(jwt)
	t.is(payload.name, 'Sabrina Takamoto')
})

test('[basic] no nbf', async t => {
	const exp = Math.floor(Date.now() / 1000)
	const nbf = Math.floor((Date.now() / 1000)) + 10_000
	const jwt = await sign({name: 'Sabrina Takamoto'}, {exp, nbf})
	const res = await verify(jwt)
	t.is(res, undefined)
})

test('[clockTolerance] validation', async t => {
	const jwt = await sign({
		name: 'Sabrina Takamoto',
	}, {
		exp: '2 seconds',
	})
	await sleep(2)
	const {payload} = await verify(jwt, {
		clockTolerance: '5 seconds',
	})
	t.is(payload.data.name, 'Sabrina Takamoto')

	// times up
	await sleep(2)
	const res = await verify(jwt, {
		clockTolerance: '1 seconds',
	})
	t.is(res, undefined)
})

test('verify_ promise', async t => {
	const exp = Math.floor(Date.now() / 1000)
	const nbf = Math.floor((Date.now() / 1000)) + 10_000

	const jwt = await sign({name: 'Sabrina Takamoto'}, {exp, nbf})
	const error = await t.throwsAsync(_verify(jwt))
	t.is(error.message, '"nbf" claim timestamp check failed')

	const key = await generateSecret('HS512')
	const jwt2 = await sign({name: 'Sabrina Takamoto'}, {}, 'new_secret')
	const error2 = await t.throwsAsync(_verify(jwt2, {}, key))
	t.is(error2.message, 'signature verification failed')
})
