# JWT

[![NPM version][npm-img]][npm]
[![Build Status][ci-img]][ci]
[![Coverage Status][coveralls-img]][coveralls]
[![XO code style][xo-img]][xo]
[![Greenkeeper][greenkeeper-img]][greenkeeper]
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Flagden%2Fjwt.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Flagden%2Fjwt?ref=badge_shield)


[npm-img]:         https://img.shields.io/npm/v/@tadashi/jwt.svg
[npm]:             https://www.npmjs.com/package/@tadashi/jwt
[ci-img]:          https://travis-ci.org/lagden/jwt.svg
[ci]:              https://travis-ci.org/lagden/jwt
[coveralls-img]:   https://coveralls.io/repos/github/lagden/jwt/badge.svg?branch=master
[coveralls]:       https://coveralls.io/github/lagden/jwt?branch=master
[xo-img]:          https://img.shields.io/badge/code_style-XO-5ed9c7.svg
[xo]:              https://github.com/sindresorhus/xo
[jwt-img]:         http://jwt.io/img/badge-compatible.svg
[jwt]:             http://jwt.io
[greenkeeper-img]: https://badges.greenkeeper.io/lagden/jwt.svg
[greenkeeper]:     https://greenkeeper.io/

-----

[![JWT][jwt-img]][jwt]

Sign, verify and parse a JSON Web Token

## Install

```
$ npm i -S @tadashi/jwt
```


## Usage

```js
const {sign, verify, parse} = require('@tadashi/jwt')

const jwt = sign({name: 'Lucas Tadashi'})
// => eyJhbGciOiJIUz...

const valid = verify(jwt)
// => true

const {payload: {data: {name}}} = parse(jwt)
// => Lucas Tadashi
```


## License

MIT © [Thiago Lagden](http://lagden.in)


[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Flagden%2Fjwt.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Flagden%2Fjwt?ref=badge_large)