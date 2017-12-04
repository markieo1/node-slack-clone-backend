let gulp = require('gulp');
let ts = require('gulp-typescript');
let sourcemaps = require('gulp-sourcemaps');
let tsProject = ts.createProject('tsconfig.json');
let del = require('del');
let nodemon = require('gulp-nodemon');
let runSequence = require('run-sequence');

gulp.task('clean', () => {
    return del([
        tsProject.options.outDir
    ]);
});

gulp.task('compile', () => {
    let tsResult = tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(tsProject());

    return tsResult.js
        .pipe(gulp.dest(tsProject.options.outDir))
        .pipe(sourcemaps.write());
});

gulp.task('watch', () => {
    return gulp.watch('src/**/*', ['compile']);
});

gulp.task('serve.prod', ['build', 'watch'], () => {
    nodemon({
        script: tsProject.options.outDir + '/index.js',
        env: {
            NODE_ENV: 'production'
        }
    }).on('restart', () => {
        console.log('Node app restarted.');
    });
});

gulp.task('serve.dev', ['build', 'watch'], () => {
    nodemon({
        script: tsProject.options.outDir + '/index.js',
        watch: [tsProject.options.outDir],
        env: {
            NODE_ENV: 'development'
        }
    });
});

gulp.task('serve', ['serve.dev']);

gulp.task('build', (cb) => {
    runSequence('clean', 'compile', cb);
});

gulp.task('default', ['serve']);