'use strict';

// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var argv = require('yargs').argv;
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var os = require('os');

// @ts-expect-error TS(2580): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports.os = function () {
  switch (os.platform()) {
    case 'darwin':
      return 'osx';
    case 'linux':
      return 'linux';
    case 'win32':
      return 'windows';
  }
  return 'unsupported';
};

// @ts-expect-error TS(2580): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports.replace = function (str: any, patterns: any) {
  Object.keys(patterns).forEach(function (pattern) {
    var matcher = new RegExp('{{' + pattern + '}}', 'g');
    str = str.replace(matcher, patterns[pattern]);
  });
  return str;
};

// @ts-expect-error TS(2580): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports.getReleasePackageName = function(manifest: any) {
  // @ts-expect-error TS(2580): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
  return module.exports.replace(manifest.packageNameTemplate, {
    name: manifest.name,
    version: manifest.version,
    build: manifest.build,
    productName: manifest.productName,
    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    platform: process.platform,
    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    arch: process.arch
  });
}

// @ts-expect-error TS(2580): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports.getEnvName = function () {
  return argv.env || 'development';
};

// @ts-expect-error TS(2580): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports.getSigningId = function (manifest: any) {
  return argv.sign || (manifest.osx.codeSignIdentitiy ? manifest.osx.codeSignIdentitiy.dmg : undefined);
};

// @ts-expect-error TS(2580): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports.getMASSigningId = function (manifest: any) {
  return argv['mas-sign'] || (manifest.osx.codeSignIdentitiy ? manifest.osx.codeSignIdentitiy.MAS : undefined);
};

// @ts-expect-error TS(2580): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports.getMASInstallerSigningId = function (manifest: any) {
  return argv['mas-installer-sign'] || (manifest.osx.codeSignIdentitiy ? manifest.osx.codeSignIdentitiy.MASInstaller : undefined);
};

// @ts-expect-error TS(2580): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports.releaseForMAS = function () {
  return !!argv.mas;
};

// Fixes https://github.com/nodejs/node-v0.x-archive/issues/2318
// @ts-expect-error TS(2580): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports.spawnablePath = function (path: any) {
  // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
  if (process.platform === 'win32') {
    return path + '.cmd';
  }
  return path;
};
