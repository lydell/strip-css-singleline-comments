// Copyright 2015 Simon Lydell
// X11 (“MIT”) Licensed. (See LICENSE.)

var through = require("through2")

// Character codes.
var C_LF        = 10 // \n
var C_CR        = 13 // \r
var C_QUOT      = 34 // "
var C_APOS      = 39 // '
var C_ASTERISK  = 42 // *
var C_SLASH     = 47 // /
var C_BACKSLASH = 92 // \

// State constants.
var S_NORMAL             = 0
var S_STRING             = 1
var S_BLOCK_COMMENT      = 2
var S_SINGLELINE_COMMENT = 3

module.exports = function stripCssSinglelineComments() {
  var state   = S_NORMAL
  var quote
  var escaped = false
  var lastCh  = 0

  return through(function(chunk, encoding, callback) {
    var index
    var ch
    var start  = 0 // The position in the chunk to start outputting from.
    var length = chunk.length

    for (index = 0; index < length; index++) {
      ch = chunk[index]

      switch (state) {
        case S_NORMAL:
          if (lastCh === C_SLASH) {
              if (ch === C_SLASH) {
                state = S_SINGLELINE_COMMENT
                // Output everything from the start of the chunk or the last
                // singleline comment to the comment we are just entering,
                // unless that range is the empty string.
                if (index - 1 > start) {
                  this.push(chunk.slice(start, index - 1))
                }
                break
              } else {
                if (index === 0) {
                  // The last chunk ended with a single slash, which never was
                  // outputted.
                  this.push(new Buffer([C_SLASH]))
                }
                if (ch === C_ASTERISK) {
                  state = S_BLOCK_COMMENT
                  // Prevent `lastCh` from becoming `C_ASTERISK` in order not to
                  // parse `/*/` as a complete block comment.
                  ch = 0
                  break
                }
              }
          }
          if (ch === C_APOS || ch === C_QUOT) {
            state = S_STRING
            quote = ch
          }
          break

        case S_STRING:
          if (escaped) {
            escaped = false
          } else if (ch === C_BACKSLASH) {
            escaped = true
          } else if (ch === quote) {
            state = S_NORMAL
          }
          break

        case S_BLOCK_COMMENT:
          if (lastCh === C_ASTERISK && ch === C_SLASH) {
            state = S_NORMAL
          }
          break

        case S_SINGLELINE_COMMENT:
          if (ch === C_CR || ch === C_LF) {
            state = S_NORMAL
          }
          start = index
          break
      }

      lastCh = ch
    }

    if (state !== S_SINGLELINE_COMMENT) {
      // If the chunk ends with a single slash we cannot output it right now,
      // because we don’t know yet if it is part of a `//` comment or something
      // else.
      this.push(chunk.slice(start, length - (lastCh === C_SLASH ? 1 : 0)))
    }

    callback()
  }, function(callback) {
    // The very last chunk ended with a single slash, which never was outputted.
    if (state !== S_SINGLELINE_COMMENT && lastCh === C_SLASH) {
      this.push(new Buffer([C_SLASH]))
    }
    callback()
  })
}
