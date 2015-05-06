// Copyright 2015 Simon Lydell
// X11 (“MIT”) Licensed. (See LICENSE.)

var gulp         = require("gulp")
var tap          = require("gulp-tap")
var toBuffer     = require("gulp-buffer")
var diff         = require("gulp-diff")
var concatStream = require("concat-stream")
var concat       = require("gulp-concat")
var bench        = require("gulp-bench")
var strip        = require("./")

// This task is both a usage example and used for testing.
gulp.task("css", function() {
  // Make sure to set `buffer: false` to enable streams.
  return gulp.src("test/fixtures/*", {buffer: false})
    // No need for a specific gulp plugin! Just use `gulp-tap`.
    .pipe(tap(function(file) {
      file.contents = file.contents.pipe(strip())
    }))
    // You may pipe the stripped contents directly to a destination …
    // .pipe(gulp.dest("dest"))
    // … or you may pipe it to more plugins. Many do not support streams, so you
    // might need `gulp-buffer`.
    .pipe(toBuffer())
    .pipe(diff("test/expected"))
    .pipe(diff.reporter({fail: true}))
})

// The rest of the file is only used for testing.

// Test chunks with inconvenient breaks.
gulp.task("chunks", function(callback) {
  var parts = "font: 16px/|1.2 'Apo\\|'s font'/|*Tahoma*|/; /|/X|X\r|/"
              .split("|")
  var expected = parts.join('').replace(/\/\/X+/g, '')
  var stream = strip()
  parts.forEach(function(chunk) { stream.write(chunk) })
  stream.pipe(concatStream({encoding: "string"}, function(actual) {
    if (actual === expected) {
      callback()
    } else {
      callback(new Error(
        "\nExpected\n  " + JSON.stringify(actual) +
        "\nto equal\n  " + JSON.stringify(expected)
      ))
    }
  }))
  stream.end()
})

gulp.task("test", ["css", "chunks"])

gulp.task("bench-prepare", function() {
  return gulp.src("node_modules/bootstrap/less/**/*.less")
    .pipe(concat("bootstrap.all.less"))
    .pipe(gulp.dest("."))
})

gulp.task("bench", ["bench-prepare"], function() {
  return gulp.src("bench.js", {read: false})
    .pipe(bench())
})

gulp.task("default", ["test"])
