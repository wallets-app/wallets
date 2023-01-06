'use strict'

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'gulp'.
const gulp = require('gulp')
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const start = require('./start-cli')

gulp.task('start', gulp.series(start))
gulp.task('start-watch', gulp.series('watch', start))
