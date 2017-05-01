var gulp = require("gulp");
var tsc = require("gulp-typescript");
var sourcemaps = require('gulp-sourcemaps');

gulp.task("build", () => {
    var tsProject = tsc.createProject("./tsconfig.json");
    return gulp.src("./src/**/*.ts")
        .pipe(sourcemaps.init())
        .pipe(tsProject(tsc.reporter.defaultReporter()))
        .pipe(sourcemaps.write("./maps"))
        .pipe(gulp.dest("./output/"));
});

gulp.task("default", ["build"]);