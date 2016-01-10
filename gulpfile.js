var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var path = require('path');

var plumber = require('gulp-plumber');

/**
 * Helper function to amend the pipe when a build task fails
 * see https://github.com/hughsk/vinyl-transform/issues/1
 * and: https://github.com/gulpjs/gulp/issues/259
 * @param {string} err  the error string
 */
function onError (err) {
  //gutil.beep();
  console.log(err);
  this.emit('end');
}

var paths = {
  es6: ['es6/**/*.js'],
  es5: 'es5',
  // Must be absolute or relative to source map
  sourceRoot: path.join(__dirname, 'es6'),
};

gulp.task('babel', function () {
  return gulp.src(paths.es6)
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write('.', { sourceRoot: paths.sourceRoot }))
    .pipe(gulp.dest(paths.es5));
});

gulp.task('watch', function() {
  gulp.watch(paths.es6, ['babel']);
});

gulp.task('default', ['watch']);