var gulp = require("gulp"),
    tsc = require("gulp-typescript"),
    sourcemaps = require('gulp-sourcemaps'),
    clean = require('gulp-clean'),
    util = require('gulp-util');

var isProductionBuild = !!util.env.production;
console.log('Is Production Build? ', isProductionBuild);

gulp.task("ts", () => {
    var tsProject = tsc.createProject("./tsconfig.json");
    return gulp.src("./src/**/*.ts")
        .pipe(!isProductionBuild ? sourcemaps.init() : util.noop())
        .pipe(tsProject(tsc.reporter.defaultReporter()))
        .pipe(!isProductionBuild ? sourcemaps.write("./maps") : util.noop())
        .pipe(gulp.dest("./output/"));
});

gulp.task("copyConfig", () => {
    return gulp.src("./src/config.json").pipe(!isProductionBuild ? gulp.dest("./output/") : util.noop());
});

gulp.task('cleanOutput', () => {
    return gulp.src('./output').pipe(clean());
})

gulp.task("default", ['cleanOutput', "ts", "copyConfig"]);