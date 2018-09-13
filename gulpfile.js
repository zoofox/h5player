var gulp = require("gulp");
var changed = require("gulp-changed");

var sass = require('gulp-sass');

//ngmin will only get the files that changed since the last time it was run
var origeSrc = './scss/**/*.scss';
var dest = './css/';

gulp.task('sass', function(){
    return gulp.src(origeSrc)
    	  .on('error', sass.logError) // 错误信息
    	  .pipe(changed(dest))
          .pipe(sass({ style: 'compressed' }))
          .pipe(gulp.dest(dest))
    
});

gulp.task('watch',function(e){
    gulp.watch(origeSrc,['sass'])
    .on('error', sass.logError) // 错误信息
});

  gulp.task('default', ['watch'])




