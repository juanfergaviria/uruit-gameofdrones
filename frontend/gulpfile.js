/*
 Gulp and Plugins
 */
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var minifyCSS = require('gulp-minify-css');
var clean = require('gulp-clean');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');

/*
 Tasks
 */
gulp.task('lint', function() {
  gulp.src(['./app/**/*.js', '!./app/bower_components/**'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('clean', function() {
  gulp.src('./dist/*')
    .pipe(clean({force: true}));
});

gulp.task('minify-css', function() {
  var opts = {comments: true, spare: true};
  gulp.src(['./app/**/*.css', '!./app/bower_components/**'])
    .pipe(minifyCSS(opts))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('minify-js', function() {
  var opts = {};
  gulp.src(['./app/**/*.js', '!./app/bower_components/**'])
    .pipe(uglify(opts))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('copy-bower-components', function() {
  gulp.src('./app/bower_components/**')
    .pipe(gulp.dest('dist/bower_components'));
});

gulp.task('copy-html-files', function() {
  gulp.src('./app/**/*.html')
    .pipe(gulp.dest('dist/'));
});

gulp.task('connect', function() {
  browserSync({
    server: {
      baseDir: 'app/'
    },
    ui: {
      port: 8080
    }
  });
});

gulp.task('connectDist', function() {
  browserSync({
    server: {
      baseDir: 'dist/'
    },
    ui: {
      port: 8080
    }
  });
});

gulp.task('watch', function() {
  gulp.watch(['./app/**/*.html', './app/css/*.css', './app/js/*.js'], ['browser-reload']);
});

gulp.task('browser-reload', function() {
  browserSync.reload();
});

/*
 Default Tasks
 */
gulp.task('default', ['lint', 'connect', 'watch']);

gulp.task('build', function() {
  runSequence(
    ['clean'],
    ['lint', 'minify-css', 'minify-js', 'copy-html-files', 'copy-bower-components', 'connectDist']
  );
});