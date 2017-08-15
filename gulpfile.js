var gulp            = require('gulp'),
    sass            = require('gulp-sass'),
    notify          = require('gulp-notify'),
    autoprefixer    = require('gulp-autoprefixer'),
    sourcemaps      = require('gulp-sourcemaps'),
    cleanCSS        = require('gulp-clean-css'),
    rename          = require('gulp-rename'),
    clean           = require('del'),
    useref          = require('gulp-useref'),
    gulpif          = require('gulp-if'),
    uglify          = require('gulp-uglify'),
    lineec          = require('gulp-line-ending-corrector'),
    imagemin        = require('gulp-imagemin'),
    browsersync     = require('browser-sync').create();

var projectproxy = 'local.dev';

gulp.task('sass', ['sass:clean'], function () {
  return gulp
    .src('./src/scss/**/*.scss')
    .pipe(sass({
      outputStyle: 'compressed'
    }))
    .on('error', console.error.bind(console))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(sourcemaps.init())
      .pipe(cleanCSS({
        level: 2
      }))
      .pipe(rename({suffix: '.min'}))
    .pipe(sourcemaps.write('./maps'))
    .pipe(lineec())
    .pipe(gulp.dest('./dist/css'))
    .pipe(browsersync.reload({ stream:true }))
    .pipe(notify({title: 'SASS Task', message: 'SASS compiled!', timeout: 2, onLast: true}));
});

gulp.task('sass:clean', function() {
  return clean([
    './dist/css/**/*.css'
  ]);
});

gulp.task('images', ['images:clean'], function() {
  return gulp.src('./src/img/**/*')
    .pipe(imagemin({
      progressive: true,
      optimizationLevel: 5, // 0-7 low-high
      interlaced: true,
      svgoPlugins: [{removeViewBox: false}]
    }))
    .pipe(gulp.dest('./dist/img'))
    .pipe(notify({title: 'Images Task', message: 'Images compressed!', timeout: 2, onLast: true}));
});

gulp.task('images:clean', function() {
  return clean([
    './dist/img/**/*'
  ]);
});

gulp.task('images:watch', ['images'], function(done) {
  browsersync.reload();
  done();
});

gulp.task('php', ['php:clean'], function() {
  return gulp
    .src('./**/*.php')
    .pipe(useref())
    .pipe(gulpif('*.js', uglify({
      mangle: {
        toplevel: true,
      }
    })))
    .pipe(gulpif('*.css', cleanCSS({
      level: 2
    })))
    .pipe(gulp.dest('./dist'))
    .pipe(notify({title: 'PHP Task', message: 'PHP compiled!', timeout: 2, onLast: true}));
});

gulp.task('php:clean', function() {
  return clean([
    './dist/**/*.php',
    './dist/js/**/*.js'
  ]);
});

gulp.task('php:watch', ['php'], function(done) {
  browsersync.reload();
  done();
});

gulp.task('browsersync', ['sass', 'php', 'images'], function() {
  browsersync.init({
    proxy: projectproxy,
    notify: false,
    open: false
  });
});

gulp.task('watch', ['browsersync'], function() {
  gulp.watch('./src/scss/**/*.scss', ['sass']);
  gulp.watch(['./*.php', './inc/**/*.php', './views/**/*.php', './src/js/**/*.js'], ['php:watch']);
  gulp.watch('./src/img/**/*', ['images:watch']);
}); 

gulp.task('default', ['browsersync', 'sass', 'php', 'images', 'watch']);