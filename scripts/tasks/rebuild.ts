// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'gulp'.
var gulp = require('gulp')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'path'.
var path = require('path')
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var run = require('./util-run')
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var homedir = require('os').homedir()

function runAsync (...args: any[]) {
  return new Promise(resolve => {
    run(...args, resolve)
  })
}

const MODULES_NEEDING_REBUILD = ['sqlite3']

//(cd app && HOME=~/.electron-gyp npm rebuild --runtime=electron --target=11.0.0-beta.18 --disturl=https://electronjs.org/headers --build-from-source); gulp build

gulp.task('rebuild', gulp.series(async () => {
  // TODO read electron version
  // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
  var cwd = path.join(process.cwd(), '../app')
  console.log(cwd)
  var env = {}
  // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
  if (process.platform === 'darwin') {
    env = {
      // required to make spellchecker compile
      CXXFLAGS: '-mmacosx-version-min=10.10',
      LDFLAGS: '-mmacosx-version-min=10.10'
    }
  }
  // @ts-expect-error TS(2339): Property 'HOME' does not exist on type '{}'.
  env.HOME = path.join(homedir, '.electron-gyp')
  for (let mod of MODULES_NEEDING_REBUILD) {
    await runAsync(`npm rebuild ${mod} --runtime=electron --target=11.0.0-beta.18 --disturl=https://electronjs.org/headers --build-from-source`, {cwd, env, shell: true})
  }
  await runAsync(`npm run build`, {shell: true})
}))