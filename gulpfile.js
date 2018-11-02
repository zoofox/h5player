var gulp = require("gulp");
var changed = require("gulp-changed");
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
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

gulp.task('player', function () {
    gulp.src(['js/flv.min.js',
        'js/h5playerStreamManager.js',
        'js/h5playerGiftcomboAnimation.js',
        'js/h5playerSystemMessage.js',
        'js/h5playerBarrageQueue.js',
        'js/h5playerBarrageTunnelManager.js',
        'js/h5playerBarrageBulletManager.js',
        'js/h5playerBarrage.js',
        'js/h5playerLive.js',
        'js/h5playerControlBar.js',
        'js/h5player.js'
       ])
        .pipe(concat('h5player.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./js'));
        
});


  gulp.task('default', ['watch'])




