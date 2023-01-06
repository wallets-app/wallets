// this script cant depend on any modules except what's bundled with node
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'path'.
var path = require('path')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'fs'.
var fs = require('fs')
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var run = require('./util-run')
var _0666 = parseInt('666', 8)
// for EMFILE handling
var timeout = 0

// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
var isWindows = (process.platform === "win32")

function main () {
  // @ts-expect-error TS(2304): Cannot find name '__dirname'.
  var projectDir = __dirname.split(path.sep).filter(Boolean).slice(0, -2).join(path.sep)
  if (!isWindows) projectDir = path.sep + projectDir
  var appDir = path.join(projectDir, 'app')
  var scriptsDir = path.join(projectDir, 'scripts')
  rmNodeModules(scriptsDir)
  rmNodeModules(appDir)
  rmPackageLock(scriptsDir)
  rmPackageLock(appDir)
  run('npm install', {shell: true}, function () {
    run('npm run rebuild', {shell: true}, function () {
      run('npm run build', {shell: true}, function () {
        // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
        process.exit(0)
      })
    })
  })
}

function rmNodeModules (dir: any) {
  dir = path.join(dir, 'node_modules')
  console.log('rm -rf', dir)
  rimrafSync(dir)
}

function rmPackageLock (dir: any) {
  var file = path.join(dir, 'package-lock.json')
  console.log('rm', file)
  rimrafSync(file)
}

main()

// rimrafSync, pulled from rimraf

function rimrafSync (p: any) {
  try {
    var st = fs.lstatSync(p)
  } catch (er) {
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    if (er.code === "ENOENT")
      return

    // Windows can EPERM on stat.  Life is suffering.
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    if (er.code === "EPERM" && isWindows)
      fixWinEPERMSync(p, er)
  }

  try {
    // sunos lets the root user unlink directories, which is... weird.
    if (st && st.isDirectory())
      rmdirSync(p, null)
    else
      fs.unlinkSync(p)
  } catch (er) {
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    if (er.code === "ENOENT")
      return
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    if (er.code === "EPERM")
      return isWindows ? fixWinEPERMSync(p, er) : rmdirSync(p, er)
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    if (er.code !== "EISDIR")
      throw er

    rmdirSync(p, er)
  }
}

function rmdirSync (p: any, originalEr: any) {
  try {
    fs.rmdirSync(p)
  } catch (er) {
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    if (er.code === "ENOENT")
      return
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    if (er.code === "ENOTDIR")
      throw originalEr
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    if (er.code === "ENOTEMPTY" || er.code === "EEXIST" || er.code === "EPERM")
      rmkidsSync(p)
  }
}

function rmkidsSync (p: any) {
  fs.readdirSync(p).forEach(function (f: any) {
    rimrafSync(path.join(p, f))
  })

  // We only end up here once we got ENOTEMPTY at least once, and
  // at this point, we are guaranteed to have removed all the kids.
  // So, we know that it won't be ENOENT or ENOTDIR or anything else.
  // try really hard to delete stuff on windows, because it has a
  // PROFOUNDLY annoying habit of not closing handles promptly when
  // files are deleted, resulting in spurious ENOTEMPTY errors.
  var retries = isWindows ? 100 : 1
  var i = 0
  do {
    var threw = true
    try {
      var ret = fs.rmdirSync(p)
      threw = false
      return ret
    } finally {
      if (++i < retries && threw)
        continue
    }
  } while (true)
}

function fixWinEPERMSync (p: any, er: any) {
  try {
    fs.chmodSync(p, _0666)
  } catch (er2) {
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    if (er2.code === "ENOENT")
      return
    else
      throw er
  }

  try {
    var stats = fs.statSync(p)
  } catch (er3) {
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    if (er3.code === "ENOENT")
      return
    else
      throw er
  }

  if (stats.isDirectory())
    rmdirSync(p, er)
  else
    fs.unlinkSync(p)
}