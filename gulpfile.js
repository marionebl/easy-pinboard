var gulp = require('gulp'),
    rename = require('gulp-rename');
    clean = require('gulp-clean'),
    myth = require('gulp-myth'),
    concat = require('gulp-concat'),
    minify = require('gulp-minify-css'),
    browserify = require('gulp-browserify'),
    uglify = require('gulp-uglify'),
    livereload = require('gulp-livereload');


gulp.task('clean', function(){
  return gulp.src('build', { read: false })
    .pipe(clean({
      force: true
    }));
});

gulp.task('copy', ['clean'], function(){
  gulp.src('app/templates/*.html')
    .pipe(gulp.dest('./build'));

  gulp.src('manifest.json')
    .pipe(gulp.dest('./build'));

  return gulp.src('theme/**/*')
    .pipe(gulp.dest('./build/theme'));
});

gulp.task('concat', ['copy'], function(){
  return gulp.src('build/theme/**/*.css')
    .pipe(myth())
    .pipe(concat('app.css'))
    .pipe(gulp.dest('./build'))

});

gulp.task('minify', ['copy', 'concat'], function(){
  return gulp.src('build/app.css')
    .pipe(minify())
    .pipe(rename('app.min.css'))
    .pipe(gulp.dest('./build'));
});

gulp.task('browserify', ['copy'], function(){
  return gulp.src('app/app.js', { read: false })
    .pipe(browserify({
      insertGlobals: true,
      transform: ['debowerify', 'browserify-handlebars'],
      debug: !gulp.env.production
    }))
    .pipe(gulp.dest('./build'));
});

gulp.task('uglify', ['copy', 'browserify'], function(){
  return gulp.src('./build/app.js')
    .pipe(uglify({
      preseverComments: 'some'
    }))
    .pipe(rename('app.min.js'))
    .pipe(gulp.dest('./build'));
});

gulp.task('reload', ['build'], function(){
  server.changed();
});

gulp.task('watch', function(){
  var server = livereload();
  var ward = gulp.watch(['app/**/*', 'theme/**/*']);

  ward.on('change', function(file){
    gulp.run('build', function(){
      server.changed(file);
    });
  });
});

gulp.task('setup', ['clean', 'copy']);
gulp.task('css', ['setup', 'concat', 'minify']);
gulp.task('js', ['setup', 'css', 'browserify', 'uglify']);
gulp.task('build', ['setup', 'css', 'js']);
gulp.task('default', ['build']);