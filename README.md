# jwt

[![NPM version][npm-img]][npm]
[![Build Status][ci-img]][ci]
[![Coverage Status][coveralls-img]][coveralls]
[![Dependency Status][dep-img]][dep]
[![devDependency Status][devDep-img]][devDep]

[![XO code style][xo-img]][xo]
[![Greenkeeper badge][greenkeeper-img]][greenkeeper]


[npm-img]:         https://img.shields.io/npm/v/@tadashi/jwt.svg
[npm]:             https://www.npmjs.com/package/@tadashi/jwt
[ci-img]:          https://travis-ci.org/lagden/jwt.svg
[ci]:              https://travis-ci.org/lagden/jwt
[coveralls-img]:   https://coveralls.io/repos/github/lagden/jwt/badge.svg?branch=master
[coveralls]:       https://coveralls.io/github/lagden/jwt?branch=master
[dep-img]:         https://david-dm.org/lagden/jwt.svg
[dep]:             https://david-dm.org/lagden/jwt
[devDep-img]:      https://david-dm.org/lagden/jwt/dev-status.svg
[devDep]:          https://david-dm.org/lagden/jwt#info=devDependencies
[xo-img]:          https://img.shields.io/badge/code_style-XO-5ed9c7.svg
[xo]:              https://github.com/sindresorhus/xo
[greenkeeper-img]: https://badges.greenkeeper.io/lagden/jwt.svg
[greenkeeper]:     https://greenkeeper.io/


Generates, verifies and parses a JSON Web Token

## Install

```
$ npm i -S @tadashi/jwt
```


## Usage

```js
const {sign, verify, parse} = require('@tadashi/jwt')

const jwt = sign({name: 'Lucas Tadashi'})
// => eyJhbGciOiJIUz...

const isValid = verify('eyJhbGciOiJIUz...', 'app:key', 'http://127.0.0.1')
// => true

const {payloadObj: {data: {name}}} = parse('eyJhbGciOiJIUz...')
// => Lucas Tadashi
```


## API

[See documentation](https://lagden.github.io/jwt)


## License

MIT © [Thiago Lagden](http://lagden.in)
