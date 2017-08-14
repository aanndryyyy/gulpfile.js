var gulp            = require('gulp'),
    sass            = require('gulp-sass'),
    notify          = require("gulp-notify"),
    autoprefixer    = require('gulp-autoprefixer'),
    sourcemaps      = require('gulp-sourcemaps'),
    cleanCSS        = require('gulp-clean-css'),
    rename          = require('gulp-rename'),
    clean           = require('gulp-clean'),
    browsersync     = require('browser-sync').create();

var projectproxy = 'local.dev';

gulp.task('clean-build', function() {
  return gulp.src('./dist', {read: false})
    .pipe(clean());
});

gulp.task('sass', ['clean-build'], function () {
  return gulp
    .src('./src/scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(sourcemaps.init())
      .pipe(cleanCSS())
      .pipe(rename({suffix: '.min'}))
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest('./dist/css'))
    .pipe(notify({title: "SASS", message: "SASS Compiled! (<%= file.relative %>)", timeout: 2}))
    .pipe(browsersync.reload({ stream:true }));
});

gulp.task('php', ['clean-build'], function() {
  return gulp
    .src('./**/*.php')
    .pipe(gulp.dest('./dist'));
});

gulp.task('browsersync', ['sass', 'php'], function() {
  browsersync.init({
      proxy: projectproxy,
      notify: false,
      open: false
    });
});

gulp.task('watch', ['clean-build', 'browsersync'], function() {
  gulp.watch('./src/scss/**/*.scss', ['sass']);
  gulp.watch('./*.php', ['php']);
  gulp.watch('./inc/**/*.php', ['php']);
  gulp.watch('./views/**/*.php', ['php']);
}); 

gulp.task('default', ['browsersync', 'sass', 'php', 'watch']);