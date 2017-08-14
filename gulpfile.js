var gulp            = require('gulp'),
    sass            = require('gulp-sass'),
    notify          = require("gulp-notify"),
    autoprefixer    = require('gulp-autoprefixer'),
    sourcemaps      = require('gulp-sourcemaps'),
    cleanCSS        = require('gulp-clean-css'),
    rename          = require('gulp-rename'),
    clean           = require('gulp-clean'),
    useref          = require('gulp-useref'),
    gulpif          = require('gulp-if'),
    uglify          = require('gulp-uglify'),
    lineec          = require('gulp-line-ending-corrector'),
    imagemin        = require('gulp-imagemin'),
    mmq             = require('gulp-merge-media-queries'),
    browsersync     = require('browser-sync').create();

var projectproxy = 'local.dev';

gulp.task('clean-build', function() {
  return gulp.src('./dist', {read: false})
    .pipe(clean());
});

gulp.task('sass', ['clean-build'], function () {
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
      .pipe(mmq({
        log:true
      }))
      .pipe(cleanCSS())
      .pipe(rename({suffix: '.min'}))
    .pipe(sourcemaps.write('./maps'))
    .pipe(lineec())
    .pipe(gulp.dest('./dist/css'))
    .pipe(browsersync.reload({ stream:true }))
    .pipe(notify({title: "Gulp Task", message: "Completed!", timeout: 2, onLast: true}));
});

gulp.task('images', ['clean-build'], function() {
  gulp.src('./src/img/**/*')
    .pipe(imagemin({
      progressive: true,
      optimizationLevel: 5, // 0-7 low-high
      interlaced: true,
      svgoPlugins: [{removeViewBox: false}]
    }))
    .pipe(gulp.dest('./dist/img'))
});

gulp.task('php', ['clean-build'], function() {
  return gulp
    .src('./**/*.php')
    .pipe(useref())
    .pipe(gulpif('*.js', uglify({
      mangle: {
        toplevel: true,
      }
    })))
    .pipe(gulp.dest('./dist'));
});

gulp.task('browsersync', ['sass', 'php', 'images'], function() {
  browsersync.init({
      proxy: projectproxy,
      notify: false,
      open: false
    });
});

gulp.task('watch', ['clean-build', 'browsersync'], function() {
  gulp.watch('./src/scss/**/*.scss', ['sass', 'php', 'images']);
  gulp.watch('./*.php', ['sass', 'php', 'images']);
  gulp.watch('./inc/**/*.php', ['sass', 'php', 'images']);
  gulp.watch('./views/**/*.php', ['sass', 'php', 'images']);
  gulp.watch('./src/img/**/*', ['sass', 'php', 'images']);
}); 

gulp.task('default', ['browsersync', 'sass', 'php', 'images', 'watch']);