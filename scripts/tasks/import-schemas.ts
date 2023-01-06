// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'path'.
const path = require('path')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'fs'.
const fs = require('fs')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'childProce... Remove this comment to see the full error message
const childProcess = require('child_process')
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const rimraf = require('rimraf')

const SCHEMAS = [
  'comment',
  'follows',
  'status',
  'bookmark',
  'reaction',
  'dats',
  'vote'
]

console.log('')
console.log('Cloning unwalled.garden')
console.log('')
var tmpdir = fs.mkdtempSync('unwalled-garden-')
childProcess.execSync(`git clone https://github.com/beakerbrowser/unwalled.garden ${tmpdir}`)

console.log('')
console.log('Copying schema definitions')
console.log('')
for (let name of SCHEMAS) {
  console.log(name)
  var content = fs.readFileSync(path.join(tmpdir, name + '.json'))
  // @ts-expect-error TS(2304): Cannot find name '__dirname'.
  fs.writeFileSync(path.join(__dirname, '../app/lib/schemas/unwalled.garden/', name + '.json'), content)
}

console.log('')
console.log('Removing tmpdir')
console.log('')
rimraf.sync(tmpdir)

console.log('Done!')
