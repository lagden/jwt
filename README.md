# JWT

[![NPM version][npm-img]][npm]
[![Build Status][ci-img]][ci]
[![Coverage Status][coveralls-img]][coveralls]
[![FOSSA Status][fossa-img]][fossa]
[![XO code style][xo-img]][xo]


[npm-img]:         https://img.shields.io/npm/v/@tadashi/jwt.svg
[npm]:             https://www.npmjs.com/package/@tadashi/jwt
[ci-img]:          https://github.com/lagden/jwt/actions/workflows/nodejs.yml/badge.svg
[ci]:              https://github.com/lagden/jwt/actions/workflows/nodejs.yml
[coveralls-img]:   https://coveralls.io/repos/github/lagden/jwt/badge.svg?branch=master
[coveralls]:       https://coveralls.io/github/lagden/jwt?branch=master
[xo-img]:          https://img.shields.io/badge/code_style-XO-5ed9c7.svg
[xo]:              https://github.com/sindresorhus/xo
[fossa-img]:       https://app.fossa.io/api/projects/git%2Bgithub.com%2Flagden%2Fjwt.svg?type=shield
[fossa]:           https://app.fossa.io/projects/git%2Bgithub.com%2Flagden%2Fjwt?ref=badge_shield
[jwt-img]:         http://jwt.io/img/badge-compatible.svg
[jwt]:             http://jwt.io

-----

[![JWT][jwt-img]][jwt]

Sign, verify and parse a JSON Web Token


## Install

```
$ npm i -S @tadashi/jwt
```


## Usage

```js
import {sign, verify, parse} from '@tadashi/jwt'

const jwt = sign({name: 'Lucas Tadashi'})
// => eyJhbGciOiJIUz...

const obj = verify(jwt)
// => {data: {name: 'Lucas Tadashi'}, iat: 1578024700}

const {data: {name}} = parse(jwt)
// => Lucas Tadashi
```


## License

MIT © [Thiago Lagden](https://github.com/lagden)


[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Flagden%2Fjwt.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Flagden%2Fjwt?ref=badge_large)
