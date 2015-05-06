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
  var state = S_NORMAL
  var quote
  var ch    = -1
  var index = 0

  return through(function(chunk, encoding, callback) {
    var start = 0 // The position in the chunk to start outputting from.
    var last  = chunk.length - 1

    if (ch < 0) {
      ch = chunk[index]
    }

    forloop: for (; index <= last; index++, ch = chunk[index]) {
      switch (state) {
        case S_NORMAL:
          if (ch === C_SLASH) {
              if (index === last) {
                // Lookahead required but not available; wait for next chunk.
                break forloop
              }
              if (chunk[index + 1] === C_SLASH) {
                state = S_SINGLELINE_COMMENT
                // Output everything from the start of the chunk or the last
                // singleline comment to the comment we are just entering,
                // unless that range is the empty string.
                if (index > start) {
                  this.push(chunk.slice(start, index))
                }
                // Consume next char.
                index++
              } else {
                if (index < 0) {
                  // Last char from last chunk buffered. Now we may output it.
                  this.push(new Buffer([ch]))
                }
                if (chunk[index + 1] === C_ASTERISK) {
                  state = S_BLOCK_COMMENT
                  // Consume next char.
                  index++
                }
              }
          } else if (ch === C_APOS || ch === C_QUOT) {
            state = S_STRING
            quote = ch
          }
          break

        case S_STRING:
          if (ch === C_BACKSLASH) {
            // Consume next char.
            index++
          } else if (ch === quote) {
            state = S_NORMAL
          }
          break

        case S_BLOCK_COMMENT:
          if (ch === C_ASTERISK) {
            if (index === last) {
              // Lookahead required but not available; wait for next chunk.
              break forloop
            }
            if (index < 0) {
              // Last char from last chunk buffered. Now we may output it.
              this.push(new Buffer([ch]))
            }
            if (chunk[index + 1] === C_SLASH) {
              state = S_NORMAL
              // Consume next char.
              index++
            }
          }
          break

        case S_SINGLELINE_COMMENT:
          if (ch === C_CR || ch === C_LF) {
            state = S_NORMAL
            start = index
          }
          break
      }
    }

    // Make the index usable by the next chunk.
    index -= last + 1
    if (index < 0) {
      // Buffer the last char and let the next iteration insert it if
      // appropriate.
      this.push(chunk.slice(start, -1))
    } else {
      // Don’t buffer last char.
      ch = -1
      if (state !== S_SINGLELINE_COMMENT) {
        // Output the rest of the chunk, unless we’re in a comment.
        this.push(chunk.slice(start))
      }
    }

    callback()
  }, function(callback) {
    if (ch !== -1) {
      // If there’s a buffered char left, output it.
      this.push(new Buffer([ch]))
    }
    callback()
  })
}
