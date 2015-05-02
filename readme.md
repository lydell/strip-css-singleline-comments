Overview [![Build Status](https://travis-ci.org/lydell/strip-css-singleline-comments.svg?branch=master)](https://travis-ci.org/lydell/strip-css-singleline-comments)
========

Adds support for singleline comments in CSS, by stripping them away.

```scss
/**
 * OOCSS-style Media block
 */
.media {
  // TODO
}

.media > .mediaImg {
  float: left; // TODO add clearfix
  // margin-right: 1em;
  margin-right: 10px; // Use pixels for now
}


/**
 * Brand image as background
 *
 * Note: Uses protocol-relative url (`//example.com`).
 */
.brand-bg {
  background: url('//example.com/brand-bg.png') no-repeat center
}
```

→

```css
/**
 * OOCSS-style Media block
 */
.media {
  
}

.media > .mediaImg {
  float: left; 
  
  margin-right: 10px; 
}


/**
 * Brand image as background
 *
 * Note: Uses protocol-relative url (`//example.com`).
 */
.brand-bg {
  background: url('//example.com/brand-bg.png') no-repeat center
}
```


Installation
============

`npm install strip-css-singleline-comments`

```js
var strip = require("strip-css-singleline-comments")
```


Usage
=====

General
-------

```js
var strip = require("strip-css-singleline-comments")

fs.createReadStream('input.css')
  .pipe(strip())
  .pipe(fs.createWriteStream('output.css'))
```

The above is a bit like:

```sh
sed <input.css 's#//.*##' >output.css
```

The difference is that strip-css-singleline-comments does not alter regular
`/**/` comments as well as single- and double-quoted strings.

It is intended to be used with CSS, but can be used with anything where you want
to remove `//`-style comments and it makes sense to make the above exclusions.

`strip()` returns a [`through2@1`] stream.

[`through2@1`]: https://www.npmjs.com/package/through2

Gulp
----

For example usage with [gulp], please see the first task in
[gulpfile.js][gulpfile.js].

[gulp]: http://gulpjs.com/

CLI
---

This module also ships with a really simple CLI program.

```sh
strip-css-singleline-comments <input.css >output.css
```


Source maps
===========

strip-css-singleline-comments does not break source maps, because it neither
adds nor removes any lines, and only modifies lines at the ends.


Speed
=====

On my machine, stripping all singleline comments from all .less files in
[bootstrap] takes about 340ms. You can time it yourself by running:

```sh
gulp bench-prepare && time ./strip-css-singleline-comments <bootstrap.all.less
```

There’s also a benchmark available, which reports around 514 ops/sec on my
computer.

The benchmark also compares with [strip-css-comments], and on my computer it
seems to be about 7 times slower. I don’t know how fair that comparison is,
though, because:

- strip-css-comments does not do the same thing, only something similar: It
  strips valid CSS block comments.
- There are not that many block comments in the .less files used in the
  benchmark. On the other hand, there are lots of singleline comments.

To run the benchmark: `npm run bench`.

[strip-css-comments]: https://github.com/sindresorhus/strip-css-comments


License
=======

[The X11 (“MIT”) License](LICENSE).
