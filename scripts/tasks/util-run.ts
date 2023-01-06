// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'childProce... Remove this comment to see the full error message
const childProcess = require('child_process')
// @ts-expect-error TS(2580): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = function (cmd: any, opts: any, cb: any) {
  opts = opts || {}
  cb = cb || function(){}
  console.log(cmd)
  cmd = cmd.split(' ')
  opts.stdio = 'inherit'
  // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
  opts.env = Object.assign({}, process.env, opts.env || {})
  childProcess.spawn(cmd[0], cmd.slice(1), opts)
    .on('error', console.log)
    .on('close', cb)
}
