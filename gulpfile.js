"use strict";

const gulp = require('gulp');
const rimraf = require('gulp-rimraf');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const tsify = require('tsify');

var paths = {
    ts: "./src/",
    destJs: "./dist/js/",
    node: "./node_modules/"
};

function log(str) {
    var d = new Date();

    var ts = ("0" + d.getHours()).slice(-2) + ':' + ("0" + d.getMinutes()).slice(-2) + ':' + ("0" + d.getSeconds()).slice(-2);
    console.log('[' + ts + '] ' + str);
}

gulp.task('clean', function (done) {
    gulp.src(paths.destJs + '**', { read: false }).pipe(rimraf({ force: true }));
    done();
});


/* typescript */
const devTs = (cb) => {
    log('Compiling typescript [dev]');
    browserify({ 
        entries: paths.ts + 'main.ts',
        debug: true
    })
        .plugin(tsify)
        .bundle()
        .pipe(source('dgt.min.js'))
        .pipe(gulp.dest(paths.destJs));
    log('Typescript compiled to ' + paths.destJs);

    if (cb && typeof cb === "function") {
        cb();
    }
};


// const prodTs 
// 
// uglify { unused: true, dead_code: true }
//

gulp.task('devTs', devTs);