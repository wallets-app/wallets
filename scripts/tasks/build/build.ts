'use strict';

// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var pathUtil = require('path');
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var Q = require('q');
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var gulp = require('gulp');
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var watch = require('gulp-watch');
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var batch = require('gulp-batch');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'childProce... Remove this comment to see the full error message
var childProcess = require('child_process')
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var plumber = require('gulp-plumber');
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var jetpack = require('fs-jetpack');

// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var bundle = require('./bundle');
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var generateSpecImportsFile = require('./generate_spec_imports');
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var utils = require('../utils');

var projectDir = jetpack;
var srcDir = projectDir.cwd('../app');

// -------------------------------------
// Tasks
// -------------------------------------

function burnthemallMaybeTask () {
  const beakerPackageJson = projectDir.read('package.json', 'json')
  const electronPackageJson = projectDir.read('node_modules/electron/package.json', 'json')
  if (!beakerPackageJson || !electronPackageJson) return Promise.resolve(true)

  // is the installed version of electron different than the required one?
  if (false) {
    console.log('~~Electron version change detected.~~')
    console.log('We need to rebuild to fit the new version.')
    console.log('###### BURN THEM ALL! ######')

    childProcess.spawn('npm', ['run', 'burnthemall'], {
      stdio: 'inherit',
      // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
      env: process.env // inherit
    })
    return Promise.reject(new Error('Aborting build to do a full reinstall and rebuild'))
  }
  return Promise.resolve(true)
}

gulp.task('burnthemall-maybe', gulp.series(burnthemallMaybeTask))

var bundleApplication = function () {
  var fgDir = srcDir.cwd('fg')
  var userlandDir = srcDir.cwd('userland')
  return Q.all([
    bundle(srcDir.path('main.js'),                     srcDir.path('main.build.js')),
    bundle(fgDir.path('webview-preload/index.js'),     fgDir.path('webview-preload/index.build.js'), { browserify: true, basedir: srcDir.cwd(), browserifyBuiltins: true }),
    bundle(fgDir.path('shell-window/index.js'),        fgDir.path('shell-window/index.build.js'), { browserify: true, basedir: srcDir.cwd(), browserifyBuiltins: true, browserifyExclude: ['fs'] }),
    bundle(fgDir.path('shell-menus/index.js'),         fgDir.path('shell-menus/index.build.js'), { browserify: true, basedir: srcDir.cwd(), browserifyBuiltins: true }),
    bundle(fgDir.path('location-bar/index.js'),        fgDir.path('location-bar/index.build.js'), { browserify: true, basedir: srcDir.cwd(), browserifyBuiltins: true }),
    bundle(fgDir.path('prompts/index.js'),             fgDir.path('prompts/index.build.js'), { browserify: true, basedir: srcDir.cwd(), browserifyBuiltins: true }),
    bundle(fgDir.path('perm-prompt/index.js'),         fgDir.path('perm-prompt/index.build.js'), { browserify: true, basedir: srcDir.cwd(), browserifyBuiltins: true }),
    bundle(fgDir.path('modals/index.js'),              fgDir.path('modals/index.build.js'), { browserify: true, basedir: srcDir.cwd(), browserifyBuiltins: true }),
    bundle(fgDir.path('json-renderer/index.js'),       fgDir.path('json-renderer/index.build.js'), { browserify: true, basedir: srcDir.cwd(), excludeNodeModules: true }),
    bundle(userlandDir.path('site-info/js/main.js'),   userlandDir.path('site-info/js/main.build.js'), { browserify: true, basedir: srcDir.cwd(), browserifyBuiltins: true }),
    bundle(userlandDir.path('editor/js/main.js'),      userlandDir.path('editor/js/main.build.js'), { browserify: true, basedir: srcDir.cwd(), browserifyBuiltins: true }),
    bundle(userlandDir.path('settings/js/main.js'),    userlandDir.path('settings/js/main.build.js'), { browserify: true, basedir: srcDir.cwd(), browserifyBuiltins: true })
  ]);
};

var bundleSpecs = function () {
  return generateSpecImportsFile().then(function (specEntryPointPath: any) {
    // @ts-expect-error TS(2304): Cannot find name 'srcPath'.
    return bundle(specEntryPointPath, srcPath.path('spec.build.js'));
  });
};

var bundleTask = function () {
  if (utils.getEnvName() === 'test') {
    return bundleSpecs();
  }
  return bundleApplication();
};
gulp.task('bundle', gulp.series(['burnthemall-maybe'], bundleTask));
gulp.task('bundle-watch', gulp.series(bundleTask));

gulp.task('build', gulp.series(['bundle']));

gulp.task('watch', gulp.series(['build', function () {
  gulp.watch(['app/**/*.js', '!app/**/*.build.js'], gulp.series('bundle-watch'))
  return Promise.resolve(true)
}]));
