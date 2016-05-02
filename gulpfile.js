// Built from http://christianalfoni.github.io/javascript/2014/08/15/react-js-workflow.html
var gulp = require('gulp');
var util = require('gulp-util');
var source = require('vinyl-source-stream'); // Used to stream bundle for further handling
var browserify = require('browserify');
var watchify = require('watchify');
var envify = require('envify/custom');
var concat = require('gulp-concat');

var addUglify = function(bundler) {
  return bundler.transform(envify({NODE_ENV: 'production'}), {global: true})
  .transform('uglifyify', {global: true});
};

var createBundle = function(bundler) {
  bundler.bundle() // Create new bundle that uses the cache for high performance
  .pipe(source('bundle.js'))
  .pipe(gulp.dest('public/dist/'));
};

gulp.task('browserify', function() {
  var bundler = browserify({
    entries: ['public/scripts/index.jsx'], // Only need initial file, browserify finds the deps
    debug: true, // Gives us sourcemapping
    cache: {}, packageCache: {}, fullPaths: false // Requirement of watchify
  })
  .transform('reactify');

  if (util.env.production) {
    addUglify(bundler);
  } else {
    bundler = watchify(bundler);

    bundler.on('update', function() { // When any files update
      createBundle(bundler);
    });
  }

  createBundle(bundler);
});

var concatCss = function() {
  gulp.src('public/css/*.css')
  .pipe(concat('bundle.css'))
  .pipe(gulp.dest('public/dist/'));
};

// I added this so that you see how to run two watch tasks
gulp.task('css', function() {
  if (!util.env.production) {
    gulp.watch('public/css/*.css', function() {
      concatCss();
    });
  }
  concatCss();
});

// Just running the two tasks
gulp.task('default', ['browserify', 'css']);
