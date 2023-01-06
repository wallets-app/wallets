#!/usr/bin/env node

const NODE_FLAGS = `--js-flags="--throw-deprecation"`

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'childProce... Remove this comment to see the full error message
var childProcess = require('child_process')
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var electron = require('electron')
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var jetpack = require('fs-jetpack');

var app = jetpack.cwd('../app').cwd()

// @ts-expect-error TS(2580): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = function () {
  // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
  if (process.env.ELECTRON_PATH) {
    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    electron = process.env.ELECTRON_PATH
  }
  console.log('Spawning electron', electron)
  childProcess.spawn(electron, [/*'--inspect',*/ NODE_FLAGS, app], {
    stdio: 'inherit',
    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    env: Object.assign({}, process.env, {WALLETS_DEV_MODE: '1'}) // inherit
  })
  .on('close', function () {
    // User closed the app. Kill the host process.
    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    process.exit()
  })
}

// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
if (require.main === module) {
  // @ts-expect-error TS(2580): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
  module.exports()
}
