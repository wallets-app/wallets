// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'path'.
const path = require('path');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'fs'.
const fs = require('fs');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'crypto'.
const crypto = require('crypto');

// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
console.log('Generating hash for', process.argv[2])

function hashFile(file: any, algorithm = 'sha512', encoding = 'base64', options: any) {
  return new Promise((resolve, reject) => {
    // @ts-expect-error TS(2339): Property 'createHash' does not exist on type 'Cryp... Remove this comment to see the full error message
    const hash = crypto.createHash(algorithm);
    hash.on('error', reject).setEncoding(encoding);
    fs.createReadStream(
      file,
      Object.assign({}, options, {
        highWaterMark: 1024 * 1024,
        /* better to use more memory but hash faster */
      })
    )
      .on('error', reject)
      .on('end', () => {
        hash.end();
        console.log('hash done');
        console.log(hash.read());
        resolve(hash.read());
      })
      .pipe(
        hash,
        {
          end: false,
        }
      );
  });
}

const installerPath = path.resolve(
  // @ts-expect-error TS(2304): Cannot find name '__dirname'.
  __dirname,
  '..',
  'dist',
  // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
  process.argv[2]
);

// @ts-expect-error TS(2554): Expected 4 arguments, but got 1.
hashFile(installerPath);