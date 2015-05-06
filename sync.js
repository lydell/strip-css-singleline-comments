// Copyright 2015 Simon Lydell
// X11 (“MIT”) Licensed. (See LICENSE.)

var strip = require("./")

module.exports = function stripCssSinglelineCommentsSync(stringOrBuffer) {
  return strip(function(transform, flush) {
    var buffer = new Buffer(stringOrBuffer)
    var output = ""
    var context = {push: function(chunk) { output += chunk.toString() }}
    transform.call(context, buffer, null, Function.prototype)
    flush.call(context, Function.prototype)
    return output
  })
}
