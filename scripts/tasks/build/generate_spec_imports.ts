// Spec files are scattered through the whole project. Here we're searching
// for them and generate one entry file which will run all the tests.

'use strict';

// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var jetpack = require('fs-jetpack');
var srcDir = jetpack.cwd('app');

var fileName = 'spec.js.autogenerated';
var fileBanner = "// This file is generated automatically.\n"
  + "// All your modifications to it will be lost (so don't do it).\n";
var whatToInclude = [
  '*.spec.js',
  '!node_modules/**',
];

// @ts-expect-error TS(2580): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = function () {
  return srcDir.findAsync('.', { matching: whatToInclude })
    .then(function (specPaths: any) {
      var fileContent = specPaths.map(function (path: any) {
        return 'import "./' + path.replace('\\', '/') + '";';
      }).join('\n');
      return srcDir.writeAsync(fileName, fileBanner + fileContent);
    })
    .then(function () {
      return srcDir.path(fileName);
    });
};
