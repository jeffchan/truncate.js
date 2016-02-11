var jshint = require('gulp-jshint'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  gulp = require('gulp');

gulp.task('lint', function() {
  return gulp.src('truncate.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('uglify', function() {
  return gulp.src('truncate.js')
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist/'));
});

gulp.task('copy', function() {
  return gulp.src('truncate.js')
    .pipe(gulp.dest('dist/'));
});

gulp.task('build', ['lint', 'copy', 'uglify']);
