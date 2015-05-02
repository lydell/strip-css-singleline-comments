// Copyright 2015 Simon Lydell
// X11 (“MIT”) Licensed. (See LICENSE.)

var fs          = require("fs")
var stripBlock  = require("strip-css-comments")
var stripSingle = require("./")

var bootstrapFile   = "bootstrap.all.less"
var bootstrapStream = fs.createReadStream(bootstrapFile)
var bootstrapString = fs.readFileSync(bootstrapFile)

module.exports = {
  name: "bootstrap",
  maxTime: 2,
  tests: [
    {
      name: "strip-css-singleline-comments",
      defer: true,
      fn: function(deferred) {
        bootstrapStream
          .pipe(stripSingle())
          .end(deferred.resolve.bind(deferred))
      }
    },
    {
      name: "strip-css-comments",
      fn: function() {
        stripBlock(bootstrapString)
      }
    }
  ]
}
