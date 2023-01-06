(function () {'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var electron = require('electron');
var path = require('path');
var path__default = _interopDefault(path);
var winston = require('winston');
var fs = require('fs');
var fs__default = _interopDefault(fs);
var jetpack = _interopDefault(require('fs-jetpack'));
var fsReverse = _interopDefault(require('fs-reverse'));
var concat = _interopDefault(require('concat-stream'));
var pump = _interopDefault(require('pump'));
var split2 = _interopDefault(require('split2'));
var through2 = _interopDefault(require('through2'));
var stream$2 = require('stream');
var os = require('os');
var os__default = _interopDefault(os);
var string_decoder = require('string_decoder');
var readableStream = require('readable-stream');
var electronUpdater = require('electron-updater');
var ICO = _interopDefault(require('icojs'));
var toIco = _interopDefault(require('to-ico'));
var emitStream = _interopDefault(require('emit-stream'));
var EventEmitter = require('events');
var EventEmitter__default = _interopDefault(EventEmitter);
var LRU = _interopDefault(require('lru'));
var adblocker = require('@cliqz/adblocker');
var fetch = _interopDefault(require('cross-fetch'));
var sqlite3 = _interopDefault(require('sqlite3'));
var FnQueue = _interopDefault(require('function-queue'));
var _get = _interopDefault(require('lodash.get'));
var childProcess = require('child_process');
var mkdirp = _interopDefault(require('mkdirp'));
var rimraf = _interopDefault(require('rimraf'));
var pda = require('pauls-dat-api2');
var pda__default = _interopDefault(pda);
var datEncoding = _interopDefault(require('dat-encoding'));
var debounce = _interopDefault(require('lodash.debounce'));
var url = require('url');
var url__default = _interopDefault(url);
var beakerErrorConstants = require('beaker-error-constants');
var AwaitLock = _interopDefault(require('await-lock'));
var bytes = _interopDefault(require('bytes'));
var ms = _interopDefault(require('ms'));
var datDnsFactory = _interopDefault(require('dat-dns'));
var base32 = require('base32.js');
var crypto = require('crypto');
var crypto__default = _interopDefault(crypto);
var HyperdriveClient = _interopDefault(require('hyperdrive-daemon-client'));
var mime = _interopDefault(require('mime'));
var rpc = require('pauls-electron-rpc');
var _throttle = _interopDefault(require('lodash.throttle'));
var _pick = _interopDefault(require('lodash.pick'));
var _isEqual = _interopDefault(require('lodash.isequal'));
var _flattenDeep = _interopDefault(require('lodash.flattendeep'));
var isAccelerator = _interopDefault(require('electron-is-accelerator'));
var equals = _interopDefault(require('keyboardevents-areequal'));
var keyboardeventFromElectronAccelerator = require('keyboardevent-from-electron-accelerator');
var speedometer = _interopDefault(require('speedometer'));
var parseDataURL = _interopDefault(require('data-urls'));
var git = _interopDefault(require('isomorphic-git'));
var http = _interopDefault(require('isomorphic-git/http/node'));
var moment = _interopDefault(require('moment'));
var assert = _interopDefault(require('assert'));
var https = _interopDefault(require('https'));
var querystring = _interopDefault(require('querystring'));
var osName = _interopDefault(require('os-name'));
var natUpnp = _interopDefault(require('nat-upnp'));
var dft = _interopDefault(require('diff-file-tree'));
var watch$1 = _interopDefault(require('recursive-watch'));
var MarkdownIt = _interopDefault(require('markdown-it'));
var emojiRegex = _interopDefault(require('emoji-regex'));
var streamx = require('streamx');
var http$1 = _interopDefault(require('http'));
var identifyFiletype = _interopDefault(require('identify-filetype'));
require('textextensions');
require('binary-extensions');
var once$2 = _interopDefault(require('once'));
var intoStream$2 = _interopDefault(require('into-stream'));
var parseRange = _interopDefault(require('range-parser'));
var datServeResolvePath = _interopDefault(require('@beaker/dat-serve-resolve-path'));
var util = require('util');
var ScopedFS = _interopDefault(require('scoped-fs'));
var dgram = _interopDefault(require('dgram'));

var modalsSubwindow = /*#__PURE__*/Object.freeze({
  __proto__: null,
  get setup () { return setup$n; },
  get destroy () { return destroy$7; },
  get reposition () { return reposition$7; },
  get create () { return create$3; },
  get get () { return get$d; },
  get show () { return show$7; },
  get hide () { return hide$7; },
  get close () { return close$2; },
  get handleContextMenu () { return handleContextMenu; }
});

/**
 * Helper to get environment variables, ignoring case
 * @param {string} name
 * @returns {string}
 */
const getEnvVar = function (name) {
  var ucv = process.env[name.toUpperCase()];
  if (typeof ucv !== 'undefined') {
    return ucv
  }
  var lcv = process.env[name.toLowerCase()];
  if (typeof lcv !== 'undefined') {
    return lcv
  }
  return undefined
};

/**
 * tail-file.js: TODO: add file header description.
 *
 * (C) 2010 Charlie Robbins
 * (C) 2019 Paul Frazee
 * MIT LICENCE
 */

/**
 * Simple no-op function.
 * @returns {undefined}
 */
function noop () {}

/**
 * Read and then tail the given file.
 * The algorithm is fairly straight-forward: after hitting the end, it will attempt reads once a second.
 * (It's poll-based rather than watch-based.)
 * @param {string} file - Path to file.
 * @returns {any} - TODO: add return description.
 */
var tailFile = (file) => {
  const buffer = Buffer.alloc(64 * 1024);
  const decode = new string_decoder.StringDecoder('utf8');
  const stream = new readableStream.Stream();
  let pos = 0;

  stream.readable = true;
  stream.destroy = () => {
    stream.destroyed = true;
    stream.emit('end');
    stream.emit('close');
  };

  fs__default.open(file, 'a+', '0644', async (err, fd) => {
    if (err) {
      stream.emit('error', err);
      stream.destroy();
      return
    }

    while (true) {
      if (stream.destroyed) {
        // abort if stream destroyed
        fs__default.close(fd, noop);
        return
      }

      // read next chunk
      let bytes;
      try {
        bytes = await new Promise((resolve, reject) => {
          fs__default.read(fd, buffer, 0, buffer.length, pos, (err, bytes) => {
            if (err) reject(err);
            else resolve(bytes);
          });
        });
      } catch (err) {
        stream.emit('error', err);
        stream.destroy();
        return
      }

      if (!bytes) {
        // nothing read
        // wait a second, then try to read again
        await new Promise(resolve => setTimeout(resolve, 1e3));
        continue
      }

      // decode and emit
      let data = decode.write(buffer.slice(0, bytes));
      stream.emit('data', data);
      pos += bytes;
    }
  });

  return stream
};

const {combine, timestamp, json, simple, colorize, padLevels} = winston.format;

// typedefs
// =

/**
 * @typedef {Object} LogQueryOpts
 * @prop {number} [logFile = 0] - Which logfile to read
 * @prop {string} [sort = 'asc'] - Sort direction
 * @prop {number} [since] - Start time
 * @prop {number} [until] - End time
 * @prop {number} [offset] - Event-slice offset
 * @prop {number} [limit] - Max number of objects to output
 * @prop {any} [filter] - Attribute filters
 */

// globals
// =

var logPath;
const logger = winston.createLogger({
  level: 'silly'
});

// exported api
// =

async function setup (p) {
  logPath = p;

  // rotate logfiles from previous runs
  await retireLogFile(5);
  for (let i = 4; i >= 0; i--) {
    await rotateLogFile(i);
  }

  const shortenKeys = winston.format((info, opts) => {
    shortenObjKeys(info);
    return info;
  });

  logger.add(new winston.transports.File({
    filename: logPath,
    format: combine(shortenKeys(), timestamp(), json())
  }));

  // TODO if debug (pick an env var for this)
  logger.add(new winston.transports.Console({
    level: 'verbose',
    format: combine(shortenKeys(), colorize(), padLevels(), simple())
  }));

  logger.info('Logger started');
}

const get = () => logger;
const child = (arg) => logger.child(arg);

/**
 * Query a slice of the log.
 * @param {LogQueryOpts} [opts]
 * @returns {Promise<Object[]>}
 */
async function query (opts = {}) {
  return new Promise((resolve, reject) => {
    opts.limit = opts.limit || 100;
    var readFn = opts.sort === 'desc' ? fsReverse : fs__default.createReadStream;
    var readStream = readFn(getLogPath(opts.logFile || 0), {encoding: 'utf8'});
    const nosplit = (readFn === fsReverse); // fs-reverse splits for us
    pump(
      readPipeline(readStream, opts, nosplit),
      concat({encoding: 'object'}, res => resolve(/** @type any */(res))),
      reject
    );
  })
}

/**
 * Create a read stream of the log.
 * @param {LogQueryOpts} [opts]
 * @returns {NodeJS.ReadStream}
 */
function stream (opts = {}) {
  var readStream = tailFile(getLogPath(opts.logFile || 0));
  return readPipeline(readStream, opts)
}

const WEBAPI = {
  query,
  stream: opts => {
    opts = opts || {};
    var s2 = new stream$2.Readable({
      read () {},
      objectMode: true
    });
    var s1 = stream(opts);
    // convert to the emit-stream form
    s1.on('data', v => {
      s2.push(['data', v]);
    });
    s1.on('error', v => s2.push(['error', v]));
    s1.on('close', v => {
      s2.push(['close', v]);
      s2.destroy();
    });
    s2.on('close', () => s1.destroy());
    return s2
  },
  async listDaemonLog () {
    var file = await new Promise((resolve, reject) => {
      pump(
        fs__default.createReadStream(path.join(os__default.homedir(), '.hyperdrive/log.json'), {start: 0, end: 1e6, encoding: 'utf8'}),
        concat(resolve),
        reject
      );
    });
    return file.split('\n').map(line => {
      try { return JSON.parse(line) }
      catch (e) { return undefined }
    }).filter(Boolean)
  }
};

// internal methods
// =

function shortenObjKeys (obj) {
  for (let key in obj) {
    if (obj[key] && typeof obj[key] === 'object') {
      shortenObjKeys(obj[key]);
    }
    if (typeof obj[key] === 'string') {
      obj[key] = obj[key].replace(/[0-9a-f]{64}/ig, k => `${k.slice(0, 4)}..${k.slice(-2)}`);
    }
  }
}

function massageFilters (filter) {
  if (filter && typeof filter === 'object') {
    // make each filter an array
    for (let k in filter) {
      filter[k] = Array.isArray(filter[k]) ? filter[k] : [filter[k]];
    }
  } else {
    filter = false;
  }
  return filter
}

function getLogPath (num) {
  if (num) return logPath + '.' + num
  return logPath
}

async function rotateLogFile (num) {
  try {
    var p = getLogPath(num);
    var info = await jetpack.inspectAsync(p);
    if (info && info.type === 'file') {
      await jetpack.moveAsync(p, getLogPath(num + 1));
    }
  } catch (err) {
    console.error('rotateLogFile failed', num, err);
  }
}

async function retireLogFile (num) {
  try {
    var p = getLogPath(num);
    var info = await jetpack.inspectAsync(p);
    if (info && info.type === 'file') {
      await jetpack.removeAsync(p);
    }
  } catch (err) {
    console.error('retireLogFile failed', num, err);
  }
}

/**
 * @param {any} readStream
 * @param {LogQueryOpts} opts
 * @returns {any}
 */
function readPipeline (readStream, opts, nosplit = false) {
  var beforeOffset = 0;
  var beforeLimit = 0;
  var offset = opts.offset || 0;
  var limit = opts.limit;
  var filter = massageFilters(opts.filter);
  return pump([
    readStream,
    nosplit ? undefined : split2(),
    through2.obj(function (row, enc, cb) {
      if (!row || !row.trim()) {
        // skip empty
        return cb()
      }

      // offset filter
      if (beforeOffset < offset) {
        beforeOffset++;
        return cb()
      }

      // parse
      row = JSON.parse(row);

      // timestamp range filter
      var ts = (opts.since || opts.until) ? (new Date(row.timestamp)).getTime() : null;
      if ('since' in opts && ts < opts.since) return cb()
      if ('until' in opts && ts > opts.until) return cb()

      // general string filters
      if (filter) {
        for (let k in filter) {
          if (!filter[k].includes(row[k])) return cb()
        }
      }

      // emit
      if (!limit || beforeLimit < limit) this.push(row);
      if (limit && ++beforeLimit === limit) readStream.destroy();
      cb();
    })
  ].filter(Boolean))
}

/**
 * Helper to make node-style CBs into promises
 * @example
 * cbPromise(cb => myNodeStyleMethod(cb)).then(...)
 * @param {function(Function): any} method
 * @returns {Promise<any>}
 */
function cbPromise (method) {
  return new Promise((resolve, reject) => {
    method((err, value) => {
      if (err) reject(err);
      else resolve(value);
    });
  })
}

/**
 * Helper to run an async operation against an array in chunks
 * @example
 * var res = await chunkAsync(values, v => fetchAsync(v), 3) // chunks of 3s
 * @param {any[]} arr 
 * @param {Number} chunkSize 
 * @param {(value: any, index: number, array: any[]) => Promise<any>} cb 
 * @returns {Promise<any[]>}
 */
async function chunkMapAsync (arr, chunkSize, cb) {
  const resultChunks = [];
  for (let chunk of chunkArray(arr, chunkSize)) {
    resultChunks.push(await Promise.all(chunk.map(cb)));
  }
  return resultChunks.flat()

}

/**
 * Helper to split an array into chunks
 * @param {any[]} arr 
 * @param {Number} chunkSize 
 * @returns {Array<any[]>}
 */
function chunkArray (arr, chunkSize) {
  const result = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    result.push(arr.slice(i, i + chunkSize));
  }
  return result
}

/**
 * Async function which resolves after the given ms
 * @param {Number} ms 
 */
async function wait (ms = 1) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const logger$1 = child({category: 'sqlite'});

/**
 * Create a transaction lock
 * - returns a function which enforces FIFO execution on async behaviors, via a queue
 * - call sig: txLock(cb => { ...; cb() })
 * - MUST call given cb to release the lock
 * @returns {function(Function): void}
 */
const makeTxLock = exports.makeTxLock = function () {
  var fnQueue = FnQueue();
  return cb => fnQueue.push(cb)
};

/**
 * Configures SQLite db and runs needed migrations.
 * @param {any} db
 * @param {Object} opts
 * @param {Function} [opts.setup]
 * @param {Function[]} [opts.migrations]
 */
const setupSqliteDB = function (db, {setup, migrations}, logTag) {
  return new Promise((resolve, reject) => {
    // configure connection
    db.run('PRAGMA foreign_keys = ON;', (err) => {
      if (err) {
        console.error('Failed to enable FK support in SQLite', err);
      }
    });

    // run migrations
    db.get('PRAGMA user_version;', (err, res) => {
      if (err) return reject(err)

      var version = (res && res.user_version) ? +res.user_version : 0;
      var neededMigrations = (version === 0 && setup) ? [setup] : migrations.slice(version);
      if (neededMigrations.length == 0) { return resolve() }

      logger$1.info(`${logTag} Database at version ${version}; Running ${neededMigrations.length} migrations`);
      db.run('PRAGMA SYNCHRONOUS = OFF;'); // turn off fsync to speed up migrations
      runNeededMigrations();
      function runNeededMigrations (err) {
        if (err) {
          logger$1.error(`${logTag} Failed migration`);
          console.log(err);
          db.run('PRAGMA SYNCHRONOUS = FULL;'); // turn fsync back on
          return reject(err)
        }

        var migration = neededMigrations.shift();
        if (!migration) {
          // done
          db.run('PRAGMA SYNCHRONOUS = FULL;'); // turn fsync back on
          resolve();
          return logger$1.info(`${logTag} Database migrations completed without error`)
        }

        migration(runNeededMigrations);
      }
    });
  })
};

const handleQueryBuilder = function (args) {
  // detect query builders and replace the args
  if (args[0] && _get(args[0], 'constructor.name') === 'Builder') {
    var query = args[0].toSQL();
    return [query.sql, query.bindings]
  }
  return args
};

const CACHED_VALUES = ['new_tabs_in_foreground'];
const JSON_ENCODED_SETTINGS = ['search_engines', 'adblock_lists'];

// globals
// =

var db;
var migrations;
var setupPromise;
var defaultSettings;
var events = new EventEmitter__default();
var cachedValues = {};


// exported methods
// =

/**
 * @param {Object} opts
 * @param {string} opts.userDataPath
 * @param {string} opts.homePath
 */
const setup$1 = async function (opts) {
  // open database
  var dbPath = path__default.join(opts.userDataPath, 'Settings');
  db = new sqlite3.Database(dbPath);
  setupPromise = setupSqliteDB(db, {migrations}, '[SETTINGS]');

  defaultSettings = {
    auto_update_enabled: 1,
    auto_redirect_to_dat: 1,
    custom_start_page: 'blank',
    new_tab: 'wallets://desktop/',
    new_tabs_in_foreground: 0,
    run_background: 1,
    default_zoom: 0,
    browser_theme: 'system',
    analytics_enabled: 1,
    extended_network_index: 'default',
    extended_network_index_url: '',
    search_engines: [
      {name: 'DuckDuckGo', url: 'https://www.duckduckgo.com/', selected: true},
      {name: 'Wallets', url: 'wallets://desktop/'},
      {name: 'Google', url: 'https://www.google.com/search'}
    ],
    adblock_lists: [
      {name: 'EasyList', url: 'https://easylist.to/easylist/easylist.txt', selected: true},
      {name: 'EasyPrivacy', url: 'https://easylist.to/easylist/easyprivacy.txt'},
      {name: 'EasyList Cookie List', url: 'https://easylist-downloads.adblockplus.org/easylist-cookie.txt'},
      {name: 'Fanboy\'s Social Blocking List', url: 'https://easylist.to/easylist/fanboy-social.txt'},
      {name: 'Fanboy\'s Annoyance List', url: 'https://easylist.to/easylist/fanboy-annoyance.txt'},
      {name: 'Adblock Warning Removal List', url: 'https://easylist-downloads.adblockplus.org/antiadblockfilters.txt'},
    ]
  };

  for (let k of CACHED_VALUES) {
    cachedValues[k] = await get$1(k);
  }
};

const on = events.on.bind(events);
const once = events.once.bind(events);

/**
 * @param {string} key
 * @param {string | number | object} value
 * @returns {Promise<void>}
 */
async function set (key, value) {
  if (JSON_ENCODED_SETTINGS.includes(key)) {
    value = JSON.stringify(value);
  }
  await setupPromise.then(() => cbPromise(cb => {
    db.run(`
      INSERT OR REPLACE
        INTO settings (key, value, ts)
        VALUES (?, ?, ?)
    `, [key, value, Date.now()], cb);
  }));
  if (CACHED_VALUES.includes(key)) cachedValues[key] = value;
  events.emit('set', key, value);
  events.emit('set:' + key, value);
}

/**
 * @param {string} key
 * @returns {string | number}
 */
function getCached (key) {
  return cachedValues[key]
}

/**
 * @param {string} key
 * @returns {boolean | Promise<string | number | object>}
 */
const get$1 = function (key) {
  // env variables
  if (key === 'no_welcome_tab') {
    return (Number(getEnvVar('WALLETS_NO_WELCOME_TAB')) === 1)
  }
  // stored values
  return setupPromise.then(() => cbPromise(cb => {
    db.get(`SELECT value FROM settings WHERE key = ?`, [key], (err, row) => {
      if (row) {
        row = row.value;
        if (JSON_ENCODED_SETTINGS.includes(key)) {
          try {
            row = JSON.parse(row);
          } catch (e) {
            row = defaultSettings[key];
          }
        }
      }
      if (typeof row === 'undefined') { row = defaultSettings[key]; }
      cb(err, row);
    });
  }))
};

/**
 * @returns {Promise<Object>}
 */
const getAll = function () {
  return setupPromise.then(v => cbPromise(cb => {
    db.all(`SELECT key, value FROM settings`, (err, rows) => {
      if (err) { return cb(err) }
      var obj = {};
      rows.forEach(row => {
        // parse non-string values
        if (JSON_ENCODED_SETTINGS.includes(row.key)) {
          try {
            row.value = JSON.parse(row.value);
          } catch (e) {
            row.value = defaultSettings[key.value];
          }
        }
        obj[row.key] = row.value;
      });

      obj = Object.assign({}, defaultSettings, obj);
      obj.no_welcome_tab = (Number(getEnvVar('WALLETS_NO_WELCOME_TAB')) === 1);
      cb(null, obj);
    });
  }))
};

// internal methods
// =

migrations = [
  // version 1
  function (cb) {
    db.exec(`
      CREATE TABLE settings(
        key PRIMARY KEY,
        value,
        ts
      );
      INSERT INTO settings (key, value) VALUES ('auto_update_enabled', 1);
      PRAGMA user_version = 1;
    `, cb);
  },
  // version 2
  function (cb) {
    db.exec(`
      INSERT INTO settings (key, value) VALUES ('start_page_background_image', '');
      PRAGMA user_version = 2
    `, cb);
  }
];

var settings = /*#__PURE__*/Object.freeze({
  __proto__: null,
  setup: setup$1,
  on: on,
  once: once,
  set: set,
  getCached: getCached,
  get: get$1,
  getAll: getAll
});

const beakerUrls = /^(beaker|blob)/;

// globals
// =

var blocker;

// exported API
// =

async function setup$2 () {
  const adblockLists = await get$1('adblock_lists');
  const activeLists = adblockLists.filter(list => list.selected);

  blocker = undefined;
  if (activeLists.length >= 1) {
    blocker = await adblocker.FiltersEngine.fromLists(fetch, activeLists.map(list => list.url));
  }
}

function onBeforeRequest (details, callback) {
  if (!blocker) {
    return callback({cancel: false})
  }

  // Matching network filters
  const {
    match, // `true` if there is a match
    redirect, // data url to redirect to if any
    // exception, // instance of NetworkFilter exception if any
    // filter, // instance of NetworkFilter which matched
  } = blocker.match(adblocker.Request.fromRawDetails({ url: details.url }));
  const shouldBeBlocked = !details.url.match(beakerUrls) && match;
  callback({cancel: shouldBeBlocked, redirectURL: redirect});
}

/* globals window */

const URL$1 = typeof window === 'undefined' ? require('url').URL : window.URL;
const DRIVE_KEY_REGEX = /[0-9a-f]{64}/i;

function joinPath (...args) {
  var str = args[0];
  for (let v of args.slice(1)) {
    v = v && typeof v === 'string' ? v : '';
    let left = str.endsWith('/');
    let right = v.startsWith('/');
    if (left !== right) str += v;
    else if (left) str += v.slice(1);
    else str += '/' + v;
  }
  return str
}

function toNiceUrl (str) {
  if (!str) return ''
  try {
    var urlParsed = new URL$1(str);
    if (DRIVE_KEY_REGEX.test(urlParsed.hostname)) {
      urlParsed.hostname = `${urlParsed.hostname.slice(0, 6)}..${urlParsed.hostname.slice(-2)}`;
    }
    return urlParsed.toString()
  } catch (e) {
    // ignore, not a url
  }
  return str
}

const reservedChars = /[^A-Za-z0-9]/g;
const continuousDashes = /(-[-]+)/g;
const endingDashes = /([-]+$)/g;
function slugify (str = '') {
  return str.replace(reservedChars, '-').replace(continuousDashes, '-').replace(endingDashes, '')
}

function globToRegex (str = '') {
  if (!str.startsWith('/')) {
    str = `**/${str}`;
  }
  str = str.replace(/(\*\*?)/g, match => {
    if (match === '**') return '.*'
    return '[^/]*'
  });
  return new RegExp(`^${str}(/.*)?$`)
}

const isNode = typeof window === 'undefined';
const parse = isNode ? require('url').parse : browserParse;

const isHyperHashRegex = /^[a-z0-9]{64}/i;
const isIPAddressRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
const isPath = /^\//;

// helper to determine what the user may be inputting into the locaiton bar
function examineLocationInput (v) {
  // does the value look like a url?
  var isProbablyUrl = (!v.includes(' ') && (
    isPath.test(v) ||
    /\.[A-z]/.test(v) ||
    isIPAddressRegex.test(v) ||
    isHyperHashRegex.test(v) ||
    v.startsWith('localhost') ||
    v.includes('://') ||
    v.startsWith('wallets:') ||
    v.startsWith('data:') ||
    v.startsWith('intent:') ||
    v.startsWith('about:')
  ));
  var vWithProtocol = v;
  var isGuessingTheScheme = false;
  if (isProbablyUrl && !isPath.test(v) && !v.includes('://') && !(v.startsWith('wallets:') || v.startsWith('data:') || v.startsWith('intent:') || v.startsWith('about:'))) {
    if (isHyperHashRegex.test(v)) {
      vWithProtocol = 'hyper://' + v;
    } else if (v.startsWith('localhost') || isIPAddressRegex.test(v)) {
      vWithProtocol = 'http://' + v;
    } else {
      vWithProtocol = 'https://' + v;
      isGuessingTheScheme = true; // note that we're guessing so that, if this fails, we can try http://
    }
  }
  var vSearch = '?q=' + v.split(' ').map(encodeURIComponent).join('+');
  return {vWithProtocol, vSearch, isProbablyUrl, isGuessingTheScheme}
}

const SCHEME_REGEX = /[a-z]+:\/\//i;
//                   1          2      3        4
const VERSION_REGEX = /^(hyper:\/\/)?([^/]+)(\+[^/]+)(.*)$/i;
function parseDriveUrl (str, parseQS) {
  // prepend the scheme if it's missing
  if (!SCHEME_REGEX.test(str)) {
    str = 'hyper://' + str;
  }

  var parsed, version = null, match = VERSION_REGEX.exec(str);
  if (match) {
    // run typical parse with version segment removed
    parsed = parse((match[1] || '') + (match[2] || '') + (match[4] || ''), parseQS);
    version = match[3].slice(1);
  } else {
    parsed = parse(str, parseQS);
  }
  if (isNode) parsed.href = str; // overwrite href to include actual original
  else parsed.path = parsed.pathname; // to match node
  if (!parsed.query && parsed.searchParams) {
    parsed.query = Object.fromEntries(parsed.searchParams); // to match node
  }
  parsed.version = version; // add version segment
  if (!parsed.origin) parsed.origin = `hyper://${parsed.hostname}/`;
  return parsed
}

function browserParse (str) {
  return new URL(str)
}

function createResourceSlug (href, title) {
  var slug;
  try {
    var hrefp = new URL(href);
    if (hrefp.pathname === '/' && !hrefp.search && !hrefp.hash) {
      // at the root path - use the hostname for the filename
      slug = slugify(hrefp.hostname);
    } else if (typeof title === 'string' && !!title.trim()) {
      // use the title if available on subpages
      slug = slugify(title.trim());
    } else {
      // use parts of the url
      slug = slugify(hrefp.hostname + hrefp.pathname + hrefp.search + hrefp.hash);
    }
  } catch (e) {
    // weird URL, just use slugified version of it
    slug = slugify(href);
  }
  return slug.toLowerCase()
}

/**
 * @param {String} str 
 * @returns {String}
 */
function normalizeOrigin (str) {
  try {
    let {protocol, hostname, port} = new URL(str);
    return `${protocol}//${hostname}${(port ? `:${port}` : '')}`
  } catch {
    // assume hyper, if this fails then bomb out
    let {protocol, hostname, port} = new URL(`hyper://${str}`);
    return `${protocol}//${hostname}${(port ? `:${port}` : '')}`
  }
}

/**
 * @param {String} a 
 * @param {String} b 
 * @returns {Boolean}
 */
function isSameOrigin (a, b) {
	return normalizeOrigin(a) === normalizeOrigin(b)
}

/**
 * @param {String} url
 * @param {String} [base]
 * @returns {String}
 */
function normalizeUrl (url, base = undefined) {
  try {
    let {protocol, hostname, port, pathname, search, hash} = new URL(url, base);
    return `${protocol}//${hostname}${(port ? `:${port}` : '')}${pathname || '/'}${search}${hash}`
  } catch {
    return url
  }
}

/**
 * @param {String} url 
 * @returns {Boolean}
 */
function isHyperUrl (url) {
  if (url.length === 64 && isHyperHashRegex.test(url)) return true
  if (url.startsWith('hyper://')) return true
  return false
}

var V1 = `
CREATE TABLE profiles (
  id INTEGER PRIMARY KEY NOT NULL,
  url TEXT,
  createdAt INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE archives (
  profileId INTEGER NOT NULL,
  key TEXT NOT NULL,
  localPath TEXT, -- deprecated
  isSaved INTEGER,
  createdAt INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE archives_meta (
  key TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  forkOf TEXT,
  createdByUrl TEXT, -- deprecated
  createdByTitle TEXT, -- deprecated
  mtime INTEGER,
  metaSize INTEGER, -- deprecated
  stagingSize INTEGER, -- deprecated
  isOwner INTEGER
);

CREATE TABLE bookmarks (
  profileId INTEGER,
  url TEXT NOT NULL,
  title TEXT,
  pinned INTEGER,
  createdAt INTEGER DEFAULT (strftime('%s', 'now')),

  PRIMARY KEY (profileId, url),
  FOREIGN KEY (profileId) REFERENCES profiles (id) ON DELETE CASCADE
);

CREATE TABLE visits (
  profileId INTEGER,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  ts INTEGER NOT NULL,

  FOREIGN KEY (profileId) REFERENCES profiles (id) ON DELETE CASCADE
);

CREATE TABLE visit_stats (
  url TEXT NOT NULL,
  num_visits INTEGER,
  last_visit_ts INTEGER
);

CREATE VIRTUAL TABLE visit_fts USING fts4 (url, title);
CREATE UNIQUE INDEX visits_stats_url ON visit_stats (url);

-- default profile
INSERT INTO profiles (id) VALUES (0);

PRAGMA user_version = 1;
`;

var V2 = `

-- add variable to track the staging size less ignored files
-- deprecated
ALTER TABLE archives_meta ADD COLUMN stagingSizeLessIgnored INTEGER;

PRAGMA user_version = 2;
`;

var V3 = `

-- add variable to track the access times of archives
ALTER TABLE archives_meta ADD COLUMN lastAccessTime INTEGER DEFAULT 0;

PRAGMA user_version = 3;
`;

var V4 = `

-- add flags to control swarming behaviors of archives
ALTER TABLE archives ADD COLUMN autoDownload INTEGER DEFAULT 1;
ALTER TABLE archives ADD COLUMN autoUpload INTEGER DEFAULT 1;

PRAGMA user_version = 4;
`;

var V5 = `

-- more default bookmarks
-- REMOVED

PRAGMA user_version = 5;
`;

var V6 = `

-- add more flags to control swarming behaviors of archives
ALTER TABLE archives ADD COLUMN networked INTEGER DEFAULT 1;

PRAGMA user_version = 6;
`;

var V7 = `

-- add a field to track rehost expiration (for timed rehosting)
ALTER TABLE archives ADD COLUMN expiresAt INTEGER;

PRAGMA user_version = 7;
`;

var V8 = `

-- add tags and notes to bookmarks
ALTER TABLE bookmarks ADD COLUMN tags TEXT;
ALTER TABLE bookmarks ADD COLUMN notes TEXT;

PRAGMA user_version = 8;
`;

var V9 = `

-- join table to list the archive's type fields
CREATE TABLE archives_meta_type (
  key TEXT,
  type TEXT
);

PRAGMA user_version = 9;
`;

var V10 = `
-- list of the user's installed apps
-- deprecated
CREATE TABLE apps (
  profileId INTEGER NOT NULL,
  name TEXT NOT NULL,
  url TEXT,
  updatedAt INTEGER DEFAULT (strftime('%s', 'now')),
  createdAt INTEGER DEFAULT (strftime('%s', 'now')),
 
  PRIMARY KEY (profileId, name),
  FOREIGN KEY (profileId) REFERENCES profiles (id) ON DELETE CASCADE
);

PRAGMA user_version = 10;
`;

var V11 = `
-- log of the user's app installations
-- deprecated
CREATE TABLE apps_log (
  profileId INTEGER NOT NULL,
  name TEXT NOT NULL,
  url TEXT,
  ts INTEGER DEFAULT (strftime('%s', 'now')),
 
  FOREIGN KEY (profileId) REFERENCES profiles (id) ON DELETE CASCADE
);

PRAGMA user_version = 11;
`;

var V12 = `

-- list of the active workspaces
-- deprecated
CREATE TABLE workspaces (
  profileId INTEGER NOT NULL,
  name TEXT NOT NULL,
  localFilesPath TEXT,
  publishTargetUrl TEXT,
  createdAt INTEGER DEFAULT (strftime('%s', 'now')),
  updatedAt INTEGER DEFAULT (strftime('%s', 'now')),

  PRIMARY KEY (profileId, name),
  FOREIGN KEY (profileId) REFERENCES profiles (id) ON DELETE CASCADE
);

PRAGMA user_version = 12;
`;

var V13 = `

-- add a field to track when last accessed in the library
ALTER TABLE archives_meta ADD COLUMN lastLibraryAccessTime INTEGER DEFAULT 0;

PRAGMA user_version = 13;
`;

var V14 = `

-- add a non-unique index to the visits table to speed up joins
CREATE INDEX visits_url ON visits (url);

PRAGMA user_version = 14;
`;

var V15 = `

-- more default bookmarks
-- REMOVED

PRAGMA user_version = 15;
`;

var V16 = `

-- add a field to track when last accessed in the library
ALTER TABLE bookmarks ADD COLUMN pinOrder INTEGER DEFAULT 0;

PRAGMA user_version = 16;
`;

var V17 = `

-- add a field to track the folder where an archive is being synced
ALTER TABLE archives ADD COLUMN localSyncPath TEXT;

PRAGMA user_version = 17;
`;

var V18 = `

-- add a database to track user-defined templates for new dat sites
CREATE TABLE templates (
  profileId INTEGER,
  url TEXT NOT NULL,
  title TEXT,
  screenshot,
  createdAt INTEGER DEFAULT (strftime('%s', 'now')),

  PRIMARY KEY (profileId, url),
  FOREIGN KEY (profileId) REFERENCES profiles (id) ON DELETE CASCADE
);

PRAGMA user_version = 18;
`;

var V19 = `

-- add the 'hidden' flag to archives
ALTER TABLE archives ADD COLUMN hidden INTEGER DEFAULT 0;

-- add a database for tracking draft dats
CREATE TABLE archive_drafts (
  profileId INTEGER,
  masterKey TEXT, -- key of the master dat
  draftKey TEXT, -- key of the draft dat
  createdAt INTEGER DEFAULT (strftime('%s', 'now')),
  
  isActive INTEGER, -- is this the active draft? (deprecated)

  FOREIGN KEY (profileId) REFERENCES profiles (id) ON DELETE CASCADE
);

PRAGMA user_version = 19;
`;

var V20 = `

-- watch localSyncPath and automatically publish changes (1) or not (0)
ALTER TABLE archives ADD COLUMN autoPublishLocal INTEGER DEFAULT 0;

PRAGMA user_version = 20;
`;

var V21 = `

-- add size data to archives_meta
ALTER TABLE archives_meta ADD COLUMN size INTEGER DEFAULT 0;

PRAGMA user_version = 21;
`;

var V22 = `

-- automatically publish changes (0) or write to local folder (1)
ALTER TABLE archives ADD COLUMN previewMode INTEGER;

PRAGMA user_version = 22;
`;

var V23 = `

-- add a database for watchlist feature
CREATE TABLE watchlist (
  profileId INTEGER NOT NULL,
  url TEXT NOT NULL,
  description TEXT NOT NULL,
  seedWhenResolved BOOLEAN NOT NULL,
  resolved BOOLEAN NOT NULL DEFAULT (0),
  updatedAt INTEGER DEFAULT (strftime('%s', 'now')),
  createdAt INTEGER DEFAULT (strftime('%s', 'now')),
 
  PRIMARY KEY (profileId, url),
  FOREIGN KEY (profileId) REFERENCES profiles (id) ON DELETE CASCADE
);

PRAGMA user_version = 23;
`;

var V24 = `
-- description of the bookmark's content, often pulled from the bookmarked page
ALTER TABLE bookmarks ADD COLUMN description TEXT;

-- sync the bookmark to the user's public profile
ALTER TABLE bookmarks ADD COLUMN isPublic INTEGER;

CREATE TABLE users (
  id INTEGER PRIMARY KEY NOT NULL,
  url TEXT,
  isDefault INTEGER DEFAULT 0,
  createdAt INTEGER
);

-- list of sites being crawled
CREATE TABLE crawl_sources (
  id INTEGER PRIMARY KEY NOT NULL,
  url TEXT NOT NULL
);

-- tracking information on the crawl-state of the sources
CREATE TABLE crawl_sources_meta (
  crawlSourceId INTEGER NOT NULL,
  crawlSourceVersion INTEGER NOT NULL,
  crawlDataset TEXT NOT NULL,
  crawlDatasetVersion INTEGER NOT NULL,
  updatedAt INTEGER,

  FOREIGN KEY (crawlSourceId) REFERENCES crawl_sources (id) ON DELETE CASCADE
);

-- crawled descriptions of other sites
CREATE TABLE crawl_site_descriptions (
  crawlSourceId INTEGER NOT NULL,
  crawledAt INTEGER,

  url TEXT,
  title TEXT,
  description TEXT,
  type TEXT, -- comma separated strings

  FOREIGN KEY (crawlSourceId) REFERENCES crawl_sources (id) ON DELETE CASCADE
);
CREATE VIRTUAL TABLE crawl_site_descriptions_fts_index USING fts5(title, description, content='crawl_site_descriptions');

-- triggers to keep crawl_site_descriptions_fts_index updated
CREATE TRIGGER crawl_site_descriptions_ai AFTER INSERT ON crawl_site_descriptions BEGIN
  INSERT INTO crawl_site_descriptions_fts_index(rowid, title, description) VALUES (new.rowid, new.title, new.description);
END;
CREATE TRIGGER crawl_site_descriptions_ad AFTER DELETE ON crawl_site_descriptions BEGIN
  INSERT INTO crawl_site_descriptions_fts_index(crawl_site_descriptions_fts_index, rowid, title, description) VALUES('delete', old.rowid, old.title, old.description);
END;
CREATE TRIGGER crawl_site_descriptions_au AFTER UPDATE ON crawl_site_descriptions BEGIN
  INSERT INTO crawl_site_descriptions_fts_index(crawl_site_descriptions_fts_index, rowid, title, description) VALUES('delete', old.a, old.title, old.description);
  INSERT INTO crawl_site_descriptions_fts_index(rowid, title, description) VALUES (new.rowid, new.title, new.description);
END;

-- crawled posts
CREATE TABLE crawl_posts (
  crawlSourceId INTEGER NOT NULL,
  pathname TEXT NOT NULL,
  crawledAt INTEGER,

  body TEXT,
  createdAt INTEGER,
  updatedAt INTEGER,

  FOREIGN KEY (crawlSourceId) REFERENCES crawl_sources (id) ON DELETE CASCADE
);
CREATE VIRTUAL TABLE crawl_posts_fts_index USING fts5(body, content='crawl_posts');

-- triggers to keep crawl_posts_fts_index updated
CREATE TRIGGER crawl_posts_ai AFTER INSERT ON crawl_posts BEGIN
  INSERT INTO crawl_posts_fts_index(rowid, body) VALUES (new.rowid, new.body);
END;
CREATE TRIGGER crawl_posts_ad AFTER DELETE ON crawl_posts BEGIN
  INSERT INTO crawl_posts_fts_index(crawl_posts_fts_index, rowid, body) VALUES('delete', old.rowid, old.body);
END;
CREATE TRIGGER crawl_posts_au AFTER UPDATE ON crawl_posts BEGIN
  INSERT INTO crawl_posts_fts_index(crawl_posts_fts_index, rowid, body) VALUES('delete', old.rowid, old.body);
  INSERT INTO crawl_posts_fts_index(rowid, body) VALUES (new.rowid, new.body);
END;

-- crawled bookmarks
CREATE TABLE crawl_bookmarks (
  crawlSourceId INTEGER NOT NULL,
  pathname TEXT NOT NULL,
  crawledAt INTEGER,

  href TEXT,
  title TEXT,
  description TEXT,
  tags TEXT,
  createdAt INTEGER,
  updatedAt INTEGER,

  FOREIGN KEY (crawlSourceId) REFERENCES crawl_sources (id) ON DELETE CASCADE
);
CREATE VIRTUAL TABLE crawl_bookmarks_fts_index USING fts5(title, description, tags, content='crawl_bookmarks');

-- triggers to keep crawl_bookmarks_fts_index updated
CREATE TRIGGER crawl_bookmarks_ai AFTER INSERT ON crawl_bookmarks BEGIN
  INSERT INTO crawl_bookmarks_fts_index(rowid, title, description, tags) VALUES (new.rowid, new.title, new.description, new.tags);
END;
CREATE TRIGGER crawl_bookmarks_ad AFTER DELETE ON crawl_bookmarks BEGIN
  INSERT INTO crawl_bookmarks_fts_index(crawl_bookmarks_fts_index, rowid, title, description, tags) VALUES('delete', old.rowid, old.title, old.description, old.tags);
END;
CREATE TRIGGER crawl_bookmarks_au AFTER UPDATE ON crawl_bookmarks BEGIN
  INSERT INTO crawl_bookmarks_fts_index(crawl_bookmarks_fts_index, rowid, title, description, tags) VALUES('delete', old.rowid, old.title, old.description, old.tags);
  INSERT INTO crawl_bookmarks_fts_index(rowid, title, description, tags) VALUES (new.rowid, new.title, new.description, new.tags);
END;

-- crawled follows
CREATE TABLE crawl_graph (
  crawlSourceId INTEGER NOT NULL,
  crawledAt INTEGER,
  
  destUrl TEXT NOT NULL,

  PRIMARY KEY (crawlSourceId, destUrl),
  FOREIGN KEY (crawlSourceId) REFERENCES crawl_sources (id) ON DELETE CASCADE
);

PRAGMA user_version = 24;
`;

var V25 = `

-- crawled reactions
CREATE TABLE crawl_reactions (
  crawlSourceId INTEGER NOT NULL,
  pathname TEXT NOT NULL,
  crawledAt INTEGER,
  
  topic TEXT NOT NULL,
  emojis TEXT NOT NULL,

  PRIMARY KEY (crawlSourceId, pathname),
  FOREIGN KEY (crawlSourceId) REFERENCES crawl_sources (id) ON DELETE CASCADE
);
CREATE INDEX crawl_reactions_topic ON crawl_reactions (topic);

PRAGMA user_version = 25;
`;

var V26 = `

-- fix an incorrect trigger definition
DROP TRIGGER IF EXISTS crawl_site_descriptions_au;
CREATE TRIGGER crawl_site_descriptions_au AFTER UPDATE ON crawl_site_descriptions BEGIN
  INSERT INTO crawl_site_descriptions_fts_index(crawl_site_descriptions_fts_index, rowid, title, description) VALUES('delete', old.rowid, old.title, old.description);
  INSERT INTO crawl_site_descriptions_fts_index(rowid, title, description) VALUES (new.rowid, new.title, new.description);
END;

-- rename 'graph' to 'follows'
ALTER TABLE crawl_graph RENAME TO crawl_follows;

PRAGMA user_version = 26;
`;

var V27 = `

-- add crawled comments
CREATE TABLE crawl_comments (
  crawlSourceId INTEGER NOT NULL,
  pathname TEXT NOT NULL,
  crawledAt INTEGER,

  topic TEXT,
  replyTo TEXT,
  body TEXT,
  createdAt INTEGER,
  updatedAt INTEGER,

  FOREIGN KEY (crawlSourceId) REFERENCES crawl_sources (id) ON DELETE CASCADE
);
CREATE INDEX crawl_comments_topic ON crawl_comments (topic);
CREATE VIRTUAL TABLE crawl_comments_fts_index USING fts5(body, content='crawl_comments');

-- triggers to keep crawl_comments_fts_index updated
CREATE TRIGGER crawl_comments_ai AFTER INSERT ON crawl_comments BEGIN
  INSERT INTO crawl_comments_fts_index(rowid, body) VALUES (new.rowid, new.body);
END;
CREATE TRIGGER crawl_comments_ad AFTER DELETE ON crawl_comments BEGIN
  INSERT INTO crawl_comments_fts_index(crawl_comments_fts_index, rowid, body) VALUES('delete', old.rowid, old.body);
END;
CREATE TRIGGER crawl_comments_au AFTER UPDATE ON crawl_comments BEGIN
  INSERT INTO crawl_comments_fts_index(crawl_comments_fts_index, rowid, body) VALUES('delete', old.rowid, old.body);
  INSERT INTO crawl_comments_fts_index(rowid, body) VALUES (new.rowid, new.body);
END;

PRAGMA user_version = 27;
`;

var V28 = `

-- we're replacing the bookmark 'tags' field with a new normalized tags table
-- this requires replacing the entire bookmarks table because we need to add an id pkey


-- remove the old bookmarks tabes
DROP TRIGGER IF EXISTS crawl_bookmarks_ai;
DROP TRIGGER IF EXISTS crawl_bookmarks_ad;
DROP TRIGGER IF EXISTS crawl_bookmarks_au;
DROP TABLE IF EXISTS crawl_bookmarks_fts_index;
DROP TABLE IF EXISTS crawl_bookmarks;


-- add crawled tags
CREATE TABLE crawl_tags (
  id INTEGER PRIMARY KEY,
  tag TEXT UNIQUE
);

-- add crawled bookmarks
CREATE TABLE crawl_bookmarks (
  id INTEGER PRIMARY KEY,
  crawlSourceId INTEGER NOT NULL,
  pathname TEXT NOT NULL,
  crawledAt INTEGER,

  href TEXT,
  title TEXT,
  description TEXT,
  createdAt INTEGER,
  updatedAt INTEGER,

  FOREIGN KEY (crawlSourceId) REFERENCES crawl_sources (id) ON DELETE CASCADE
);
CREATE VIRTUAL TABLE crawl_bookmarks_fts_index USING fts5(title, description, content='crawl_bookmarks');

-- triggers to keep crawl_bookmarks_fts_index updated
CREATE TRIGGER crawl_bookmarks_ai AFTER INSERT ON crawl_bookmarks BEGIN
  INSERT INTO crawl_bookmarks_fts_index(rowid, title, description) VALUES (new.rowid, new.title, new.description);
END;
CREATE TRIGGER crawl_bookmarks_ad AFTER DELETE ON crawl_bookmarks BEGIN
  INSERT INTO crawl_bookmarks_fts_index(crawl_bookmarks_fts_index, rowid, title, description) VALUES('delete', old.rowid, old.title, old.description);
END;
CREATE TRIGGER crawl_bookmarks_au AFTER UPDATE ON crawl_bookmarks BEGIN
  INSERT INTO crawl_bookmarks_fts_index(crawl_bookmarks_fts_index, rowid, title, description) VALUES('delete', old.rowid, old.title, old.description);
  INSERT INTO crawl_bookmarks_fts_index(rowid, title, description) VALUES (new.rowid, new.title, new.description);
END;

-- add bookmark <-> tag join table
CREATE TABLE crawl_bookmarks_tags (
  crawlBookmarkId INTEGER,
  crawlTagId INTEGER,

  FOREIGN KEY (crawlBookmarkId) REFERENCES crawl_bookmarks (id) ON DELETE CASCADE,
  FOREIGN KEY (crawlTagId) REFERENCES crawl_tags (id) ON DELETE CASCADE
);

PRAGMA user_version = 28;
`;

var V29 = `

-- add crawled votes
CREATE TABLE crawl_votes (
  crawlSourceId INTEGER NOT NULL,
  pathname TEXT NOT NULL,
  crawledAt INTEGER,
  
  topic TEXT NOT NULL,
  vote INTEGER NOT NULL,
  createdAt INTEGER,
  updatedAt INTEGER,

  PRIMARY KEY (crawlSourceId, pathname),
  FOREIGN KEY (crawlSourceId) REFERENCES crawl_sources (id) ON DELETE CASCADE
);
CREATE INDEX crawl_votes_topic ON crawl_votes (topic);

PRAGMA user_version = 29;
`;

var V30 = `

-- add crawled discussions
CREATE TABLE crawl_discussions (
  id INTEGER PRIMARY KEY,
  crawlSourceId INTEGER NOT NULL,
  pathname TEXT NOT NULL,
  crawledAt INTEGER,
  
  title TEXT NOT NULL,
  body TEXT,
  href TEXT,
  createdAt INTEGER,
  updatedAt INTEGER,

  FOREIGN KEY (crawlSourceId) REFERENCES crawl_sources (id) ON DELETE CASCADE
);
CREATE INDEX crawl_discussions_url ON crawl_discussions (crawlSourceId, pathname);

-- add discussion <-> tag join table
CREATE TABLE crawl_discussions_tags (
  crawlDiscussionId INTEGER,
  crawlTagId INTEGER,

  FOREIGN KEY (crawlDiscussionId) REFERENCES crawl_discussions (id) ON DELETE CASCADE,
  FOREIGN KEY (crawlTagId) REFERENCES crawl_tags (id) ON DELETE CASCADE
);

PRAGMA user_version = 30;
`;

var V31 = `

-- add crawled media
CREATE TABLE crawl_media (
  id INTEGER PRIMARY KEY,
  crawlSourceId INTEGER NOT NULL,
  pathname TEXT NOT NULL,
  crawledAt INTEGER,
  
  subtype TEXT NOT NULL,
  href TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  createdAt INTEGER,
  updatedAt INTEGER,

  FOREIGN KEY (crawlSourceId) REFERENCES crawl_sources (id) ON DELETE CASCADE
);
CREATE INDEX crawl_media_url ON crawl_media (crawlSourceId, pathname);
CREATE INDEX crawl_media_subtype ON crawl_media (subtype);
CREATE INDEX crawl_media_href ON crawl_media (href);
CREATE VIRTUAL TABLE crawl_media_fts_index USING fts5(title, description, content='crawl_media');

-- triggers to keep crawl_media_fts_index updated
CREATE TRIGGER crawl_media_ai AFTER INSERT ON crawl_media BEGIN
  INSERT INTO crawl_media_fts_index(rowid, title, description) VALUES (new.rowid, new.title, new.description);
END;
CREATE TRIGGER crawl_media_ad AFTER DELETE ON crawl_media BEGIN
  INSERT INTO crawl_media_fts_index(crawl_media_fts_index, rowid, title, description) VALUES('delete', old.rowid, old.title, old.description);
END;
CREATE TRIGGER crawl_media_au AFTER UPDATE ON crawl_media BEGIN
  INSERT INTO crawl_media_fts_index(crawl_media_fts_index, rowid, title, description) VALUES('delete', old.rowid, old.title, old.description);
  INSERT INTO crawl_media_fts_index(rowid, title, description) VALUES (new.rowid, new.title, new.description);
END;

-- add crawled media tags
CREATE TABLE crawl_media_tags (
  crawlMediaId INTEGER,
  crawlTagId INTEGER,

  FOREIGN KEY (crawlMediaId) REFERENCES crawl_media (id) ON DELETE CASCADE,
  FOREIGN KEY (crawlTagId) REFERENCES crawl_tags (id) ON DELETE CASCADE
);

PRAGMA user_version = 31;
`;

var V32 = `

CREATE VIRTUAL TABLE crawl_discussions_fts_index USING fts5(title, body, content='crawl_discussions');

-- triggers to keep crawl_discussions_fts_index updated
CREATE TRIGGER crawl_discussions_ai AFTER INSERT ON crawl_discussions BEGIN
  INSERT INTO crawl_discussions_fts_index(rowid, title, body) VALUES (new.rowid, new.title, new.body);
END;
CREATE TRIGGER crawl_discussions_ad AFTER DELETE ON crawl_discussions BEGIN
  INSERT INTO crawl_discussions_fts_index(crawl_discussions_fts_index, rowid, title, body) VALUES('delete', old.rowid, old.title, old.body);
END;
CREATE TRIGGER crawl_discussions_au AFTER UPDATE ON crawl_discussions BEGIN
  INSERT INTO crawl_discussions_fts_index(crawl_discussions_fts_index, rowid, title, body) VALUES('delete', old.rowid, old.title, old.body);
  INSERT INTO crawl_discussions_fts_index(rowid, title, body) VALUES (new.rowid, new.title, new.body);
END;

PRAGMA user_version = 32;

`;

var V33 = `

-- add label
ALTER TABLE users ADD COLUMN label TEXT;
-- add isTemporary
ALTER TABLE users ADD COLUMN isTemporary INTEGER DEFAULT 0;

PRAGMA user_version = 33;
`;

var V34 = `

-- list of the users installed apps
CREATE TABLE installed_applications (
  id INTEGER PRIMARY KEY NOT NULL,
  userId INTEGER NOT NULL,
  enabled INTEGER DEFAULT 1,
  url TEXT,
  createdAt INTEGER,
 
  FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
);

PRAGMA user_version = 34;
`;

var V35 = `

CREATE TABLE dat_dns (
  id INTEGER PRIMARY KEY,
  name TEXT,
  key TEXT,
  isCurrent INTEGER,
  lastConfirmedAt INTEGER,
  firstConfirmedAt INTEGER
);
CREATE INDEX dat_dns_name ON dat_dns (name);
CREATE INDEX dat_dns_key ON dat_dns (key);

ALTER TABLE crawl_sources ADD COLUMN datDnsId INTEGER;

PRAGMA user_version = 35;
`;

var V36 = `
CREATE TABLE user_site_sessions (
  id INTEGER PRIMARY KEY NOT NULL,
  userId INTEGER NOT NULL,
  url TEXT,
  permissionsJson TEXT,
  createdAt INTEGER,
 
  FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
);
PRAGMA user_version = 36;
`;

var V37 = `

ALTER TABLE crawl_sources ADD COLUMN isPrivate INTEGER;

PRAGMA user_version = 37;
`;

var V38 = `

ALTER TABLE archives_meta ADD COLUMN author TEXT;

PRAGMA user_version = 38;
`;

var V39 = `
DROP TRIGGER IF EXISTS crawl_posts_ai;
DROP TRIGGER IF EXISTS crawl_posts_ad;
DROP TRIGGER IF EXISTS crawl_posts_au;
DROP TABLE IF EXISTS crawl_posts;

-- crawled statuses
CREATE TABLE crawl_statuses (
  crawlSourceId INTEGER NOT NULL,
  pathname TEXT NOT NULL,
  crawledAt INTEGER,

  body TEXT,
  createdAt INTEGER,
  updatedAt INTEGER,

  FOREIGN KEY (crawlSourceId) REFERENCES crawl_sources (id) ON DELETE CASCADE
);
CREATE VIRTUAL TABLE crawl_statuses_fts_index USING fts5(body, content='crawl_statuses');

-- triggers to keep crawl_statuses_fts_index updated
CREATE TRIGGER crawl_statuses_ai AFTER INSERT ON crawl_statuses BEGIN
  INSERT INTO crawl_statuses_fts_index(rowid, body) VALUES (new.rowid, new.body);
END;
CREATE TRIGGER crawl_statuses_ad AFTER DELETE ON crawl_statuses BEGIN
  INSERT INTO crawl_statuses_fts_index(crawl_statuses_fts_index, rowid, body) VALUES('delete', old.rowid, old.body);
END;
CREATE TRIGGER crawl_statuses_au AFTER UPDATE ON crawl_statuses BEGIN
  INSERT INTO crawl_statuses_fts_index(crawl_statuses_fts_index, rowid, body) VALUES('delete', old.rowid, old.body);
  INSERT INTO crawl_statuses_fts_index(rowid, body) VALUES (new.rowid, new.body);
END;

PRAGMA user_version = 39;
`;

var V40 = `

DROP INDEX IF EXISTS crawl_reactions_topic;
DROP TABLE IF EXISTS crawl_reactions;

-- crawled reactions
CREATE TABLE crawl_reactions (
  crawlSourceId INTEGER NOT NULL,
  pathname TEXT NOT NULL,
  crawledAt INTEGER,
  
  topic TEXT NOT NULL,
  phrases TEXT NOT NULL,

  PRIMARY KEY (crawlSourceId, pathname),
  FOREIGN KEY (crawlSourceId) REFERENCES crawl_sources (id) ON DELETE CASCADE
);
CREATE INDEX crawl_reactions_topic ON crawl_reactions (topic);

PRAGMA user_version = 40;
`;

var V41 = `

ALTER TABLE archives_meta ADD COLUMN type TEXT;

-- crawled dats
CREATE TABLE crawl_dats (
  crawlSourceId INTEGER NOT NULL,
  crawledAt INTEGER,
  
  key TEXT NOT NULL,
  title TEXT,
  description TEXT,
  type TEXT,

  PRIMARY KEY (crawlSourceId, key),
  FOREIGN KEY (crawlSourceId) REFERENCES crawl_sources (id) ON DELETE CASCADE
);

PRAGMA user_version = 41;
`;

var V42 = `

CREATE VIRTUAL TABLE crawl_dats_fts_index USING fts5(title, description, content='crawl_dats');

-- triggers to keep crawl_dats_fts_index updated
CREATE TRIGGER crawl_dats_ai AFTER INSERT ON crawl_dats BEGIN
  INSERT INTO crawl_dats_fts_index(rowid, title, description) VALUES (new.rowid, new.title, new.description);
END;
CREATE TRIGGER crawl_dats_ad AFTER DELETE ON crawl_dats BEGIN
  INSERT INTO crawl_dats_fts_index(crawl_dats_fts_index, rowid, title, description) VALUES('delete', old.rowid, old.title, old.description);
END;
CREATE TRIGGER crawl_dats_au AFTER UPDATE ON crawl_dats BEGIN
  INSERT INTO crawl_dats_fts_index(crawl_dats_fts_index, rowid, title, description) VALUES('delete', old.rowid, old.title, old.description);
  INSERT INTO crawl_dats_fts_index(rowid, title, description) VALUES (new.rowid, new.title, new.description);
END;

CREATE VIRTUAL TABLE archives_meta_fts_index USING fts5(title, description, content='archives_meta');

-- triggers to keep archives_meta_fts_index updated
CREATE TRIGGER archives_meta_ai AFTER INSERT ON archives_meta BEGIN
  INSERT INTO archives_meta_fts_index(rowid, title, description) VALUES (new.rowid, new.title, new.description);
END;
CREATE TRIGGER archives_meta_ad AFTER DELETE ON archives_meta BEGIN
  INSERT INTO archives_meta_fts_index(archives_meta_fts_index, rowid, title, description) VALUES('delete', old.rowid, old.title, old.description);
END;
CREATE TRIGGER archives_meta_au AFTER UPDATE ON archives_meta BEGIN
  INSERT INTO archives_meta_fts_index(archives_meta_fts_index, rowid, title, description) VALUES('delete', old.rowid, old.title, old.description);
  INSERT INTO archives_meta_fts_index(rowid, title, description) VALUES (new.rowid, new.title, new.description);
END;

PRAGMA user_version = 42;
`;

var V43 = `

-- remove deprecations
DROP TRIGGER IF EXISTS crawl_discussions_au;
DROP TRIGGER IF EXISTS crawl_discussions_ad;
DROP TRIGGER IF EXISTS crawl_discussions_ai;
DROP TRIGGER IF EXISTS crawl_media_au;
DROP TRIGGER IF EXISTS crawl_media_ad;
DROP TRIGGER IF EXISTS crawl_media_ai;
DROP TRIGGER IF EXISTS crawl_site_descriptions_au;
DROP TRIGGER IF EXISTS crawl_site_descriptions_ad;
DROP TRIGGER IF EXISTS crawl_site_descriptions_ai;
DROP TRIGGER IF EXISTS crawl_dats_au;
DROP TRIGGER IF EXISTS crawl_dats_ad;
DROP TRIGGER IF EXISTS crawl_dats_ai;
DROP TRIGGER IF EXISTS crawl_bookmarks_au;
DROP TRIGGER IF EXISTS crawl_bookmarks_ad;
DROP TRIGGER IF EXISTS crawl_bookmarks_ai;
DROP TRIGGER IF EXISTS crawl_comments_au;
DROP TRIGGER IF EXISTS crawl_comments_ad;
DROP TRIGGER IF EXISTS crawl_comments_ai;
DROP TRIGGER IF EXISTS crawl_statuses_au;
DROP TRIGGER IF EXISTS crawl_statuses_ad;
DROP TRIGGER IF EXISTS crawl_statuses_ai;
DROP TABLE IF EXISTS crawl_discussions_tags;
DROP TABLE IF EXISTS crawl_discussions_fts_index;
DROP TABLE IF EXISTS crawl_discussions;
DROP TABLE IF EXISTS crawl_media_tags;
DROP TABLE IF EXISTS crawl_media_fts_index;
DROP TABLE IF EXISTS crawl_media;
DROP TABLE IF EXISTS crawl_site_descriptions_fts_index;
DROP TABLE IF EXISTS crawl_site_descriptions;
DROP TABLE IF EXISTS crawl_dats_fts_index;
DROP TABLE IF EXISTS crawl_dats;
DROP TABLE IF EXISTS crawl_follows;
DROP TABLE IF EXISTS crawl_bookmarks_tags;
DROP TABLE IF EXISTS crawl_bookmarks_fts_index;
DROP TABLE IF EXISTS crawl_bookmarks;
DROP TABLE IF EXISTS crawl_votes;
DROP TABLE IF EXISTS crawl_reactions;
DROP TABLE IF EXISTS crawl_comments_fts_index;
DROP TABLE IF EXISTS crawl_comments;
DROP TABLE IF EXISTS crawl_statuses_fts_index;
DROP TABLE IF EXISTS crawl_statuses;
DROP TABLE IF EXISTS crawl_tags;
DROP TABLE IF EXISTS crawl_sources_meta;
DROP TABLE IF EXISTS crawl_sources;

PRAGMA user_version = 43;
`;

var V44 = `

CREATE TABLE setup_state (
  profileCreated INTEGER DEFAULT 0
);

PRAGMA user_version = 44;
`;

var V45 = `

DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS user_site_sessions;
CREATE TABLE user_site_sessions (
  id INTEGER PRIMARY KEY NOT NULL,
  siteOrigin TEXT,
  userUrl TEXT,
  permissionsJson TEXT,
  createdAt INTEGER
);

PRAGMA user_version = 45;
`;

var V46 = `

-- add variable to user memberOf metadata
ALTER TABLE archives_meta ADD COLUMN memberOf TEXT;

PRAGMA user_version = 46;
`;

var V47 = `

DROP TABLE IF EXISTS setup_state;
CREATE TABLE setup_state (
  migrated08to09 INTEGER DEFAULT 0
);

PRAGMA user_version = 47;
`;

var V48 = `

ALTER TABLE setup_state ADD COLUMN profileSetup INTEGER DEFAULT 0;

PRAGMA user_version = 48;
`;

var V49 = `

ALTER TABLE setup_state ADD COLUMN hasVisitedProfile INTEGER DEFAULT 0;

PRAGMA user_version = 49;
`;

var V50 = `

CREATE TABLE folder_syncs (
  key TEXT NOT NULL,
  localPath TEXT,
  ignoredFiles TEXT
);

PRAGMA user_version = 50;
`;

var V51 = `

ALTER TABLE setup_state ADD COLUMN migratedContactsToFollows INTEGER DEFAULT 0;

PRAGMA user_version = 51;
`;

var V52 = `

ALTER TABLE visits ADD COLUMN tabClose INTEGER DEFAULT 0;

PRAGMA user_version = 52;
`;

// typedefs
// =

/**
 * @typedef {Object} SQLiteResult
 * @prop {string} lastID
 */

// globals
// =

var db$1;
var migrations$1;
var setupPromise$1;

// exported methods
// =

/**
 * @param {Object} opts
 * @param {string} opts.userDataPath
 */
const setup$3 = function (opts) {
  // open database
  var dbPath = path__default.join(opts.userDataPath, 'Profiles');
  db$1 = new sqlite3.Database(dbPath);
  setupPromise$1 = setupSqliteDB(db$1, {migrations: migrations$1}, '[PROFILES]');
};

/**
 * @param {...(any)} args
 * @return {Promise<any>}
 */
const get$2 = async function (...args) {
  await setupPromise$1;
  args = handleQueryBuilder(args);
  return cbPromise(cb => db$1.get(...args, cb))
};

/**
 * @param {...(any)} args
 * @return {Promise<Array<any>>}
 */
const all = async function (...args) {
  await setupPromise$1;
  args = handleQueryBuilder(args);
  return cbPromise(cb => db$1.all(...args, cb))
};

/**
 * @param {...(any)} args
 * @return {Promise<SQLiteResult>}
 */
const run = async function (...args) {
  await setupPromise$1;
  args = handleQueryBuilder(args);
  return cbPromise(cb => db$1.run(...args, function (err) {
    if (err) cb(err);
    else cb(null, {lastID: this.lastID});
  }))
};

/**
 * @returns {Promise<void>}
 */
const serialize = function () {
  return db$1.serialize()
};

/**
 * @returns {Promise<void>}
 */
const parallelize = function () {
  return db$1.parallelize()
};

const getSqliteInstance = () => db$1;
migrations$1 = [
  migration(V1),
  migration(V2),
  migration(V3),
  migration(V4),
  migration(V5),
  migration(V6),
  migration(V7),
  migration(V8),
  migration(V9),
  migration(V10),
  migration(V11),
  migration(V12),
  migration(V13),
  migration(V14),
  migration(V15),
  migration(V16, {canFail: true}), // set canFail because we made a mistake in the rollout of this update, see https://github.com/beakerbrowser/beaker/issues/934
  migration(V17),
  migration(V18),
  migration(V19),
  migration(V20),
  migration(V21),
  migration(V22, {canFail: true}), // canFail for the same reason as v16, ffs
  migration(V23),
  migration(V24),
  migration(V25),
  migration(V26),
  migration(V27),
  migration(V28),
  migration(V29),
  migration(V30),
  migration(V31),
  migration(V32),
  migration(V33),
  migration(V34),
  migration(V35),
  migration(V36),
  migration(V37),
  migration(V38),
  migration(V39),
  migration(V40),
  migration(V41),
  migration(V42),
  migration(V43),
  migration(V44),
  migration(V45),
  migration(V46),
  migration(V47),
  migration(V48),
  migration(V49),
  migration(V50),
  migration(V51),
  migration(V52)
];
function migration (file, opts = {}) {
  return cb => {
    if (opts.canFail) {
      var orgCb = cb;
      cb = () => orgCb(); // suppress the error
    }
    db$1.exec(file, cb);
  }
}

var profileData = /*#__PURE__*/Object.freeze({
  __proto__: null,
  setup: setup$3,
  get: get$2,
  all: all,
  run: run,
  serialize: serialize,
  parallelize: parallelize,
  getSqliteInstance: getSqliteInstance
});

// wraps await-lock in a simpler interface, with many possible locks
var locks = {};

/**
 * Create a new lock
 * @example
 * var lock = require('./lock')
 * async function foo () {
 *   var release = await lock('bar')
 *   // ...
 *   release()
 * }
 * @param {string} key
 * @returns {Promise<function(): void>}
 */
async function lock (key) {
  if (!(key in locks)) locks[key] = new AwaitLock();

  var lock = locks[key];
  await lock.acquireAsync();
  return lock.release.bind(lock)
}

// native FS file paths
const ANALYTICS_DATA_FILE = 'analytics-ping.json';
const ANALYTICS_SERVER = 'analytics.beakerbrowser.com';
const ANALYTICS_CHECKIN_INTERVAL = ms('6h');

// hyperdrive trash management
const TRASH_EXPIRATION_AGE = ms('7d'); // how old do items need to be before deleting them from the trash?
const TRASH_FIRST_COLLECT_WAIT = ms('30s'); // how long after process start to do first collect?
const TRASH_REGULAR_COLLECT_WAIT = ms('15m'); // how long between collections?

// 64 char hex
const HYPERDRIVE_HASH_REGEX = /^[0-9a-f]{64}$/i;

// url file paths
const DRIVE_VALID_PATH_REGEX = /^[a-z0-9\-._~!$&'()*+,;=:@/\s]+$/i;

// dat settings
const DAT_SWARM_PORT = 3282;
const DRIVE_MANIFEST_FILENAME = 'index.json';
let quotaEnvVar = process.env.WALLETS_DAT_QUOTA_DEFAULT_BYTES_ALLOWED || process.env.WALLETS_dat_quota_default_bytes_allowed;
const DAT_QUOTA_DEFAULT_BYTES_ALLOWED = bytes.parse(quotaEnvVar || '500mb');
const DAT_CACHE_TIME = ms('7d');
const DEFAULT_DAT_DNS_TTL = ms('1h');
const MAX_DAT_DNS_TTL = ms('7d');
const DEFAULT_DRIVE_API_TIMEOUT = ms('60s');

// index.json manifest fields which can be changed by configure()
const DRIVE_CONFIGURABLE_FIELDS = [
  'title',
  'description',
  'author'
];

var knex = require('knex')({client: 'sqlite3', useNullAsDefault: true});

// typedefs
// =

/**
 * @typedef {Object} DatDnsRecord
 * @prop {string} name
 * @prop {string} key
 * @prop {boolean} isCurrent
 * @prop {number} lastConfirmedAt
 * @prop {number} firstConfirmedAt
 */

// globals
// =

const events$1 = new EventEmitter__default();

// exported api
// =

const on$1 = events$1.on.bind(events$1);

const once$1 = events$1.once.bind(events$1);
const removeListener = events$1.removeListener.bind(events$1);

/**
 * @param {string} key
 * @returns {Promise<DatDnsRecord>}
 */
const getCurrentByKey = async function (key) {
  return massageDNSRecord(await get$2(knex('dat_dns').where({key, isCurrent: 1})))
};

// internal methods
// =

function massageDNSRecord (record) {
  if (!record) return null
  return {
    name: record.name,
    key: record.key,
    isCurrent: Boolean(record.isCurrent),
    lastConfirmedAt: record.lastConfirmedAt,
    firstConfirmedAt: record.firstConfirmedAt
  }
}

// typedefs
// =

/**
 * @typedef {Object} CapabilityMapping
 * @prop {String} owningOrigin
 * @prop {String} token
 * @prop {Object} target
 * @prop {String} target.key
 * @prop {String} target.version
 */

// globals
// =

/** @type CapabilityMapping[] */
var capabilities = [];

// exported api
// =

/**
 * @param {string} capUrl 
 * @returns {CapabilityMapping}
 */
function lookupCap (capUrl) {
  var token = extractToken(capUrl);
  if (!token) throw new Error('Invalid capability URL')
  return capabilities.find(c => c.token === token)
}

/**
 * @param {String} origin
 * @param {String} target
 * @returns {String}
 */
function createCap (origin, target) {
  var token = generateToken();
  capabilities.push({
    owningOrigin: origin,
    token,
    target: parseTarget(target)
  });
  return `hyper://${token}.cap/`
}

/**
 * @param {String} origin
 * @param {String} capUrl
 * @param {String} target
 * @returns {Void}
 */
function modifyCap (origin, capUrl, target) {
  var token = extractToken(capUrl);
  if (!token) throw new Error('Invalid capability URL')
  var cap = capabilities.find(c => c.token === token);
  if (!cap) throw new Error('Capability does not exist')
  
  if (cap.owningOrigin !== origin) {
    throw new beakerErrorConstants.PermissionsError('Cannot modify unowned capability')
  }

  cap.target = parseTarget(target);
}

/**
 * @param {String} origin
 * @param {String} capUrl
 * @returns {Void}
 */
function deleteCap (origin, capUrl) {
  var token = extractToken(capUrl);
  if (!token) throw new Error('Invalid capability URL')
  var capIndex = capabilities.findIndex(c => c.token === token);
  if (capIndex === -1) throw new Error('Capability does not exist')
  
  if (capabilities[capIndex].owningOrigin !== origin) {
    throw new beakerErrorConstants.PermissionsError('Cannot modify unowned capability')
  }
  
  capabilities.splice(capIndex, 1);
}

// internal methods
// =

function generateToken () {
  var buf = crypto.randomBytes(8);
  var encoder = new base32.Encoder({type: 'rfc4648', lc: true});
  return encoder.write(buf).finalize()
}

function extractToken (capUrl) {
  var matches = /^(hyper:\/\/)?([a-z0-9]+)\.cap\/?/.exec(capUrl);
  return matches ? matches[2] : undefined
}

function parseTarget (target) {
  try {
    var urlp = parseDriveUrl(target);
    if (urlp.protocol !== 'hyper:') throw new Error()
    return {key: urlp.hostname, version: urlp.version}
  } catch (e) {
    throw new Error('Invalid target hyper:// URL')
  }
}

const logger$2 = child({category: 'hyper', subcategory: 'dns'});

var localMapByName = {};
var localMapByKey = {};

function setLocal (name, url) {
  var key = toHostname(url);
  localMapByName[name] = key;
  localMapByKey[key] = name;
}

async function resolveName (name) {
  name = toHostname(name);
  if (HYPERDRIVE_HASH_REGEX.test(name)) return name
  return localMapByName[name]
}

async function reverseResolve (key) {
  return localMapByKey[toHostname(key)]
}

function toHostname (v) {
  if (Buffer.isBuffer(v)) {
    return v.toString('hex')
  }
  try {
    var urlp = new URL(v);
    return urlp.hostname
  } catch (e) {
    return v
  }
}

/*
TODO

const DNS_PROVIDERS = [['cloudflare-dns.com', '/dns-query'], ['dns.google.com', '/resolve']]
const DNS_PROVIDER = DNS_PROVIDERS[Math.random() > 0.5 ? 1 : 0]
logger.info(`Using ${DNS_PROVIDER[0]} to resolve DNS lookups`)

// instantate a dns cache and export it
const datDns = datDnsFactory({
  persistentCache: {read, write},
  dnsHost: DNS_PROVIDER[0],
  dnsPath: DNS_PROVIDER[1]
})

export default datDns

// hook up log events
datDns.on('resolved', details => logger.debug('Resolved', {details}))
datDns.on('failed', details => logger.debug('Failed lookup', {details}))
datDns.on('cache-flushed', details => logger.debug('Cache flushed'))

// wrap resolveName() with a better error
const resolveName = datDns.resolveName
datDns.resolveName = async function (name, opts, cb) {
  return resolveName.apply(datDns, arguments)
    .catch(_ => {
      throw new InvalidDomainName()
    })
}

// persistent cache methods
async function read (name, err) {
  // check the cache
  var record = await datDnsDb.getCurrentByName(name)
  if (!record) throw err
  return record.key
}
async function write (name, key) {
  if (HYPERDRIVE_HASH_REGEX.test(name)) return // dont write for raw urls
  await drives.confirmDomain(key)
}
*/

var hyperDns = /*#__PURE__*/Object.freeze({
  __proto__: null,
  setLocal: setLocal,
  resolveName: resolveName,
  reverseResolve: reverseResolve
});

// typedefs
// =

/**
 * @typedef {import('../dat/daemon').DaemonHyperdrive} DaemonHyperdrive
 *
 * @typedef {Object} LibraryArchiveMeta
 * @prop {string} key
 * @prop {string} url
 * @prop {string} title
 * @prop {string} description
 * @prop {string} type
 * @prop {string} memberOf
 * @prop {number} mtime
 * @prop {number} size
 * @prop {string} author
 * @prop {string} forkOf
 * @prop {boolean} writable
 * @prop {number} lastAccessTime
 * @prop {number} lastLibraryAccessTime
 *
 * @typedef {Object} MinimalLibraryArchiveRecord
 * @prop {string} key
 */

// globals
// =

var datPath;/** @type string - path to the dat folder */
var events$2 = new EventEmitter__default();

// exported methods
// =

/**
 * @param {Object} opts
 * @param {string} opts.userDataPath
 */
function setup$4 (opts) {
  // make sure the folders exist
  datPath = path__default.join(opts.userDataPath, 'Dat');
  mkdirp.sync(path__default.join(datPath, 'Archives'));
}

/**
 * @returns {string}
 */
function getDatPath () {
  return datPath
}

/**
 * @description Get the path to an archive's files.
 * @param {string | Buffer | DaemonHyperdrive} archiveOrKey
 * @returns {string}
 */
//
function getArchiveMetaPath (archiveOrKey) {
  var key; /** @type string */
  if (typeof archiveOrKey === 'string') {
    key = archiveOrKey;
  } else if (Buffer.isBuffer(archiveOrKey)) {
    key = datEncoding.toStr(archiveOrKey);
  } else {
    key = datEncoding.toStr(archiveOrKey.key);
  }
  return path__default.join(datPath, 'Archives', 'Meta', key.slice(0, 2), key.slice(2))
}

/**
 * @description Delete all db entries and files for an archive.
 * @param {string} key
 * @returns {Promise<number>}
 */
async function deleteArchive (key) {
  const path = getArchiveMetaPath(key);
  const info = await jetpack.inspectTreeAsync(path);
  await Promise.all([
    run(`DELETE FROM archives WHERE key=?`, key),
    run(`DELETE FROM archives_meta WHERE key=?`, key),
    jetpack.removeAsync(path)
  ]);
  return info ? info.size : 0
}

const on$2 = events$2.on.bind(events$2);
const addListener = events$2.addListener.bind(events$2);
const removeListener$1 = events$2.removeListener.bind(events$2);

/**
 * @description Upsert the last-access time.
 * @param {string | Buffer} key
 * @param {string} [timeVar]
 * @param {number} [value]
 * @returns {Promise<void>}
 */
async function touch (key, timeVar = 'lastAccessTime', value = -1) {
  var release = await lock('archives-db:meta');
  try {
    if (timeVar !== 'lastAccessTime' && timeVar !== 'lastLibraryAccessTime') {
      timeVar = 'lastAccessTime';
    }
    if (value === -1) value = Date.now();
    var keyStr = datEncoding.toStr(key);
    await run(`UPDATE archives_meta SET ${timeVar}=? WHERE key=?`, [value, keyStr]);
    await run(`INSERT OR IGNORE INTO archives_meta (key, ${timeVar}) VALUES (?, ?)`, [keyStr, value]);
  } finally {
    release();
  }
}

/**
 * @param {string} key
 * @returns {Promise<boolean>}
 */
async function hasMeta (key) {
  // massage inputs
  var keyStr = typeof key !== 'string' ? datEncoding.toStr(key) : key;
  if (!HYPERDRIVE_HASH_REGEX.test(keyStr)) {
    try {
      keyStr = await resolveName(keyStr);
    } catch (e) {
      return false
    }
  }

  // fetch
  var meta = await get$2(`
    SELECT
        archives_meta.key
      FROM archives_meta
      WHERE archives_meta.key = ?
  `, [keyStr]);
  return !!meta
}

/**
 * @description
 * Get a single archive's metadata.
 * Returns an empty object on not-found.
 * @param {string | Buffer} key
 * @param {Object} [opts]
 * @param {boolean} [opts.noDefault]
 * @returns {Promise<LibraryArchiveMeta>}
 */
async function getMeta (key, {noDefault} = {noDefault: false}) {
  // massage inputs
  var keyStr = typeof key !== 'string' ? datEncoding.toStr(key) : key;
  var origKeyStr = keyStr;

  // validate inputs
  if (!HYPERDRIVE_HASH_REGEX.test(keyStr)) {
    try {
      keyStr = await resolveName(keyStr);
    } catch (e) {
      return noDefault ? undefined : defaultMeta(keyStr, origKeyStr)
    }
  }

  // fetch
  var meta = await get$2(`
    SELECT
        archives_meta.*,
        dat_dns.name as dnsName
      FROM archives_meta
      LEFT JOIN dat_dns ON dat_dns.key = archives_meta.key AND dat_dns.isCurrent = 1
      WHERE archives_meta.key = ?
      GROUP BY archives_meta.key
  `, [keyStr]);
  if (!meta) {
    return noDefault ? undefined : defaultMeta(keyStr, origKeyStr)
  }

  // massage some values
  meta.url = `hyper://${meta.dnsName || meta.key}/`;
  delete meta.dnsName;
  meta.writable = !!meta.isOwner;
  meta.memberOf = meta.memberOf || undefined;

  // remove old attrs
  delete meta.isOwner;
  delete meta.createdByTitle;
  delete meta.createdByUrl;
  delete meta.metaSize;
  delete meta.stagingSize;
  delete meta.stagingSizeLessIgnored;

  return meta
}

/**
 * @description Write an archive's metadata.
 * @param {string | Buffer} key
 * @param {LibraryArchiveMeta} [value]
 * @returns {Promise<void>}
 */
async function setMeta (key, value) {
  // massage inputs
  var keyStr = datEncoding.toStr(key);

  // validate inputs
  if (!HYPERDRIVE_HASH_REGEX.test(keyStr)) {
    throw new beakerErrorConstants.InvalidArchiveKeyError()
  }
  if (!value || typeof value !== 'object') {
    return // dont bother
  }

  // extract the desired values
  var {title, description, type, memberOf, size, author, forkOf, mtime, writable} = value;
  title = typeof title === 'string' ? title : '';
  description = typeof description === 'string' ? description : '';
  type = typeof type === 'string' ? type : '';
  memberOf = typeof memberOf === 'string' ? memberOf : '';
  var isOwnerFlag = flag(writable);
  if (typeof author === 'string') author = normalizeDriveUrl(author);
  if (typeof forkOf === 'string') forkOf = normalizeDriveUrl(forkOf);

  // write
  var release = await lock('archives-db:meta');
  var {lastAccessTime, lastLibraryAccessTime} = await getMeta(keyStr);
  try {
    await run(`
      INSERT OR REPLACE INTO
        archives_meta (key, title, description, type, memberOf, mtime, size, author, forkOf, isOwner, lastAccessTime, lastLibraryAccessTime)
        VALUES        (?,   ?,     ?,           ?,    ?,        ?,     ?,    ?,      ?,      ?,       ?,              ?)
    `, [keyStr, title, description, type, memberOf, mtime, size, author, forkOf, isOwnerFlag, lastAccessTime, lastLibraryAccessTime]);
  } finally {
    release();
  }
  events$2.emit('update:archive-meta', keyStr, value);
}

function listLegacyArchives () {
  return all(`SELECT archives.*, archives_meta.title from archives JOIN archives_meta ON archives_meta.key = archives.key WHERE archives.isSaved = 1`)
}

function removeLegacyArchive (key) {
  return all(`UPDATE archives SET isSaved = 0 WHERE key = ?`, [key])
}

// internal methods
// =

/**
 * @param {string} key
 * @param {string} name
 * @returns {LibraryArchiveMeta}
 */
function defaultMeta (key, name) {
  return {
    key,
    url: `hyper://${name}/`,
    title: undefined,
    description: undefined,
    type: undefined,
    memberOf: undefined,
    author: undefined,
    forkOf: undefined,
    mtime: 0,
    writable: false,
    lastAccessTime: 0,
    lastLibraryAccessTime: 0,
    size: 0
  }
}

/**
 * @param {boolean} b
 * @returns {number}
 */
function flag (b) {
  return b ? 1 : 0
}

/**
 * @param {string} originURL
 * @returns {string}
 */
function extractOrigin (originURL) {
  var urlp = url__default.parse(originURL);
  if (!urlp || !urlp.host || !urlp.protocol) return
  return (urlp.protocol + (urlp.slashes ? '//' : '') + urlp.host)
}

function normalizeDriveUrl (url) {
  var match = url.match(HYPERDRIVE_HASH_REGEX);
  if (match) {
    return `hyper://${match[0]}/`
  }
  return extractOrigin(url)
}

var archives = /*#__PURE__*/Object.freeze({
  __proto__: null,
  setup: setup$4,
  getDatPath: getDatPath,
  getArchiveMetaPath: getArchiveMetaPath,
  deleteArchive: deleteArchive,
  on: on$2,
  addListener: addListener,
  removeListener: removeListener$1,
  touch: touch,
  hasMeta: hasMeta,
  getMeta: getMeta,
  setMeta: setMeta,
  listLegacyArchives: listLegacyArchives,
  removeLegacyArchive: removeLegacyArchive,
  extractOrigin: extractOrigin
});

const baseLogger = get();
const logger$3 = baseLogger.child({category: 'hyper', subcategory: 'daemon'});

const SETUP_RETRIES = 100;
const GARBAGE_COLLECT_SESSIONS_INTERVAL = 30e3;
const MAX_SESSION_AGE = 300e3; // 5min
const HYPERSPACE_BIN_PATH = require.resolve('hyperspace/bin/index.js');
const HYPERSPACE_STORAGE_DIR = path.join(os.homedir(), '.hyperspace', 'storage');
const HYPERDRIVE_STORAGE_DIR = path.join(os.homedir(), '.hyperdrive', 'storage', 'cores');

// typedefs
// =

/**
* @typedef {Object} DaemonHyperdrive
* @prop {number} sessionId
* @prop {Buffer} key
* @prop {Buffer} discoveryKey
* @prop {string} url
* @prop {string} domain
* @prop {boolean} writable
* @prop {Boolean} persistSession
* @prop {Object} session
* @prop {Object} session.drive
* @prop {function(): Promise<void>} session.close
* @prop {function(Object): Promise<void>} session.configureNetwork
* @prop {function(): Promise<Object>} getInfo
* @prop {DaemonHyperdrivePDA} pda
*
* @typedef {Object} DaemonHyperdrivePDA
* @prop {Number} lastCallTime
* @prop {Number} numActiveStreams
* @prop {function(string): Promise<Object>} stat
* @prop {function(string, Object=): Promise<any>} readFile
* @prop {function(string, Object=): Promise<Array<Object>>} readdir
* @prop {function(string): Promise<number>} readSize
* @prop {function(number, string?): Promise<Array<Object>>} diff
* @prop {function(string, any, Object=): Promise<void>} writeFile
* @prop {function(string): Promise<void>} mkdir
* @prop {function(string, string): Promise<void>} copy
* @prop {function(string, string): Promise<void>} rename
* @prop {function(string, Object): Promise<void>} updateMetadata
* @prop {function(string, string|string[]): Promise<void>} deleteMetadata
* @prop {function(string): Promise<void>} unlink
* @prop {function(string, Object=): Promise<void>} rmdir
* @prop {function(string, string|Buffer): Promise<void>} mount
* @prop {function(string): Promise<void>} unmount
* @prop {function(string=): NodeJS.ReadableStream} watch
* @prop {function(): NodeJS.ReadableStream} createNetworkActivityStream
* @prop {function(): Promise<Object>} readManifest
* @prop {function(Object): Promise<void>} writeManifest
* @prop {function(Object): Promise<void>} updateManifest
*/

// globals
// =

var client; // client object created by hyperdrive-daemon-client
var isControllingDaemonProcess = false; // did we start the process?
var isSettingUp = true;
var isShuttingDown = false;
var isDaemonActive = false;
var isFirstConnect = true;
var daemonProcess = undefined;
var sessions = {}; // map of keyStr => DaemonHyperdrive
var events$3 = new EventEmitter__default();

// exported apis
// =

const on$3 = events$3.on.bind(events$3);

function getClient () {
  return client
}

function getHyperspaceClient () {
  return client._client
}

function isActive () {
  if (isFirstConnect) {
    // avoid the "inactive daemon" indicator during setup
    return true
  }
  return isDaemonActive
}

async function getDaemonStatus () {
  if (isDaemonActive) {
    return Object.assign(await client.status(), {active: true})
  }
  return {active: false}
}

async function setup$5 () {
  if (isSettingUp) {
    isSettingUp = false;
    // periodically close sessions
    let interval2 = setInterval(() => {
      let numClosed = 0;
      let now = Date.now();
      for (let key in sessions) {
        if (sessions[key].persistSession) continue
        if (sessions[key].pda.numActiveStreams > 0) continue
        if (now - sessions[key].pda.lastCallTime < MAX_SESSION_AGE) continue
        closeHyperdriveSession(key);
        numClosed++;
      }
      if (numClosed > 0) {
        logger$3.debug(`Closed ${numClosed} session(s) due to inactivity`);
      }
    }, GARBAGE_COLLECT_SESSIONS_INTERVAL);
    interval2.unref();

    events$3.on('daemon-restored', async () => {
      logger$3.info('Hyperdrive daemon has been restored');
    });
    events$3.on('daemon-stopped', async () => {
      logger$3.info('Hyperdrive daemon has been lost');
      isControllingDaemonProcess = false;
    });
  }

  try {
    client = new HyperdriveClient();
    await client.ready();
    logger$3.info('Connected to an external daemon.');
    isDaemonActive = true;
    isFirstConnect = false;
    events$3.emit('daemon-restored');
    reconnectAllDriveSessions();
    return
  } catch (err) {
    logger$3.info('Failed to connect to an external daemon. Launching the daemon...');
    client = false;
  }

  isControllingDaemonProcess = true;
  logger$3.info('Starting daemon process, assuming process control');

  // Check which storage directory to use.
  // If .hyperspace/storage exists, use that. Otherwise use .hyperdrive/storage/cores
  const storageDir = await getDaemonStorageDir();
  var daemonProcessArgs = [HYPERSPACE_BIN_PATH, '-s', storageDir, '--no-migrate'];
  logger$3.info(`Daemon: spawn ${electron.app.getPath('exe')} ${daemonProcessArgs.join(' ')}`);
  daemonProcess = childProcess.spawn(electron.app.getPath('exe'), daemonProcessArgs, {
    // stdio: [process.stdin, process.stdout, process.stderr], // DEBUG
    env: Object.assign({}, process.env, {
      ELECTRON_RUN_AS_NODE: 1,
      ELECTRON_NO_ASAR: 1
    })
  });
  daemonProcess.stdout.on('data', data => logger$3.info(`Daemon: ${data}`));
  daemonProcess.stderr.on('data', data => logger$3.info(`Daemon (stderr): ${data}`));
  daemonProcess.on('error', (err) => logger$3.error(`Hyperspace Daemon error: ${err.toString()}`));
  daemonProcess.on('close', () => {
    logger$3.info(`Daemon process has closed`);
    isDaemonActive = false;
    daemonProcess = undefined;
    events$3.emit('daemon-stopped');
  });

  await attemptConnect();
  isDaemonActive = true;
  isFirstConnect = false;
  events$3.emit('daemon-restored');
  reconnectAllDriveSessions();
}

function requiresShutdown () {
  return isControllingDaemonProcess && !isShuttingDown
}

async function shutdown () {
  if (isControllingDaemonProcess && isDaemonActive) {
    let promise = new Promise((resolve) => {
      daemonProcess.on('close', () => resolve());
    });
    isShuttingDown = true;
    daemonProcess.kill();
    
    // HACK: the daemon has a bug that causes it to stay open sometimes, give it the double tap -prf
    let i = setInterval(() => {
      if (!isDaemonActive) {
        clearInterval(i);
      } else {
        daemonProcess.kill();
      }
    }, 2e3);
    i.unref();

    await promise;
  }
}

/**
 * Gets a hyperdrives interface to the daemon for the given key
 *
 * @param {Object|string} opts
 * @param {Buffer} [opts.key]
 * @param {number} [opts.version]
 * @param {Buffer} [opts.hash]
 * @param {boolean} [opts.writable]
 * @returns {DaemonHyperdrive}
 */
function getHyperdriveSession (opts) {
  return sessions[createSessionKey(opts)]
}

/**
 * Creates a hyperdrives interface to the daemon for the given key
 *
 * @param {Object} opts
 * @param {Buffer} [opts.key]
 * @param {number} [opts.version]
 * @param {Buffer} [opts.hash]
 * @param {boolean} [opts.writable]
 * @param {String} [opts.domain]
 * @returns {Promise<DaemonHyperdrive>}
 */
async function createHyperdriveSession (opts) {
  if (opts.key) {
    let sessionKey = createSessionKey(opts);
    if (sessions[sessionKey]) return sessions[sessionKey]
  }

  const drive = await client.drive.get(opts);
  const key = opts.key = datEncoding.toStr(drive.key);
  var driveObj = {
    key: drive.key,
    discoveryKey: drive.discoveryKey,
    url: `hyper://${opts.domain || key}/`,
    writable: drive.writable,
    domain: opts.domain,
    persistSession: false,

    session: {
      drive,
      opts,
      async close () {
        delete sessions[key];
        return this.drive.close()
      }
    },

    async getInfo () {
      var version = await this.session.drive.version();
      return {version}
    },

    pda: createHyperdriveSessionPDA(drive)
  };
  var sessKey = createSessionKey(opts);
  logger$3.debug(`Opening drive-session ${sessKey}`);
  sessions[sessKey] = driveObj;
  return /** @type DaemonHyperdrive */(driveObj)
}

/**
 * Closes a hyperdrives interface to the daemon for the given key
 *
 * @param {Object|string} opts
 * @param {Buffer} [opts.key]
 * @param {number} [opts.version]
 * @param {Buffer} [opts.hash]
 * @param {boolean} [opts.writable]
 * @returns {void}
 */
function closeHyperdriveSession (opts) {
  var key = createSessionKey(opts);
  if (sessions[key]) {
    logger$3.debug(`Closing drive-session ${key}`);
    sessions[key].session.close();
    delete sessions[key];
  }
}

function listPeerAddresses (key) {
  let peers = getHyperdriveSession({key})?.session?.drive?.metadata?.peers;
  if (peers) return peers.map(p => ({type: p.type, remoteAddress: p.remoteAddress}))
}

// internal methods
// =

async function getDaemonStorageDir () {
  try {
    await fs.promises.access(HYPERDRIVE_STORAGE_DIR);
    return HYPERDRIVE_STORAGE_DIR
  } catch (err) {
    return HYPERSPACE_STORAGE_DIR
  }
}

function createSessionKey (opts) {
  if (typeof opts === 'string') {
    return opts // assume it's already a session key
  }
  var key = opts.key.toString('hex');
  if (opts.version) {
    key += `+${opts.version}`;
  }
  if ('writable' in opts) {
    key += `+${opts.writable ? 'w' : 'ro'}`;
  }
  return key
}

async function attemptConnect () {
  var connectBackoff = 100;
  for (let i = 0; i < SETUP_RETRIES; i++) {
    try {
      client = new HyperdriveClient();
      await client.ready();
      break
    } catch (e) {
      logger$3.info('Failed to connect to daemon, retrying');
      await new Promise(r => setTimeout(r, connectBackoff));
      connectBackoff += 100;
    }
  }
}

async function reconnectAllDriveSessions () {
  for (let sessionKey in sessions) {
    await reconnectDriveSession(sessions[sessionKey]);
  }
}

async function reconnectDriveSession (driveObj) {
  const drive = await client.drive.get(driveObj.session.opts);
  driveObj.session.drive = drive;
  driveObj.pda = createHyperdriveSessionPDA(drive);
}

/**
 * Provides a pauls-dat-api2 object for the given drive
 * @param {Object} drive
 * @returns {DaemonHyperdrivePDA}
 */
function createHyperdriveSessionPDA (drive) {
  var obj = {
    lastCallTime: Date.now(),
    numActiveStreams: 0
  };
  for (let k in pda) {
    if (typeof pda[k] === 'function') {
      obj[k] = async (...args) => {
        obj.lastCallTime = Date.now();
        if (k === 'watch') {
          obj.numActiveStreams++;
          let stream = pda.watch.call(pda, drive, ...args);
          stream.on('close', () => {
            obj.numActiveStreams--;
          });
          return stream
        }
        return pda[k].call(pda, drive, ...args)
      };
    }
  }
  return obj
}

var daemon = /*#__PURE__*/Object.freeze({
  __proto__: null,
  on: on$3,
  getClient: getClient,
  getHyperspaceClient: getHyperspaceClient,
  isActive: isActive,
  getDaemonStatus: getDaemonStatus,
  setup: setup$5,
  requiresShutdown: requiresShutdown,
  shutdown: shutdown,
  getHyperdriveSession: getHyperdriveSession,
  createHyperdriveSession: createHyperdriveSession,
  closeHyperdriveSession: closeHyperdriveSession,
  listPeerAddresses: listPeerAddresses
});

// globals
// =

var db$2;
var migrations$2;
var setupPromise$2;

// exported methods
// =

/**
 * @param {Object} opts
 * @param {string} opts.userDataPath
 */
function setup$6 (opts) {
  // open database
  var dbPath = path__default.join(opts.userDataPath, 'SiteData');
  db$2 = new sqlite3.Database(dbPath);
  setupPromise$2 = setupSqliteDB(db$2, {migrations: migrations$2}, '[SITEDATA]');
}

/**
 * @param {string} url
 * @param {string} key
 * @param {number | string} value
 * @param {Object} [opts]
 * @param {boolean} [opts.dontExtractOrigin]
 * @param {boolean} [opts.normalizeUrl]
 * @returns {Promise<void>}
 */
async function set$1 (url, key, value, opts) {
  await setupPromise$2;
  var origin = opts && opts.dontExtractOrigin ? url : await extractOrigin$1(url);
  if (!origin) return null
  if (opts && opts.normalizeUrl) origin = normalizeUrl$1(origin);
  return cbPromise(cb => {
    db$2.run(`
      INSERT OR REPLACE
        INTO sitedata (origin, key, value)
        VALUES (?, ?, ?)
    `, [origin, key, value], cb);
  })
}

/**
 * @param {string} url
 * @param {string} key
 * @returns {Promise<void>}
 */
async function clear (url, key) {
  await setupPromise$2;
  var origin = await extractOrigin$1(url);
  if (!origin) return null
  return cbPromise(cb => {
    db$2.run(`
      DELETE FROM sitedata WHERE origin = ? AND key = ?
    `, [origin, key], cb);
  })
}

/**
 * @param {string} url
 * @param {string} key
 * @param {Object} [opts]
 * @param {boolean} [opts.dontExtractOrigin]
 * @param {boolean} [opts.normalizeUrl]
 * @returns {Promise<string>}
 */
async function get$3 (url, key, opts) {
  await setupPromise$2;
  var origin = opts && opts.dontExtractOrigin ? url : await extractOrigin$1(url);
  if (!origin) return null
  if (opts && opts.normalizeUrl) origin = normalizeUrl$1(origin);
  return cbPromise(cb => {
    db$2.get(`SELECT value FROM sitedata WHERE origin = ? AND key = ?`, [origin, key], (err, res) => {
      if (err) return cb(err)
      cb(null, res && res.value);
    });
  })
}

/**
 * @param {string} url
 * @param {string} key
 * @returns {Promise<string>}
 */
function getPermission (url, key) {
  return get$3(url, 'perm:' + key)
}

/**
 * @param {string} url
 * @returns {Promise<Object>}
 */
async function getPermissions (url) {
  await setupPromise$2;
  var origin = await extractOrigin$1(url);
  if (!origin) return null
  return cbPromise(cb => {
    db$2.all(`SELECT key, value FROM sitedata WHERE origin = ? AND key LIKE 'perm:%'`, [origin], (err, rows) => {
      if (err) return cb(err)

      // convert to a dictionary
      // TODO - pull defaults from browser settings
      var perms = { /* js: true */ };
      if (rows) rows.forEach(row => { perms[row.key.slice('5')] = row.value; });
      cb(null, perms);
    });
  })
}

/**
 * @param {string} url
 * @returns {Promise<Array<string>>}
 */
async function getNetworkPermissions (url) {
  await setupPromise$2;
  var origin = await extractOrigin$1(url);
  if (!origin) return null
  return cbPromise(cb => {
    db$2.all(`SELECT key, value FROM sitedata WHERE origin = ? AND key LIKE 'perm:network:%'`, [origin], (err, rows) => {
      if (err) return cb(err)

      // convert to array
      var origins = /** @type string[] */([]);
      if (rows) {
        rows.forEach(row => {
          if (row.value) origins.push(row.key.split(':').pop());
        });
      }
      cb(null, origins);
    });
  })
}

/**
 * @param {string} url
 * @param {string} key
 * @param {string | number} value
 * @returns {Promise<void>}
 */
function setPermission (url, key, value) {
  value = value ? 1 : 0;
  return set$1(url, 'perm:' + key, value)
}

/**
 * @param {string} url
 * @param {string} key
 * @returns {Promise<void>}
 */
function clearPermission (url, key) {
  return clear(url, 'perm:' + key)
}

/**
 * @param {string} key
 * @returns {Promise<void>}
 */
async function clearPermissionAllOrigins (key) {
  await setupPromise$2;
  key = 'perm:' + key;
  return cbPromise(cb => {
    db$2.run(`
      DELETE FROM sitedata WHERE key = ?
    `, [key], cb);
  })
}

const WEBAPI$1 = {
  get: get$3,
  set: set$1,
  getPermissions,
  getPermission,
  setPermission,
  clearPermission,
  clearPermissionAllOrigins
};

// internal methods
// =

/**
 * @param {string} originURL
 * @returns {Promise<string>}
 */
async function extractOrigin$1 (originURL) {
  var urlp = parseDriveUrl(originURL);
  if (!urlp || !urlp.host || !urlp.protocol) return
  return (urlp.protocol + urlp.host + (urlp.port ? `:${urlp.port}` : ''))
}

/**
 * @param {string} originURL
 * @returns {string}
 */
function normalizeUrl$1 (originURL) {
  try {
    var urlp = new URL(originURL);
    return (urlp.protocol + '//' + urlp.hostname + (urlp.port ? `:${urlp.port}` : '') + urlp.pathname).replace(/([/]$)/g, '')
  } catch (e) {}
  return originURL
}

migrations$2 = [
  // version 1
  // - includes favicons for default bookmarks
  function (cb) {
    db$2.exec(`
      CREATE TABLE sitedata(
        origin NOT NULL,
        key NOT NULL,
        value
      );
      CREATE UNIQUE INDEX sitedata_origin_key ON sitedata (origin, key);
      INSERT OR REPLACE INTO "sitedata" VALUES('https:duckduckgo.com','favicon','data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAQ3klEQVR4Xr1bC3BU13n+zr2rlZaHIskRFGzwLtJKQjwsBfMIxkHiEQkBZkWhCS0v0ThpQlqkjt1xGnssOVN7OvUE0TymcZIiXKeljSdakHnIULN262ZIGyNjENKupF3eIAxaSQhJu3vP6Zx79+7efWnvIpEzo9HOPf/5z/9/5///85//nkvwB2hXt+SXiRQlFORJgaFEnZIRlPHfhMGhPqMEbQLYZUlA26x3u0LPH5WY5FEwvmkrMjMhYAMjm1QlH3YeGRzCjhBqsM+wd3gelk+icRMKwDWbdbckSvtEJoZWeSIFlojUJkrigSfsrqaJ4jtuANw2c5ZBMNYSxvYByEogmIMR8iGhzMPAPAEE2ix2j1dLK/OBoYSAmJlAzISxlYDiInGalxFyIEB9jdF8UgVmXADwFQehrwKCOWpiLwi1C1Q8MtPutKt9qpKy3wsoYRBkwAiol1G08d/R4NywFdioIG0CE2yxAFMPmNAwHot4KADctiKzSKSDJGqFCBSB/PDb+cpwujQhYGPASsIYVzgaqLgLxvkwQtoI8KGfGuwWe4eHg5eGNBsHPJoPAxwSE2s43SO3gCu2Ahsh7KB2NbjAlAkNs4O+ecVm3c2ItE/AxMQCCqmNMPGAlr8QC4SXMVIzW2NxesBIyQKu2grqAfZqBGOBNHBf5M8MMNYCY8YCPTKNReMFyIEAgvMJxlrQKHlAGmbZnfV6J9INwBVb3kFA2B3awyG1iRBrnrC72rhVANL+OLFArxwp0lEPINbx1b5ms5ZI4O6otTbaNNveXaOHqS4AopWnYHaGgDwBgeGgAMID1B+8jS2HPhCSAhCtPKAw5shT4IwaCySjCZMKFiJj/pIQEIHe6+B/oxfOPkpwvAJQrlhipJWqso41+ZgAXLZZ9xOgNsxAUZ4HOQA8EIZaX8ESsK9shuXZNcjMzIyZc/TC7zB05jd4cPY02NDAowCkhgfJWFdF45N2V12iCRMCIEdyplWSNj15RFE+8rnCmltAVsWfgK3cjJz8uQkVpEMD6D/8Iwy2HJpwEAiBDMLlTZGWoD6PN2FcAPj+LQSkcxDVzG5s5Tnjwe+8iRlPrwjNYTKZwP8SNZ/7Enpf3gEOyES2uCBI8FKDWBovT4gLwJWN1jNMCKahTGqjAi0H0swCw7lEwnIXMN6/F+oempEv/55S+gz+aNEKZM14PGYojw+36jZNOAiUoBTwewQqnAFRdgdC4Zjd4iqPFiIGALfNuptoTJ8FmZFAmjtsEcnXbMqqzTAtXSMHRWFybEzQcuDWMPTBb3D/g+aJAUOClxn8Fr5oRLNojKDGEnWQigCAp5vEbwwpyoAGy1FnvWej9QwISXQwiUAjbdFKTPuLV2GYFrviyWDj7nD7+zvgc3ckI03ez5jD3OIqdz9XUE8AJXnjwKT5LNoDVCQAEcSSx3ys2+LeaN1NCImI+Akj6vYXMXvrN5ILNwaFAsJOcKsYb2OM1VhaXE2e9XluiKJ8DlEXVeUdAoCvvuQ3ukU18DFUQ/Q5Ip6NIdGDyp0o/vb3xyuzPJ7Hhhu1tnG7gyTBK6b5LJCMZSBolo0g+Ey1gjAAGwtrQdh+TkSBtryjzlJuPlDNZyzlZ+bjsfp/xvTp0ycEAM5koOUQ7v3i9YngJ7tx93MF5wQEy3GM1FlaOuXzSwiArvV5bjFoJmCsBqLfrnf1b63/FpZ986/HLeyhdy/gkvNzCGCo+fpTML2xRbaG8bSwFfCjtOLKkiR58o91W0IAuKusJUwk8hbHB1iPO7PdGwtrGRSLGKtJ6SbcfeFnWLp0qUx2+foAfnn4PC5f8SJzchqm507Gy3Xh/CARr08u9mLwvg85menw9g/D2XMPX5vuxp0DLyUTIWk/gbLirqqCPtXFicRKLcddvOYAdG/kKS+RU14G1pjX4qrjJkM0FdxEswxaFsD03TdgtVplkgMHP4H1ySxUrZqTVDA9BFe/sWrcVsCI4tLx9FQA0CjLkZGBCFpEMiE/f7oSWdu+GwLgv//vBlY8PTPZMN39d3/xOgaOjj9tjtZLBYXw6E8lY59q/gXHndndPCDqMH8+hgOQrQFAt2YJCAeHRnHkg3YUWnKxeP4T8nZ4bd9EnLZJXV5LZ6NT4waC6MsmXRsLbATKFgFQe15LV3UPT4WhL/HhAEzZ8i0UFxfHqMQVudE7gE2rijFz2tjZoDp4a9076HDfwYHvPQcOBh/r2bZ43FsiAXPMaXGVd2/MbwbkAivPCapJ94aIra4h7z1nffeGAqZ3JT9fXAlW8aehIKiO+/tfOvBOyzmsWpqHxfNnyf/1gLDApsTd7RtLkTk5A9/++jLc/NsdGP7sd3pFSkiX954zRl/SVZXfTAQFEQqh3GCAhwaoW+9sHIChZ20oL488Zyz/s5/KK8jNmCteZJkmK5WsqRYgB9TvPScD1/dvP0bfv/4o2dCk/YJBsAQCMAugvJADRqmddG2wnkHQ3CllpUQQs0iQIClHAA9m5uPqpr2oqqqKIN/3xlF8cLY79OzX+7ejyJKrhyX+98I1TJ2cHqLnANxLAIAhOwBDthTiO9KTnnAOBqGcUckrCMqWDzAH4QkQiJIn53MTWV9Yy4IZoR5paboJrj2vY9myZcjJyQkN4av/8j+2Bv14nuzLD9uiAeBKTyoeRoZlVP6vbXREwK2fT4PvZlrMdISRurxjnY1dqoszyUO61of9Pf+Yk7g2FNQTFjw96ZTY9eevo6h0EcxmXe89dHINk3nffQ2jn70lK5wxZxQcgLEaByCeJTCCBut7znqtzsSlAcAaBAApAnDNthc5S8qwcOHClJULDZD6wUbOA0MfhR6x4fPKM99lXXwDfQbceTcnrvIygyAAWp0nBIC7iyvhX70VK1YkT3ljNJH6QW++CNb3ji4l4xHx1e7/eCoetCcuwT1SAO5bFuDGuj0xgTCZRmygBfTaNwGpPxlpTD9f7aF2EwY+ngL+W1eLZwFOHgShBMEC7gI8COrMAtVJ/VNz4NnxSkwgHEsoNvRfoD0VuuRWiXiAG7pokleaK59q44ci67HORmfI7SUPca4Ll7skKlgMBpgZVfbJVJpn5yswf2lp6EyQbCztqQTT+LtK33f6C3IEN87wR7DgZj48xhaXbD45BAhCeSAAjygE8xzGHMRVld/MgqkhJ+D7JKDuk3rYKjQ3q/Zg8rI1WLRoka5B9PLXwF1A2wZ/Pxl3fh3eSnUxSolIyXPUBSagdtJZFU6FGSF1Rcc6Gzur9KfC6vz3llRi+CuxGWEi+XjQk/1f0/gK33hrWkoqceL0mX6M3ojd96MZFR53ko71hfw2i1rnaCCd6wpsar2MH4YKj3dVc7dgOqvA6iTDj+fjum0v1q5di7S05MLwcRyA6OjPQeBukMjcubLGGT5Z6Yw5I0gPugqPCbfe/mJC8AhjjoITrvLOqvBhCAzV5FJlkVkgau4veQpPdFtkq0gxF+AZYc/zsRlhsuUc/u12GEQ7BBONIdWCIGRQWelErfc/csBdKDECaCg87qzvXBcO+pQJFrkg0qF5KBClIEJZ6nHg8q5XYEkhEPJ5rv9gL+7/9jQmzxvGlHnDmFw8HBeMRIpxkO6dSmwx6rhYvSRP0YluFQDrfgRLYgBrLDrhqtOCkmwV1f7eNdtgfGZdzNF4rPFXX9qBB+cjj7qmOaMw5Y3CFDTxaOvgSg/3ZMhboh7fBxRlO9bF6ilbwKXKojJC1K1PIb5UlfqZoP+plehftVWOA3rbrR++hP7TwXqM3kEp0vEzwNzjznrtojImlM892eEIlcW1nRSoNqX7HKOjSqlMb+OB8Eb1Xrk2MNabYS2/z3/1Y9z91fjP+mPJmJ7uyx4eNZYJocqXssh8TAiAS5Wa7RDMUXzSVX6xsuCgAITuBekBoucv98u5gN6XJNz/r722Vw/rh6KhQNO8k86a9krrGRIu8zXMPalcpAoBcM5mzjING92MqHcChPKRjJG2yGfJZbi27QXMfPqZuDXCeKP5u0DnlsXJGT8EBWHwDpt8loyRjBIEizzqs9LgTdWIl6MdFdb9jATfDzC0Fbc6S9vXRSQOScW4+6wNhtWbUwqE7r02jPaM/2VotHA8sSs+0dnYXlFwjhDltRhhrLGoNXxlJgIAbgXpw0Y3VCvQMECQQTIE7s9dgjtrtqV0MrxnP4TbP5uQ94Bh8TQLCDXzY/COmnwWdfUjXEAdebGyqJ6w0OVDLyFEeVHCGK+jJboMHZrYlzsT17e9INcG4l2Wigeg//Z1dO1aHdM1miHgky9NxcX5UzDvwn18+X90H5vjys0IaZh3siPiEmXcKzLtFYVcWfXKe1txa2dp+1d5ykx07Vfuv/qhHAPUEtlPPm3AcOA+SnKXo3TacjyWEfsW+fLf7IzIB67OykDruscwkKmc9XN7fdjx9s1kBqj0M1Zd/L7THk+PaAZxAbi41loCQdDcB2JN81qdNRcri3aDyfeEx2y3/ngvvrh0ZahE9vzpyHM/B2LN7GoUZi/Eg8B9OPvOo+PjwzIAmQMB9Oam4dyi2BcpdW/qKI0RUjPvZEfTxYqCgwAJ72CUls475ZJvpGtbwmty7RW8MILw22GVsQ4QvEsrQNeGS2TRAKgCZItzMEp6ZRD0tKQAJJCRAHXFrcp9AN0AcMIYFHWC8GDOfPRuCJfIEgFw8y7DjMeSXlYNybz97ZuyK8RtCWVTrDcRwElnv7CWV4yE0AUpwkjNvFMdTTwmUMgXDmICYyAzB9drXg6VyCYKgC2Hb+OJqyPRungFsBru8xfXFu1mylX+YCygjvmnYq/G6XIBlehcmTlLMKafEcNBkW+mTfNbnTX8KO2jrDmiLziQA2BZpJTIXjv7HVwdDL8l4iQjPqBvMDUL2PPWdWT2h98JSECbUSDVc092eC5wn2dhn+d91DdaXuqI/DQnJRfQgpCWltastQTt5J99taieRH0ncGfDHkxdvlpOi9/8/Yvo7DsfMbfPD9y+R/F4rgBBULooBUqmLUfvlU9wa1LMSqP2H0JB0MtADix4v6M+7iIw6vD7/dXJlOdzJnUBrdQcZaZBGYCXEDTMb+1s5JaSlm7cr/b3L6uAr0wpkcUDYJJhCnxDuXDdVSwjLycPz8x6Bjuf2gHvqWa0//wVdOdPQo/VhGuzMuSVr3nrOghhTf5RXx1X7gIP1ErhJuSGvJ9bp56gmjIAfIA8KdXsDvJ7duogTGxYcLrDwYEwGDNqh2cV7bqz+XkzPxqfvPrvONrzL7JMXHG+Ba6ebZN/J2rOnavhu6VckCI04GFi2qGAb6SRK/7ZmqIyRqRXCcKxSaYTUMcXQ6/yDwUAH8TzhAAVDgpC+CtQ/pwDAUIOLHzfaW9ubs4yGo22FStW7PMbh0sOd/6TnASV5H55TMVV4fs/avVe+bt9TSKjh9T9+zxPxhjbF604pWgzCLQm3j6fDIyUXCCaGfd9Fu97QRrwQDTYufDF7zv5SxddGaSWP2PMIQhCOQdbIsIuSAEbBEPM53mEKLEgmaKJ+scFAGfKTV4UjfshaLIu7WwcDIiOzLW2LNOMWZ9mr9v6hbTc6XJSz5SPI0ONDfZlDX561jvq6TH3f3TMM+J2muMordBT1iRJSix4WOUf2gXiTahslxm1RPLvSij0eCSVlVZiAQ3GgvGym1AAtMKcX82TJGwikMpAYsw2NblZwMMgOgTgyML/DH+FmhqTxNTjdoFkgpyrLDKLEsoYg5lAkk2eQeAnzegM0ktA5cMKg/ghIfBIIhylJ1P/GjSZTNr+/wca6dPApxwOmgAAAABJRU5ErkJggg==');
      PRAGMA user_version = 1;
    `, cb);
  },
  // version 2
  // - more favicons for default bookmarks (removed)
  function (cb) {
    db$2.exec(`PRAGMA user_version = 2;`, cb);
  },
  // version 3
  // - more favicons for default bookmarks (removed)
  function (cb) {
    db$2.exec(`PRAGMA user_version = 3;`, cb);
  },
  // version 4
  // - more favicons for default bookmarks (removed)
  function (cb) {
    db$2.exec(`PRAGMA user_version = 4;`, cb);
  },
  // version 5
  // - more favicons for default bookmarks (removed)
  function (cb) {
    db$2.exec(`PRAGMA user_version = 5;`, cb);
  },
  // version 6
  // - more favicons (removed)
  function (cb) {
    db$2.exec(`PRAGMA user_version = 6;`, cb);
  },
  // version 7
  // - more favicons
  function (cb) {
    db$2.exec(`
      INSERT OR REPLACE INTO "sitedata" VALUES('https:beaker.network','favicon','data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACXklEQVQ4T6WTPWgTYRjH/88ladCI1RQKVScLDtl0UelSnZQWETFTsdQkipg7paWDupy3iILY4T76QVKjOJl2EqRTEXQoDgqCgoNCQFGwKLUfJrm795H3kisnddJ3ufde/u/v/T9fhP9cFLkv9yz/x8fPpRqN5G5mZYei+PFm0/1BlNqIx3/6jUaKenp61g3D8KQ2BGxeVtVCP4NvAzgcNUfAF4DfALQXoKuWVVqMAgKtqubyDCoR0AR4npneAXCJKMPgAQBd0iWB71jW7I3Wvr1UNd/HwAsCPggB1XHKC1EHmlY4Ihg2wIcIcIi2j5mm2QgAmqYlBa/PATTIhFOOWX4iz9Lpr0FOarWUUqlU6i0IL4BRY072OY6zFgCKxeEuUGIZwFPbKg/ouh4HIAzDEG0XNDIykpQQVS08YPCw8EXv5OT9j20H+YOC8YpApmWVrsjXpb1oCLqe7TCMarNYzF8H4RYLnJRhtgHnM4KVt2BM23b50t8A4Zmq5nQG3STQMcsqPQsAo6P5tOviG0DP19a8E9KqDCOsdTabjWUyiLUc5KogOut77r6pqYefA4AULy9/mgYhB6bLtl2aDJMrv6ZpNmXJNK1wRjDPE3gxkVgdnJio/tosY7F44QBIvAQQA9M111UezczMrLQcZrc1vM7TxHwXwB6F6Khplpa2dKKqFo4DXGUgTcASA+/B8EHYD6CfAI+Zh2x79nGY4C2trGkXe5n9MQaGAHS2hXUC5ohwzzTLr8PS/tGJkblgXdeVlZXazjqwK+F3xDwv9r27u3s1TGpbGzRZdBr/abB/AxcoGCCqR8KvAAAAAElFTkSuQmCC');
      INSERT OR REPLACE INTO "sitedata" VALUES('https:hyperdrive.network','favicon','data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAF4AAABeCAYAAACq0qNuAAAKNklEQVR4Xu2cDVBU1xXH/2fZRYS4KOyCiJ1o62QmHZM2Tmr9SCoZnbSZNu2IY0dFAYNB/EBLxFDECGo0RhFQ/EJB0gZsh7ZCMulYo2OcOHU0GJM2Mya1pn4kKp+uYARZdvd27rrg7rILu+89XHzcN864+7jn3Pt+7+y595x73iOIIyAEKCC9ik4hwAfICAR4AT5ABALUrbB4AT5ABALUrbB4AT5ABALUrbB4AT5ABALUrbB4AT5ABALUrbB4AT5ABALUrbB4NYJnjGkAhADQOq6P32jmdK38Mz/nfL7rHG/m/NkTInc53p+zfue/8882t3E4G563sXUCuEdEznpl365+s3jGWETexl1zvrl26bk7rS16c4eZGOz/NGBkB0Bg9v7t5x0n+Jeuv3Wf94zcBQQxxhjxG0xWroPr5vIEZmMgDe+sS7fXvohpgrU6W2hYKL4/dhxlZ6+wBQdrrwA4QET/lk3bSUG/gC8vLx9+9NjHq9rudiQCGA0HYPkDJwKYHTi3QMaguf+diAg2/r3r/652cvoMHjIEv/r1XFNSwosVANYS0R05+pxlFQefkVE19H9XDr/CmGYlGMY6uRmlxvyw9dieGv+jC2+++XougBqi+79WuYei4GfPZkEdHXN/CY1mLYGNZ4yGyh3gQJAnQtu0n718IiNjzutE9KUSY1IYfMJTHZ1sIxheAKBXYoADRYdOp20o2lP0l9HGERuIqEHuuBQDn5q6ylDX8O1qME0CQCMBBMkd3ACTtxmNUddLDxSWASgkolY541MEfG5ubvDnn19MAGleA9gTjCFYzqAGriyzTJk6/eus1SnFAMqI6J7UscoGzxdx8b9NmmQzWzYwYDKAMKmDeRTkdDqted/ewn8ZDBF5AI4SkVXKuGWDT0vLiL1R15gDZp1JRFH3l3jqPoxRxtbS/UXHAGQT0X+lXK0s8FVVVUPfPVS9mEBLCRjDGHRSBvEIylinTJ52PSsrtQTADiK66+81SAbP0wHx8QumW222XAKeYUCov50/yu11Om373j2FnxmNEesAnPA3pSAZfEpKxrjGpvo8IrzEGBvBo8dHGaT/Y2fMaIwylR4o+huA9UR03R8dkmCVlJSE//3IR+lgmlcBjFJBdOoPs+62ROj86aRpl7OzUvMBvENEPKHm0+E3eMaYNn524kyrxfZ7MPZDR/bRp87U2Eir1d7Zvavg9MiRkWuI6Lyv1+g3+MRFK5++3dS4QY3Rqa/QnNvxpFykwVBfdmDHOwDeJqIWX/T4BT4/P99w6tS5TAaar9Lo1Bdmntrcmzjx+Qs5a9I2Anjfl0Saz+AZY8Hxsxck2DptmQz4AYAhUkepPjnGdFqdaffuwqPR0RE5RHS5r2v0CTyPTlNTV06ub2zKA8MUtUenfUHz8neLwRD5TVnpTp5O2EdE7b3p8Ql8TkFB7Bcfnx9U0akU+AS0Pfvs87Vr16blADjd29q+T/CMsaGzZs1fbLFiGRF7fBBFpxLYM6bVaRuKd2yvGjXKuJGIGr0p6RU8j06TU5bNMDXfXjcYo1MJ5HkY2RkRGXHxYGnxFgB/JiKLJz29gs/dvP+Jz86e5CHxzwEWOfiiUyno7SUTdyZMmHRi3bp0vra/4Bf4M2fO6Ldu3b3CYrUO6uhUGnpYg4K0N4p35pfExhqLPCXRPFo8Yyxo4aL0+FvNJhGdSiTPa3EiIyLPHzy4cy2Ak+4TrUfwmzYV/vhsbW0eAXGMMb1wMVLo28tOmif85JlDuTmZeURkcol43VXW1dVFrV+/NSs6OnbOtBnTo58c972gqKgRvHJFSu+DToYX+zQ0mPDV19/i5LHj5ps3b17YuvWtbL1ey3eruouwXGjyBBiAJACrAHtNDC+/E4c8AtzSDwHgE233Brk7eJ4K4CnOGQAek9efkHYQ6ADwBYDXiOhUF5Vu8PbKQ+BlANsAjAPUv3f6EE2jjqcRAGwhIn4jHrzLwAF+JYA3AEQ8xEENhq543oZb+/KuzXFni+cFSLw+cAWA8Le3leHK5S/R2tqKtrY22GyKVimrFrZGQwgNDYVer8eYsU8ia3UKv1ZeAnLNwbeCT7LO4HkR0lsNDS2vZK95Y3hTU7Nq4TzMCzMYIrF5Ux6ioyN4JUI5gNW8EMoZ/JDGRtP2pct+l2Q2W8TEquDd0el0KN5ZaI6JGXEcwEJee+kMPiTl1fTC5qbmJLVU+SrITrYqo8FgKy3dcRrAAiK60g2+vLw8pKbmeBEDmy82OmRz9qTAOmXyC7VZWYsS+QTbDT49PX3I1Wu3iojYXMYQ3i9dD2KlfFM8Jibm3N49+fNdwCcnJ4eYTJ3C4vvJODj4sLCwc5UV+7mrudht8XHJySHhps4ikC1R+Hjl6XPwBKqtrq7g4B+4mri45JDwcA6eJTAm0gXKo4eVCJ/WVFe6WXxccoh+uKWAYJsnfLzy2O1PIwKfvlddyX28k6vh4MM7CwG2QK2rGr1+GKZOeREzZ8bBamWo+uuH+OTsCdy929YnaTmy9twM8YebqbamuoKvanqCJ7Kpch0/dszjKCzc1GNfwWy2YPny1ahv8P48mRzZ7mzkA/CDx8dza/3jH/Z63czh8JMXLvFo+XJknX9Gvbqa8PDO7Y7JVVXr+Jd+MQtpafG9upOinX/CRyc+6NFGjqw7eIerSSKi/zxYTjpWNWqMXPeXFPMkVa/gb9xoxpKlPDHresiR9QLeg4+3r2qsyWpbx/sCr77+FlIXp0sC7022h6th+OS9mkpu8a6Tq30dDzaPAcP6nOYfoQa+uIt9+w7jyD/4UzWuhxxZPy1efev4viZIXhmQmLQEra09X84hR7YneJzzHkAxW5Ian+DztiTk0DMycnD5ylWvv2E5sq7LSS/gHa5mgRrBcwDOQRD/Xl19Ev88/aFHS3e/C3Jk3QKonut4HrkSWILafPxAmI6cIleeMrjkspx0pAzmqe2VJwMHPM7WVFfOc9mB4mlhvclu8YlqdTWBvAH2tDBpTlUffpeDv9Ft8Xwj5JYA35/3xjrssWFHKir28XX8LU/ghY/vH/zmUbGj3t+7exuvMvjOZbO7uuY4TwsLH98P4Ilgfm7qjMrMzIVL3etqQhYtWl7U1GRS7XKyH3j6rNIQaWgvK7M//Z3B6yddCprq6u5uTl+xdKHZbBnhs0bRsE8C9wuaCtpiYiL4+8wyicjsXjs5q76+ecmanA1PNzc3DROPVvbJtM8GjhI+Fh0dcRvALgD8McxO9/p4/p7IiQBmb9lWOv3q5a9Gt7S0hLW3t5MoWu2Tsb2Bl6JVXi3MX5G7CcAHLkWrXWod5doGAL8BwKvKxvPq4cH6ThrfcPfaygzgEoD9jjf3fWdPISigWKiQQECAlwBNCREBXgmKEnQI8BKgKSEiwCtBUYIOAV4CNCVEBHglKErQIcBLgKaEiACvBEUJOgR4CdCUEBHglaAoQYcALwGaEiICvBIUJegQ4CVAU0JEgFeCogQdArwEaEqI/B9G/wubKQ/89wAAAABJRU5ErkJggg==');
      PRAGMA user_version = 7;
   `, cb);
  }
];

var sitedata = /*#__PURE__*/Object.freeze({
  __proto__: null,
  setup: setup$6,
  set: set$1,
  clear: clear,
  get: get$3,
  getPermission: getPermission,
  getPermissions: getPermissions,
  getNetworkPermissions: getNetworkPermissions,
  setPermission: setPermission,
  clearPermission: clearPermission,
  clearPermissionAllOrigins: clearPermissionAllOrigins,
  WEBAPI: WEBAPI$1
});

// constants
// =

const ASSET_PATH_REGEX = /^\/?(favicon|thumb|cover).(jpg|jpeg|png|ico)$/i;
const IDEAL_FAVICON_SIZE = 64;

// typedefs
// =

/**
 * @typedef {import('./daemon').DaemonHyperdrive} DaemonHyperdrive
 */

// globals
// =

var events$4 = new EventEmitter__default();

// exported api
// =

const on$4 = events$4.on.bind(events$4);

const addListener$1 = events$4.addListener.bind(events$4);
const removeListener$2 = events$4.removeListener.bind(events$4);

/**
 * @description
 * Crawl the given site for assets.
 *
 * @param {DaemonHyperdrive} drive - site to crawl.
 * @param {string[]?} filenames - which files to check.
 * @returns {Promise<void>}
 */
async function update (drive, filenames = null) {
  // list target assets
  if (!filenames) {
    filenames = await drive.pda.readdir('/');
  }
  filenames = filenames.filter(v => ASSET_PATH_REGEX.test(v));

  // read and cache each asset
  for (let filename of filenames) {
    try {
      let assetType = extractAssetType(filename);
      var dataUrl = await readAsset(drive, filename);
      await set$1(drive.url, assetType, dataUrl);
      events$4.emit(`update:${assetType}:${drive.url}`);
    } catch (e) {
      console.log('Failed to update asset', filename, e);
    }
  }
}

/**
 * @description
 * Check the drive history for changes to an asset
 * 
 * @param {DaemonHyperdrive} drive 
 * @param {Number} startVersion 
 * @returns {Promise<Boolean>}
 */
async function hasUpdates (drive, startVersion = 0) {
  var changes = await drive.pda.diff(startVersion, '/');
  for (let change of changes) {
    if (ASSET_PATH_REGEX.test(change.name)) {
      return true
    }
  }
  return false
}

// internal
// =

/**
 * Extract the asset type from the pathname
 * @param {string} pathname
 * @returns string
 */
function extractAssetType (pathname) {
  if (/cover/.test(pathname)) return 'cover'
  if (/thumb/.test(pathname)) return 'thumb'
  return 'favicon'
}

/**
 * Reads the asset file as a dataurl
 * - Converts any .ico to .png
 * @param {DaemonHyperdrive} drive
 * @param {string} pathname
 * @returns string The asset as a data URL
 */
async function readAsset (drive, pathname) {
  if (pathname.endsWith('.ico')) {
    let data = await drive.pda.readFile(pathname, 'binary');
    // select the best-fitting size
    let images = await ICO.parse(data, 'image/png');
    let image = images[0];
    for (let i = 1; i < images.length; i++) {
      if (Math.abs(images[i].width - IDEAL_FAVICON_SIZE) < Math.abs(image.width - IDEAL_FAVICON_SIZE)) {
        image = images[i];
      }
    }
    let buf = Buffer.from(image.buffer);
    return `data:image/png;base64,${buf.toString('base64')}`
  } else {
    let data = await drive.pda.readFile(pathname, 'base64');
    return `data:${mime.lookup(pathname)};base64,${data}`
  }
}

var assets = /*#__PURE__*/Object.freeze({
  __proto__: null,
  on: on$4,
  addListener: addListener$1,
  removeListener: removeListener$2,
  update: update,
  hasUpdates: hasUpdates
});

const logger$4 = child({category: 'hyper', subcategory: 'trash-collector'});

// typedefs
// =

/**
 * @typedef {Object} CollectResult
 * @prop {number} totalBytes
 * @prop {number} totalItems
 *
 * @typedef {Object} TrashItem
 * @prop {string} name
 * @prop {Object} stat
 */

// globals
// =

var nextGCTimeout;

// exported API
// =

function setup$7 () {
  schedule(TRASH_FIRST_COLLECT_WAIT);
}

/**
 * @param {Object} [opts]
 * @param {number} [opts.olderThan]
 * @returns {Promise<CollectResult>}
 */
async function collect ({olderThan} = {}) {
  return // TODO
  // logger.silly('Running GC')
  // olderThan = typeof olderThan === 'number' ? olderThan : TRASH_EXPIRATION_AGE

  // // clear any scheduled GC
  // if (nextGCTimeout) {
  //   clearTimeout(nextGCTimeout)
  //   nextGCTimeout = null
  // }

  // // run the GC
  // var totalBytes = 0
  // var startTime = Date.now()

  // // clear items in trash
  // var trashItems = await query({olderThan})
  // if (trashItems.length) {
  //   logger.info(`Deleting ${trashItems.length} items in trash`)
  //   logger.silly('Items:', {urls: trashItems.map(a => a.name)})
  // }
  // for (let item of trashItems) {
  //   let path = joinPath(PATHS.TRASH, item.name)
  //   if (item.stat.mount) {
  //     await filesystem.get().pda.unmount(path)
  //   } else if (item.stat.isDirectory()) {
  //     await filesystem.get().pda.rmdir(path, {recursive: true})
  //   } else {
  //     await filesystem.get().pda.unlink(path)
  //   }
  //   totalBytes += item.stat.size
  // }

  // // clear cached dats
  // // TODO
  // // fetch all drive metas with lastaccesstime older than DAT_CACHE_TIME
  // // then delete the drive
  // {
  //   // await datLibrary.removeFromTrash(trashItems[i].key)
  //   // totalBytes += await archivesDb.deleteArchive(trashItems[i].key)
  // }

  // logger.silly(`GC completed in ${Date.now() - startTime} ms`)

  // // schedule the next GC
  // schedule(TRASH_REGULAR_COLLECT_WAIT)
  // logger.silly(`Scheduling next run to happen in ${ms(TRASH_REGULAR_COLLECT_WAIT)}`)

  // // return stats
  // return {totalBytes, totalItems: trashItems.length}
}

// helpers
// =

/**
 * @param {number} time
 */
function schedule (time) {
  nextGCTimeout = setTimeout(collect, time);
  nextGCTimeout.unref();
}

var errorPageCSS = `
* {
  box-sizing: border-box;
}
a {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}
body {
  background: #fff;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, system-ui, "Segoe UI", Ubuntu, Cantarell, "Oxygen Sans", "Helvetica Neue", sans-serif;
}
.btn {
  display: inline-block;
  cursor: pointer;
  color: #777;
  border-radius: 2px;
  background: #fafafa;
  border: 1px solid #ddd;
  font-size: 12px;
  font-weight: 500;
  height: 25px;
  line-height: 2;
  padding: 0 8px;
  letter-spacing: .2px;
  height: 26px;
  font-weight: 400;
}
.btn * {
  cursor: pointer;
  line-height: 25px;
  vertical-align: baseline;
  display: inline-block;
}
.btn:focus {
  outline-color: #007aff;
}
.btn:hover {
  text-decoration: none;
  background: #f0f0f0;
}
.btn.disabled,
.btn:disabled {
  cursor: default;
  color: #999999;
  border: 1px solid #ccc;
  box-shadow: none;
}
.btn.disabled .spinner,
.btn:disabled .spinner {
  color: #aaa;
}
.btn.primary {
  -webkit-font-smoothing: antialiased;
  font-weight: 800;
  background: #007aff;
  color: #fff;
  border: none;
  transition: background .1s ease;
}
.btn.primary:hover {
  background: #0074f2;
}
a.btn span {
  vertical-align: baseline;
}
.btn.big {
  font-size: 18px;
  height: auto;
  padding: 0px 12px;
}
a.link {
  color: blue;
  text-decoration: underline;
}
.right {
  float: right;
}
.icon-wrapper {
  vertical-align: top;
  width: 70px;
  font-size: 50px;
  display: inline-block;
  color: #555;

  i {
    margin-top: -3px;
  }
}
.error-wrapper {
  display: inline-block;
  width: 80%;
}
div.error-page-content {
  max-width: 650px;
  margin: auto;
  transform: translateX(-20px);
  margin-top: 30vh;
  color: #777;
  font-size: 14px;
}
div.error-page-content .description {

  p {
    margin: 20px 0;
  }
}
div.error-page-content i {
  margin-right: 5px;
}
h1 {
  margin: 0;
  color: #333;
  font-weight: 400;
  font-size: 22px;
}
p.big {
  font-size: 18px;
}
.icon {
  float: right;
}
li {
  margin-bottom: 0.5em;
}
li:last-child {
  margin: 0;
}
.footer {
  font-size: 14px;
  color: #777;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: 30px;
  padding-top: 10px;
  border-top: 1px solid #ddd;
}
`;

/**
 * Generate an error page HTML
 * @param {Object} e
 * @param {string} e.resource
 * @param {number} e.errorCode
 * @param {string} e.errorDescription
 * @param {string} e.errorInfo
 * @param {string} e.title
 * @param {string} e.validatedURL
 * @returns {string}
 */
function errorPage (e) {
  var title = 'This site can’t be reached';
  var info = '';
  var icon = 'fa-exclamation-circle';
  var button = '<a class="btn right" href="javascript:window.location.reload()">Try again</a>';
  var errorDescription;

  if (typeof e === 'object') {
    errorDescription = e.errorDescription || '';
    info = e.errorInfo || '';
    // remove trailing slash
    var origin = e.validatedURL.slice(0, e.validatedURL.length - 1);

    // strip protocol
    if (origin.startsWith('https://')) {
      origin = origin.slice(8);
    } else if (origin.startsWith('http://')) {
      origin = origin.slice(7);
    }

    switch (e.errorCode) {
      case -106:
        title = 'No internet connection';
        info = `<p>Your computer is not connected to the internet.</p><p>Try:</p><ul><li>Resetting your Wi-Fi connection<li>Checking your router and modem.</li></ul>`;
        break
      case -105:
        icon = 'fa-frown-o';
        info = `<p>Couldn’t resolve the DNS address for <strong>${origin}</strong></p>`;
        break
      case 404:
        icon = 'fa-frown-o';
        title = e.title || 'Page Not Found';
        info = `<p>${e.errorInfo}</p>`;
        break
      case -501:
        title = 'Your connection is not secure';
        info = `<p>Wallets cannot establish a secure connection to the server for <strong>${origin}</strong>.</p>`;
        icon = 'fa-close warning';
        button = '<a class="btn right" href="javascript:window.history.back()">Go back</a>';
        break
      case 504:
        icon = 'fa-share-alt';
        title = `Wallets is unable to access this ${e.resource} right now.`;
        errorDescription = `The p2p ${e.resource} was not reachable on the network.`;
        break
    }
  } else {
    errorDescription = e;
  }

  return `
    <html>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      </head>
      <body>
        <style>${errorPageCSS}</style>
        <link rel="stylesheet" href="wallets://assets/font-awesome.css">
        <div class="error-page-content">
          <div class="icon-wrapper"><i class="fa ${icon}"></i></div>

          <div class="error-wrapper">
            <h1>${title}</h1>
            <div class="description">
              ${info}
            </div>
            <div class="footer">
              ${errorDescription}
              ${button}
            </div>
          </div>
        </div>
      </body>
    </html>`.replace(/\n/g, '')
}

const ZOOM_STEP = 0.5;

// exported api
// =

async function setZoomFromSitedata (view, origin) {
  if (view.panes) view = view.activePane;

  // load zoom from sitedata
  origin = origin || view.origin;
  if (!origin) return

  var v = await get$3(origin, 'zoom');
  view.zoom = +v || (await get$1('default_zoom'));
  view.emitUpdateState();
  view.webContents.setZoomLevel(view.zoom);
}

function setZoom (view, z) {
  if (view.panes) view = view.activePane;

  // clamp
  if (z > 4.5) z = 4.5;
  if (z < -3) z = -3;

  // update
  view.zoom = z;
  view.webContents.setZoomLevel(view.zoom);
  view.emitUpdateState();

  // persist to sitedata
  var origin = view.origin;
  if (!origin) return
  set$1(view.url, 'zoom', view.zoom);

  // update all pages at the origin
  getAll$1(view.browserWindow).forEach(v => {
    if (v !== view && v.origin === origin) {
      v.zoom = z;
    }
  });
}

function zoomIn (view) {
  if (view.panes) view = view.activePane;
  setZoom(view, view.zoom + ZOOM_STEP);
}

function zoomOut (view) {
  if (view.panes) view = view.activePane;
  setZoom(view, view.zoom - ZOOM_STEP);
}

function zoomReset (view) {
  if (view.panes) view = view.activePane;
  setZoom(view, 0);
}

var overlayRPCManifest = {
  set: 'promise'
};

/**
 * Overlay
 *
 * NOTES
 * - There can only ever be one overlay for a given browser window
 * - Overlay views are created with each browser window and then shown/hidden as needed
 */

// globals
// =

var views = {}; // map of {[parentWindow.id] => BrowserView}

// exported api
// =

function setup$8 (parentWindow) {
  var view = views[parentWindow.id] = new electron.BrowserView({
    webPreferences: {
      defaultEncoding: 'utf-8'
    }
  });
  view.webContents.loadFile(path__default.join(__dirname, 'fg', 'overlay', 'index.html'));
}

function destroy (parentWindow) {
  if (get$4(parentWindow)) {
    get$4(parentWindow).webContents.destroy();
    delete views[parentWindow.id];
  }
}

function get$4 (parentWindow) {
  return views[parentWindow.id]
}

function reposition (parentWindow) {
  // noop
}

function show (parentWindow) {
  var view = get$4(parentWindow);
  if (view) {
    parentWindow.addBrowserView(view);
  }
}

function hide (parentWindow) {
  var view = get$4(parentWindow);
  if (view) {
    parentWindow.removeBrowserView(view);
  }
}

function set$2 (parentWindow, opts) {
  var view = get$4(parentWindow);
  if (view) {
    if (opts) {
      show(parentWindow);
      view.setBounds(opts.bounds);
      view.webContents.executeJavaScript(`set(${JSON.stringify(opts)}); undefined`);
    } else { 
      hide(parentWindow);
      view.webContents.executeJavaScript(`set({}); undefined`);
    }
  }
} 
// rpc api
// =

rpc.exportAPI('background-process-overlay', overlayRPCManifest, {
  async set (opts) {
    set$2(getParentWindow(this.sender), opts);
  }
});

// internal methods
// =

function getParentWindow (sender) {
  var win = electron.BrowserWindow.fromWebContents(sender);
  if (win) return win
  throw new Error('Parent window not found')
}

var overlaySubwindow = /*#__PURE__*/Object.freeze({
  __proto__: null,
  setup: setup$8,
  destroy: destroy,
  get: get$4,
  reposition: reposition,
  show: show,
  hide: hide,
  set: set$2
});

function defaultBrowsingSessionState () {
  return {
    windows: [ defaultWindowState() ],
    cleanExit: true
  }
}

function defaultWindowState () {
  // HACK
  // for some reason, electron.screen comes back null sometimes
  // not sure why, shouldn't be happening
  // check for existence for now, see #690
  // -prf
  const screen = require('electron').screen;
  var bounds = screen ? screen.getPrimaryDisplay().bounds : {width: 800, height: 600};
  var width = Math.max(800, Math.min(1800, bounds.width - 50));
  var height = Math.max(600, Math.min(1200, bounds.height - 50));
  var minWidth = 400;
  var minHeight = 300;
  return {
    x: (bounds.width - width) / 2,
    y: (bounds.height - height) / 2,
    width,
    height,
    minWidth,
    minHeight,
    pages: defaultPageState(),
    isAlwaysOnTop: false,
    isShellInterfaceHidden: false,
    isSidebarHidden: false
  }
}

function defaultPageState () {
  return []
}

const SNAPSHOT_PATH = 'shell-window-state.json';
var lastRecordedPositioning = {};

// exported api
// =

class SessionWatcher {
  static get emptySnapshot () {
    return {
      windows: [],
      backgroundTabs: [],
      // We set this to false by default and clean this up when the session
      // exits. If we ever open up a snapshot and this isn't cleaned up assume
      // there was a crash
      cleanExit: false
    }
  }

  constructor (userDataDir) {
    this.userDataDir = userDataDir;
    this.snapshot = SessionWatcher.emptySnapshot;
    this.closedWindowStates = [];
    this.recording = true;
    this.watchers = {};
  }

  startRecording () { this.recording = true; }
  stopRecording () { this.recording = false; }

  updateBackgroundTabs (tabs) {
    this.snapshot.backgroundTabs = tabs.map(tab => tab.getSessionSnapshot());
    this.writeSnapshot();
  }

  watchWindow (win, initialState) {
    const winId = win.id;
    let state = initialState;
    this.snapshot.windows.push(state);
    let watcher = new WindowWatcher(win, initialState);
    this.watchers[winId] = watcher;

    watcher.on('change', (nextState) => {
      if (this.recording) {
        let { windows } = this.snapshot;
        let i = windows.indexOf(state);
        if (i === -1) return
        state = windows[i] = nextState;
        this.writeSnapshot();
      }
    });

    watcher.on('remove', () => {
      if (this.recording) {
        let i = this.snapshot.windows.indexOf(state);
        this.snapshot.windows.splice(i, 1);
        this.writeSnapshot();
        this.closedWindowStates.push(state);
      }
      delete this.watchers[winId];
      watcher.removeAllListeners();
    });
  }

  exit () {
    this.snapshot.cleanExit = true;
    this.writeSnapshot();
  }

  writeSnapshot () {
    this.userDataDir.write(SNAPSHOT_PATH, this.snapshot, { atomic: true });
  }

  getState (winId) {
    if (winId && typeof winId === 'object') {
      // window object
      winId = winId.id;
    }
    return this.watchers[winId].snapshot
  }

  updateState (winId, state) {
    if (winId && typeof winId === 'object') {
      // window object
      winId = winId.id;
    }
    return this.watchers[winId].update(state)
  }

  getBackgroundTabsState () {
    return this.snapshot.backgroundTabs || []
  }

  popLastClosedWindow () {
    return this.closedWindowStates.pop()
  }
}

function getLastRecordedPositioning () {
  return lastRecordedPositioning
}

// internal methods
// =

class WindowWatcher extends EventEmitter__default {
  constructor (win, initialState) {
    super();
    this.handleClosed = this.handleClosed.bind(this);
    this.handlePagesUpdated = this.handlePagesUpdated.bind(this);
    this.handlePositionChange = this.handlePositionChange.bind(this);
    this.handleAlwaysOnTopChanged = this.handleAlwaysOnTopChanged.bind(this);

    // right now this class trusts that the initial state is correctly formed by this point
    this.snapshot = JSON.parse(JSON.stringify(initialState));
    this.winId = win.id;
    win.on('closed', this.handleClosed);
    win.on('resize', debounce(this.handlePositionChange, 1000));
    win.on('moved', this.handlePositionChange);
    win.on('always-on-top-changed', this.handleAlwaysOnTopChanged);
    win.on('custom-pages-updated', this.handlePagesUpdated);
  }

  getWindow () {
    return electron.BrowserWindow.fromId(this.winId)
  }

  update (state) {
    for (let k in state) {
      this.snapshot[k] = state[k];
    }
    this.emit('change', this.snapshot);
  }

  // handlers

  handleClosed () {
    var win = electron.BrowserWindow.fromId(this.winId);
    if (win) win.removeListener('custom-pages-updated', this.handlePagesUpdated);
    this.emit('remove');
  }

  handlePagesUpdated (pages) {
    if (_isEqual(pages, this.snapshot.pages)) return
    this.snapshot.pages = (pages && pages.length) ? pages : defaultPageState();
    this.emit('change', this.snapshot);
  }

  handlePositionChange () {
    lastRecordedPositioning = this.getWindow().getBounds();
    Object.assign(this.snapshot, lastRecordedPositioning);
    this.emit('change', this.snapshot);
  }

  handleAlwaysOnTopChanged (e, isAlwaysOnTop) {
    this.snapshot.isAlwaysOnTop = isAlwaysOnTop;
    this.emit('change', this.snapshot);
  }
}

/*
The webviews that run untrusted content, by default, will handle all key press events.
The webview handlers take precedence over the browser keybindings (which are done in the window-menu).
To avoid that, we listen to the window webContents' 'before-input-event' and handle the commands manually.
*/

const IS_DARWIN = process.platform === 'darwin';
const registeredKBs = {}; // map of [window.id] => keybindings

// exported api
// =

function registerGlobalKeybinding (win, accelerator, callback) {
  // sanity checks
  checkAccelerator(accelerator);

  // add the keybinding
  registeredKBs[win.id] = registeredKBs[win.id] || [];
  registeredKBs[win.id].push({
    eventStamp: keyboardeventFromElectronAccelerator.toKeyEvent(accelerator),
    callback,
    enabled: true
  });
}

// event handler for global shortcuts
function createGlobalKeybindingsHandler (win) {
  return (e, input) => {
    if (input.type === 'keyUp') return
    var event = normalizeEvent(input);
    for (let {eventStamp, callback} of (registeredKBs[win.id] || [])) {
      if (equals(eventStamp, event)) {
        callback();
        return
      }
    }
  }
}

// event handler, manually run any events that match the window-menu's shortcuts and which are marked as 'reserved'
// this is used, for instance, to reserve "Cmd/Ctrl + T" so that an app cannot pre-empt it
// (the window-menu's accelerators are typically handled *after* the active view's input handlers)
function createKeybindingProtectionsHandler (win) {
  const KEYBINDINGS = extractKeybindings(buildWindowMenu({win}));
  return (e, input) => {
    if (input.type !== 'keyDown') return
    var key = input.key;
    if (key === 'Dead') key = 'i'; // not... really sure what 'Dead' is about -prf
    if (key === '=') key = '+'; // let's not differentiate the shift (see #1155) -prf
    var match;
    for (var kb of KEYBINDINGS) {
      if (key === kb.binding.key) {
        if (kb.binding.control && !input.control) continue
        if (kb.binding.cmd && !input.meta) continue
        if (kb.binding.shift && !input.shift) continue
        if (kb.binding.alt && !input.alt) continue
        match = kb;
      }
    }
    if (match) {
      e.preventDefault();
      triggerMenuItemById(match.menuLabel, match.id);
    }
  }
}

// internal
// =

// recurse the window menu and extract all 'accelerator' values with reserved=true
function extractKeybindings (menuNode, menuLabel) {
  if (menuNode.accelerator && menuNode.click && menuNode.reserved) {
    return {
      binding: convertAcceleratorToBinding(menuNode.accelerator),
      id: menuNode.id,
      menuLabel
    }
  } else if (menuNode.submenu) {
    return menuNode.submenu.map(item => extractKeybindings(item, menuNode.label)).filter(Boolean)
  } else if (Array.isArray(menuNode)) {
    return _flattenDeep(menuNode.map(extractKeybindings).filter(Boolean))
  }
  return null
}

// convert accelerator values into objects that are easy to match against input events
// eg 'CmdOrCtrl+Shift+T' -> {cmdOrCtrl: true, shift: true, key: 't'}
function convertAcceleratorToBinding (accel) {
  var binding = {};
  accel.split('+').forEach(part => {
    switch (part.toLowerCase()) {
      case 'command':
      case 'cmd':
        binding.cmd = true;
        break
      case 'ctrl':
        binding.control = true;
        break
      case 'cmdorctrl':
        if (IS_DARWIN) binding.cmd = true;
        else binding.control = true;
        break
      case 'alt':
        binding.alt = true;
        break
      case 'shift':
        binding.shift = true;
        break
      case 'plus':
        binding.key = '+';
        break
      default:
        binding.key = part.toLowerCase();
    }
  });
  return binding
}

function checkAccelerator (accelerator) {
  if (!isAccelerator(accelerator)) {
    throw new Error(`${accelerator} is not a valid accelerator`)
  }
}

function normalizeEvent (input) {
  var normalizedEvent = {
    code: input.code,
    key: input.key
  };

  for (let prop of ['alt', 'shift', 'meta']) {
    if (typeof input[prop] !== 'undefined') {
      normalizedEvent[`${prop}Key`] = input[prop];
    }
  }

  if (typeof input.control !== 'undefined') {
    normalizedEvent.ctrlKey = input.control;
  }

  return normalizedEvent
}

// handle OSX open-url event
var queue = [];
var isLoaded = false;
var isSetup = false;

function setup$9 () {
  if (isSetup) return
  isSetup = true;
  electron.ipcMain.on('shell-window:ready', function (e) {
    var win = electron.BrowserWindow.fromWebContents(e.sender);
    queue.forEach(url => create$2(win, url));
    queue.length = 0;
    isLoaded = true;
  });
}

function open (url, opts = {}) {
  setup$9();
  var win = getActiveWindow();
  if (isLoaded && win) {
    // send command now
    create$2(win, url, opts);
    win.show();
  } else {
    // queue for later
    queue.push(url);

    // no longer loaded?
    if (isLoaded) {
      isLoaded = false;
      // spawn a new window
      createShellWindow();
    }
  }
  return win && win.webContents
}

// globals
// =

// downloads list
// - shared across all windows
var downloads = [];

// used for rpc
var downloadsEvents = new EventEmitter__default();

const WEBAPI$2 = { createEventsStream, getDownloads, pause, resume, cancel, remove, open: open$1, showInFolder };

function registerListener (win, opts = {}) {
  const listener = async (e, item, wc) => {
    // dont touch if already being handled
    // - if `opts.saveAs` is being used, there may be multiple active event handlers
    if (item.isHandled) { return }

    // track as an active download
    item.id = ('' + Date.now()) + ('' + Math.random());
    if (opts.saveAs) item.setSavePath(opts.saveAs);
    item.isHandled = true;
    item.downloadSpeed = speedometer();

    downloads.push(item);

    // This is to prevent the browser-dropdown-menu from opening
    // For now it is being used when downloading `.html` pages
    if (!opts.suppressNewDownloadEvent) {
      downloadsEvents.emit('new-download', toJSON(item));
      openOrFocusDownloadsPage(win);
    }

    if (!wc.getURL()) {
      // download was triggered when the user opened a new tab
      // close the tab and do the download instead
      let tab = findTab(wc);
      if (tab) remove$4(tab.browserWindow, tab);
    }

    var lastBytes = 0;
    item.on('updated', () => {
      // set name if not already done
      if (!item.name) {
        item.name = path__default.basename(item.getSavePath());
      }

      var sumProgress = {
        receivedBytes: getSumReceivedBytes(),
        totalBytes: getSumTotalBytes()
      };

      // track rate of download
      item.downloadSpeed(item.getReceivedBytes() - lastBytes);
      lastBytes = item.getReceivedBytes();

      // emit
      downloadsEvents.emit('updated', toJSON(item));
      downloadsEvents.emit('sum-progress', sumProgress);
      win.setProgressBar(sumProgress.receivedBytes / sumProgress.totalBytes);
    });

    item.on('done', (e, state) => {
      // inform users of error conditions
      var overrides = false;
      if (state === 'interrupted') {
        // this can sometimes happen because the link is a data: URI
        // in that case, we can manually parse and save it
        if (item.getURL().startsWith('data:')) {
          let parsed = parseDataURL(item.getURL());
          if (parsed) {
            fs__default.writeFileSync(item.getSavePath(), parsed.body);
            overrides = {
              state: 'completed',
              receivedBytes: parsed.body.length,
              totalBytes: parsed.body.length
            };
          }
        }
        if (!overrides) {
          electron.dialog.showErrorBox('Download error', `The download of ${item.getFilename()} was interrupted`);
        }
      }

      downloadsEvents.emit('done', toJSON(item, overrides));

      // replace entry with a clone that captures the final state
      downloads.splice(downloads.indexOf(item), 1, capture(item, overrides));

      // reset progress bar when done
      if (isNoActiveDownloads() && !win.isDestroyed()) {
        win.setProgressBar(-1);
      }

      if (state === 'completed') {
        // flash the dock on osx
        if (process.platform === 'darwin') {
          electron.app.dock.downloadFinished(item.getSavePath());
        }
      }

      // optional, for one-time downloads
      if (opts.unregisterWhenDone) {
        wc.session.removeListener('will-download', listener);
      }
    });
  };

  win.webContents.session.prependListener('will-download', listener);
  win.on('close', () => win.webContents.session.removeListener('will-download', listener));
}

function download (win, wc, url, opts) {
  // register for onetime use of the download system
  opts = Object.assign({}, opts, {unregisterWhenDone: true, trusted: true});
  registerListener(win, opts);
  wc.downloadURL(url);
}

// rpc api
// =

function createEventsStream () {
  return emitStream(downloadsEvents)
}

function getDownloads () {
  return Promise.resolve(downloads.map(d => toJSON(d)))
}

function pause (id) {
  var download = downloads.find(d => d.id == id);
  if (download) { download.pause(); }
  return Promise.resolve()
}

function resume (id) {
  var download = downloads.find(d => d.id == id);
  if (download) { download.resume(); }
  return Promise.resolve()
}

function cancel (id) {
  var download = downloads.find(d => d.id == id);
  if (download) { download.cancel(); }
  return Promise.resolve()
}

function remove (id) {
  var download = downloads.find(d => d.id == id);
  if (download && download.getState() != 'progressing') { downloads.splice(downloads.indexOf(download), 1); }
  return Promise.resolve()
}

function open$1 (id) {
  return new Promise((resolve, reject) => {
    // find the download
    var download = downloads.find(d => d.id == id);
    if (!download || download.state != 'completed') { return reject() }

    // make sure the file is still there
    fs__default.stat(download.getSavePath(), err => {
      if (err) { return reject() }

      // open
      electron.shell.openItem(download.getSavePath());
      resolve();
    });
  })
}

function showInFolder (id) {
  return new Promise((resolve, reject) => {
    // find the download
    var download = downloads.find(d => d.id == id);
    if (!download || download.state != 'completed') { return reject() }

    // make sure the file is still there
    fs__default.stat(download.getSavePath(), err => {
      if (err) { return reject() }

      // open
      electron.shell.showItemInFolder(download.getSavePath());
      resolve();
    });
  })
}

// internal helpers
// =

// reduce down to attributes
function toJSON (item, overrides) {
  return {
    id: item.id,
    name: item.name,
    url: item.getURL(),
    state: overrides ? overrides.state : item.getState(),
    isPaused: item.isPaused(),
    receivedBytes: overrides ? overrides.receivedBytes : item.getReceivedBytes(),
    totalBytes: overrides ? overrides.totalBytes : item.getTotalBytes(),
    downloadSpeed: item.downloadSpeed()
  }
}

// create a capture of the final state of an item
function capture (item, overrides) {
  var savePath = item.getSavePath();
  var dlspeed = item.download;
  item = toJSON(item, overrides);
  item.getURL = () => item.url;
  item.getState = () => overrides === true ? 'completed' : item.state;
  item.isPaused = () => false;
  item.getReceivedBytes = () => overrides ? overrides.receivedBytes : item.receivedBytes;
  item.getTotalBytes = () => overrides ? overrides.totalBytes : item.totalBytes;
  item.getSavePath = () => savePath;
  item.downloadSpeed = () => dlspeed;
  return item
}

// sum of received bytes
function getSumReceivedBytes () {
  return getActiveDownloads().reduce((acc, item) => acc + item.getReceivedBytes(), 0)
}

// sum of total bytes
function getSumTotalBytes () {
  return getActiveDownloads().reduce((acc, item) => acc + item.getTotalBytes(), 0)
}

function getActiveDownloads () {
  return downloads.filter(d => d.getState() == 'progressing')
}

// all downloads done?
function isNoActiveDownloads () {
  return getActiveDownloads().length === 0
}

const PERMS = {
  js: {
    persist: true,
    idempotent: true,
    alwaysDisallow: false,
    requiresRefresh: true,
    experimental: false
  },
  network: {
    persist: true,
    idempotent: true,
    alwaysDisallow: false,
    requiresRefresh: true,
    experimental: false
  },
  createDrive: {
    persist: false,
    idempotent: false,
    alwaysDisallow: false,
    requiresRefresh: false,
    experimental: false
  },
  modifyDrive: {
    persist: 'allow', // dont persist 'deny'
    idempotent: true,
    alwaysDisallow: false,
    requiresRefresh: false,
    experimental: false
  },
  deleteDrive: {
    persist: false,
    idempotent: false,
    alwaysDisallow: false,
    requiresRefresh: false,
    experimental: false
  },
  tagDrive: {
    persist: false,
    idempotent: false,
    alwaysDisallow: false,
    requiresRefresh: false,
    experimental: false
  },
  listDrives: {
    persist: 'allow', // dont persist 'deny'
    idempotent: true,
    alwaysDisallow: false,
    requiresRefresh: false,
    experimental: false
  },
  media: {
    persist: false,
    idempotent: true,
    alwaysDisallow: false,
    requiresRefresh: false,
    experimental: false
  },
  geolocation: {
    persist: false,
    idempotent: true,
    alwaysDisallow: true, // NOTE geolocation is disabled, right now
    requiresRefresh: false,
    experimental: false
  },
  notifications: {
    persist: true,
    idempotent: true,
    alwaysDisallow: false,
    requiresRefresh: false,
    experimental: false
  },
  midi: {
    persist: false,
    idempotent: true,
    alwaysDisallow: false,
    requiresRefresh: false,
    experimental: false
  },
  midiSysex: {
    persist: false,
    idempotent: true,
    alwaysDisallow: false,
    requiresRefresh: false,
    experimental: false
  },
  pointerLock: {
    persist: false,
    idempotent: true,
    alwaysDisallow: false,
    requiresRefresh: false,
    experimental: false
  },
  fullscreen: {
    persist: true,
    idempotent: false,
    alwaysAllow: false,
    alwaysDisallow: false,
    requiresRefresh: false,
    experimental: false
  },
  download: {
    persist: false,
    idempotent: false,
    alwaysDisallow: false,
    requiresRefresh: false,
    experimental: false
  },
  dangerousAppControl: {
    persist: true,
    idempotent: false,
    alwaysAllow: false,
    requiresRefresh: false,
    experimental: false
  },
  openExternal: {
    persist: false,
    idempotent: false,
    alwaysDisallow: false,
    requiresRefresh: false,
    experimental: false
  },
  experimentalLibrary: {
    persist: true,
    idempotent: true,
    alwaysDisallow: false,
    requiresRefresh: false,
    experimental: true
  },
  experimentalLibraryRequestAdd: {
    persist: false,
    idempotent: false,
    alwaysDisallow: false,
    requiresRefresh: false,
    experimental: true
  },
  experimentalLibraryRequestRemove: {
    persist: false,
    idempotent: false,
    alwaysDisallow: false,
    requiresRefresh: false,
    experimental: true
  },
  experimentalGlobalFetch: {
    persist: true,
    idempotent: true,
    alwaysDisallow: false,
    requiresRefresh: false,
    experimental: true
  },
  experimentalDatPeers: {
    persist: true,
    idempotent: true,
    alwaysAllow: true,
    alwaysDisallow: false,
    requiresRefresh: false,
    experimental: true
  },
  experimentalCapturePage: {
    persist: false,
    idempotent: false,
    alwaysDisallow: false,
    requiresRefresh: false,
    experimental: true
  },
  panesCreate: {
    persist: 'allow', // dont persist 'deny'
    idempotent: true,
    alwaysDisallow: false,
    requiresRefresh: false,
    dangerous: true
  },
  panesAttach: {
    persist: 'allow', // dont persist 'deny'
    idempotent: true,
    alwaysDisallow: false,
    requiresRefresh: false,
    dangerous: true
  },
  panesInject: {
    persist: 'allow', // dont persist 'deny'
    idempotent: true,
    alwaysDisallow: false,
    requiresRefresh: false,
    dangerous: true
  },
};

function getPermId (permissionToken) {
  return permissionToken.split(':')[0]
}

var permPromptRPCManifest = {
  createTab: 'promise',
  resizeSelf: 'promise'
};

function findWebContentsParentWindow (wc) {
  for (let win of electron.BrowserWindow.getAllWindows()) {
    for (let view of win.getBrowserViews()) {
      if (view.webContents === wc) {
        return win
      }
    }
  }
  let win = electron.BrowserWindow.fromWebContents(wc);
  while (win && win.getParentWindow()) {
    win = win.getParentWindow();
  }
  // it might not be attached because it was a shell menu that has closed
  // in that case, just go with the focused window
  if (!win) win = electron.BrowserWindow.getFocusedWindow();
  return win
}

async function spawnAndExecuteJs (url, js) {
  var win = new electron.BrowserWindow({
    show: false,
    webPreferences: {
      preload: path__default.join(__dirname, 'fg', 'webview-preload', 'index.build.js'),
      nodeIntegrationInSubFrames: true,
      contextIsolation: true,
      worldSafeExecuteJavaScript: false, // TODO- this causes promises to fail in executeJavaScript, need to file an issue with electron
      webviewTag: false,
      sandbox: true,
      defaultEncoding: 'utf-8',
      nativeWindowOpen: true,
      nodeIntegration: false,
      scrollBounce: true,
      navigateOnDragDrop: true,
      enableRemoteModule: false,
      safeDialogs: true
    }
  });
  win.loadURL(url);
  var wc = win.webContents;

  wc.on('new-window', e => e.preventDefault());
  wc.on('will-navigate', e => e.preventDefault());
  wc.on('will-redirect', e => e.preventDefault());

  try {
    await new Promise((resolve, reject) => {
      wc.once('dom-ready', resolve);
      wc.once('did-fail-load', reject);
    });

    var res = await wc.executeJavaScript(js);
    return res
  } finally {
    win.close();
  }
}

/**
 * Perm Prompt
 *
 * NOTES
 * - Perm Prompt views are created as-needed, and desroyed when not in use
 * - Perm Prompt views are attached to individual BrowserView instances
 * - Perm Prompt views are shown and hidden based on whether its owning BrowserView is visible
 */

// globals
// =

const MARGIN_SIZE = 10;
var views$1 = {}; // map of {[tab.id] => BrowserView}

// exported api
// =

function setup$a (parentWindow) {
}

function destroy$1 (parentWindow) {
  // destroy all under this window
  for (let tab of getAll$1(parentWindow)) {
    if (tab.id in views$1) {
      views$1[tab.id].webContents.destroy();
      delete views$1[tab.id];
    }
  }
}

function reposition$1 (parentWindow) {
  // reposition all under this window
  for (let tab of getAll$1(parentWindow)) {
    if (tab.id in views$1) {
      setBounds(views$1[tab.id]);
    }
  }
}

async function create (parentWindow, tab, params) {
  // make sure a prompt window doesnt already exist
  if (tab.id in views$1) {
    return false // abort
  }

  if (!tab.isActive) {
    await tab.awaitActive();
  }

  // create the window
  var view = views$1[tab.id] = new electron.BrowserView({
    webPreferences: {
      defaultEncoding: 'utf-8',
      preload: path__default.join(__dirname, 'fg', 'perm-prompt', 'index.build.js')
    }
  });
  parentWindow.addBrowserView(view);
  setBounds(view);
  view.webContents.on('console-message', (e, level, message) => {
    console.log('Perm-Prompt window says:', message);
  });
  view.webContents.loadURL('wallets://perm-prompt/');
  view.webContents.focus();

  // run the prompt flow
  var decision = false;
  try {
    decision = await view.webContents.executeJavaScript(`runPrompt(${JSON.stringify(params)})`);
  } catch (e) {
    console.error('Failed to run permission prompt', e);
  }

  // destroy the window
  parentWindow.removeBrowserView(view);
  view.webContents.destroy();
  delete views$1[tab.id];
  return decision
}

function get$5 (tab) {
  return views$1[tab.id]
}

function show$1 (tab) {
  if (tab.id in views$1) {
    if (tab.browserWindow) {
      tab.browserWindow.addBrowserView(views$1[tab.id]);
    }
  }
}

function hide$1 (tab) {
  if (tab.id in views$1) {
    if (tab.browserWindow) {
      tab.browserWindow.removeBrowserView(views$1[tab.id]);
    }
  }
}

function close (tab) {
  if (tab.id in views$1) {
    views$1[tab.id].webContents.destroy();
    delete views$1[tab.id];
  }
}

// rpc api
// =

rpc.exportAPI('background-process-perm-prompt', permPromptRPCManifest, {
  async createTab (url) {
    var win = findWebContentsParentWindow(this.sender);
    create$2(win, url, {setActive: true, adjacentActive: true});
  },

  async resizeSelf (dimensions) {
    var view = Object.values(views$1).find(view => view.webContents === this.sender);
    if (!view) return
    var parentWindow = findWebContentsParentWindow(this.sender);
    setBounds(view, parentWindow, dimensions);
  }
});

// internal methods
// =

function setBounds (view, parentWindow, {width, height} = {}) {
  width = width || 300;
  height = height || 118;
  view.setBounds({
    x: 100 - MARGIN_SIZE,
    y: 70,
    width: width + (MARGIN_SIZE * 2),
    height: height + MARGIN_SIZE
  });
}

var permPromptSubwindow = /*#__PURE__*/Object.freeze({
  __proto__: null,
  setup: setup$a,
  destroy: destroy$1,
  reposition: reposition$1,
  create: create,
  get: get$5,
  show: show$1,
  hide: hide$1,
  close: close
});

/**
 * WebContents Trust tracker
 * 
 * This is a slightly bizarre system that's written in reaction to some electron limitations.
 *
 * We need a way to determine if a given webContents is currently viewing a "trusted interface."
 * Anything served by wallets:// is trusted, as is certain hyper:// resources which have a trusted
 * interface injected as the response (ie when it's not HTML and there's no custom frontend).
 * 
 * The way we determine whether a trusted interface was served by hyper:// is by examining the
 * response headers, which Wallets has control over for hyper:// requests. If 'Beaker-Trusted-Interface'
 * is present, then we know to mark the WC as viewing a trusted interface.
 * 
 * This knowledge needs to be tracked by each specific WC because there's the possibility that
 * a given URL changes its trusted status (fx a custom frontend is added). This would be easier
 * if Electron consistently told us the webContentsId of responses in the session.webRequests module,
 * but it does not. Therefore we have to manually track each webContents and match the responses
 * to the webContents. We do that by marking any WC's trust as "unknown" when a navigation starts
 * and noting the target URL. When the target URL is loaded, we find the WC with "unknown" trust
 * and the same target URL and then update the trust-rating accordingly.
 * 
 * If a WC is trusted, it can be treated as beaker's internal code and therefore receive its
 * permissions.
 * 
 * NOTES
 *  - This only tracks the mainframe, and so any non-mainframe (eg an iframe) should *not*
 *    be given trust through this system. This means iframes cant run trusted code, for now.
 */

const TRUST = {
  UNKNOWN: -1,
  UNTRUSTED: 0,
  TRUSTED: 1
};

// globals
// =

var wcInfos = {};

// exported api
// =

function setup$b () {
  electron.app.on('web-contents-created', (e, wc) => trackWc(wc));
}

function isWcTrusted (wc) {
  var wcid = (typeof wc === 'number') ? wc : wc.id;
  return wcInfos[wcid]?.trust === TRUST.TRUSTED
}

function setWcTrust (wc, trust) {
  var wcid = (typeof wc === 'number') ? wc : wc.id;
  wcInfos[wcid] = {id: wcid, url: wc.getURL(), trust};
}

function onWebRequestCompleted (details) {
  if (details.resourceType === 'mainFrame') {
    // find the wc going to this URL with no trust currently assigned
    var wcInfo;
    for (let id in wcInfos) {
      if (wcInfos[id].trust === TRUST.UNKNOWN && wcInfos[id].url === details.url) {
        wcInfo = wcInfos[id];
        break
      }
    }
    if (!wcInfo) {
      return
    }
    if (details.url.startsWith('wallets://')) {
      wcInfo.trust = TRUST.TRUSTED;
    } else if (details.url.startsWith('hyper://') && details.responseHeaders['Beaker-Trusted-Interface']) {
      wcInfo.trust = TRUST.TRUSTED;
    } else {
      wcInfo.trust = TRUST.UNTRUSTED;
    }
  }
}

// internal methods
// =

function trackWc (wc) {
  const id = wc.id;
  wcInfos[id] = {id, url: undefined, trust: TRUST.UNKNOWN};
  wc.on('did-start-navigation', (e, url, isInPlace, isMainFrame) => {
    if (isMainFrame && !isInPlace) {
      // reset trust info
      wcInfos[id].url = url;
      wcInfos[id].trust = TRUST.UNKNOWN;
    }
  });
  wc.on('destroyed', e => {
    delete wcInfos[id];
  });
}

// globals
// =

var idCounter = 0;
var activeRequests = [];

// exported api
// =

function setup$c () {
  // wire up handlers
  electron.session.defaultSession.setPermissionRequestHandler(onPermissionRequestHandler);
}

function requestPermission (permission, webContents, opts) {
  return new Promise((resolve, reject) => onPermissionRequestHandler(webContents, permission, resolve, opts))
}

function grantPermission (permission, webContents) {
  var siteURL = (typeof webContents === 'string') ? webContents : webContents.getURL();

  // update the DB
  const PERM = PERMS[getPermId(permission)];
  if (PERM && PERM.persist) {
    setPermission(siteURL, permission, 1);
  }
  return Promise.resolve()
}

function queryPermission (permission, webContents) {
  return getPermission(webContents.getURL(), permission)
}

function denyAllRequests (win) {
  // remove all requests in the window, denying as we go
  activeRequests = activeRequests.filter(req => {
    if (req.win === win) {
      for (let cb of req.cbs) {
        cb(false);
      }
      return false
    }
    return true
  });
}

async function checkLabsPerm ({perm, labApi, apiDocsUrl, sender}) {
  var urlp = parseDriveUrl(sender.getURL());
  if (urlp.protocol === 'wallets:') return true
  if (urlp.protocol === 'hyper:') {
    // resolve name
    let key = await hyper.dns.resolveName(urlp.hostname);

    // check index.json for opt-in
    let isOptedIn = false;
    let drive = hyper.drives.getDrive(key);
    if (drive) {
      let {checkoutFS} = await hyper.drives.getDriveCheckout(drive, urlp.version);
      let manifest = await checkoutFS.pda.readManifest().catch(_ => {});
      let apis = _get(manifest, 'experimental.apis');
      if (apis && Array.isArray(apis)) {
        isOptedIn = apis.includes(labApi);
      }
    }
    if (!isOptedIn) {
      throw new beakerErrorConstants.PermissionsError(`You must include "${labApi}" in your index.json experimental.apis list. See ${apiDocsUrl} for more information.`)
    }

    // ask user
    let allowed = await requestPermission(perm, sender);
    if (!allowed) throw new beakerErrorConstants.UserDeniedError()
    return true
  }
  throw new beakerErrorConstants.PermissionsError()
}

// event handlers
// =

async function onPermissionRequestHandler (webContents, permission, cb, opts) {
  const url = webContents.getURL();

  // always allow trusted interfaces
  if (isWcTrusted(webContents)) {
    return cb(true)
  }

  // check if the perm is auto-allowed or auto-disallowed
  const PERM = PERMS[getPermId(permission)];
  if (!PERM) return cb(false)
  if (PERM && PERM.alwaysAllow) return cb(true)
  if (PERM && PERM.alwaysDisallow) return cb(false)

  // special cases
  if (permission === 'openExternal' && opts.externalURL.startsWith('mailto:')) {
    return cb(true)
  }

  // check the sitedatadb
  var res = await getPermission(url, permission).catch(err => undefined);
  if (res === 1) return cb(true)
  if (res === 0) return cb(false)

  // look up the containing window
  var {win, tab} = getContaining(webContents);
  if (!win) {
    console.error('Warning: failed to find containing window of permission request, ' + permission);
    return cb(false)
  }

  // if we're already tracking this kind of permission request, and the perm is idempotent, then bundle them
  var req = PERM.idempotent ? activeRequests.find(req => req.webContents === webContents && req.permission === permission) : false;
  if (req) {
    req.cbs.push(cb);
    return
  }

  // wait for any existing perm requests on the tab to finish
  await waitForPendingTabRequests(tab);
  
  // track the new cb
  req = { id: ++idCounter, webContents, tab, win, url, permission, cbs: [cb] };
  activeRequests.push(req);

  // run the UI flow
  tab.setActivePane(tab.findPane(webContents));
  var decision = await create(win, tab, {permission, url, opts});

  // persist decisions
  if (PERM && PERM.persist) {
    if (PERM.persist === 'allow' && !decision) {
      // only persist allows
      await clearPermission(req.url, req.permission);
    } else {
      // persist all decisions
      await setPermission(req.url, req.permission, decision);
    }
  }

  // untrack
  activeRequests.splice(activeRequests.indexOf(req), 1);

  // hand down the decision
  for (let cb of req.cbs) {
    cb(decision);
  }
}

async function waitForPendingTabRequests (tab) {
  var reqs = activeRequests.filter(req => req.tab === tab);
  if (reqs.length === 0) return
  let promises = [];
  for (let req of reqs) {
    promises.push(new Promise(resolve => req.cbs.push(resolve)));
  }
  await Promise.all(promises);
}

function getContaining (webContents) {
  var tab = findTab(webContents);
  if (tab) {
    return {win: tab.browserWindow, tab}
  }
  return {}
}

var shellMenusRPCManifest = {
  close: 'promise',
  createWindow: 'promise',
  createTab: 'promise',
  createModal: 'promise',
  loadURL: 'promise',
  resizeSelf: 'promise',
  showInpageFind: 'promise',
  getWindowMenu: 'promise',
  triggerWindowMenuItemById: 'promise'
};

/**
 * Shell Menus
 *
 * NOTES
 * - There can only ever be one Shell Menu view for a given browser window
 * - Shell Menu views are created with each browser window and then shown/hidden as needed
 * - The Shell Menu view contains the UIs for multiple menus and swaps between them as needed
 * - When unfocused, the Shell Menu view is hidden (it's meant to act as a popup menu)
 */

// globals
// =

const IS_OSX = process.platform === 'darwin';
const MARGIN_SIZE$1 = 10;
const IS_RIGHT_ALIGNED = ['browser', 'bookmark', 'peers', 'share', 'site', 'donate'];
var events$5 = new EventEmitter__default();
var views$2 = {}; // map of {[parentWindow.id] => BrowserView}

// exported api
// =

function setup$d (parentWindow) {
  var view = views$2[parentWindow.id] = new electron.BrowserView({
    webPreferences: {
      defaultEncoding: 'utf-8',
      preload: path__default.join(__dirname, 'fg', 'shell-menus', 'index.build.js')
    }
  });
  view.webContents.on('console-message', (e, level, message) => {
    console.log('Shell-Menus window says:', message);
  });
  view.webContents.loadURL('wallets://shell-menus/');
}

function destroy$2 (parentWindow) {
  if (get$6(parentWindow)) {
    get$6(parentWindow).webContents.destroy();
    delete views$2[parentWindow.id];
  }
}

function get$6 (parentWindow) {
  return views$2[parentWindow.id]
}

function reposition$2 (parentWindow) {
  var view = get$6(parentWindow);
  if (view) {
    const setBounds = (b) => {
      if (view.currentDimensions) {
        Object.assign(b, view.currentDimensions);
      } else {
        adjustDimensions(b);
      }
      adjustPosition(b, view, parentWindow);
      view.setBounds(b);
    };
    if (view.menuId === 'background-tray') {
      setBounds({
        x: IS_OSX ? 75 : 10,
        y: 33,
        width: 400,
        height: 350
      });
    } else if (view.menuId === 'browser') {
      setBounds({
        x: 10,
        y: 72,
        width: 270,
        height: 350
      });
    } else if (view.menuId === 'bookmark') {
      setBounds({
        x: view.boundsOpt.rightOffset,
        y: 72,
        width: 250,
        height: 195
      });
    } else if (view.menuId === 'bookmark-edit') {
      setBounds({
        x: view.boundsOpt.left,
        y: view.boundsOpt.top,
        width: 250,
        height: 195
      });
    } else if (view.menuId === 'donate') {
      setBounds({
        x: view.boundsOpt.rightOffset,
        y: 72,
        width: 350,
        height: 90
      });
    } else if (view.menuId === 'share') {
      setBounds({
        x: view.boundsOpt.rightOffset,
        y: 72,
        width: 310,
        height: 120
      });
    } else if (view.menuId === 'peers') {
      setBounds({
        x: view.boundsOpt.rightOffset,
        y: 72,
        width: 200,
        height: 350
      });
    } else if (view.menuId === 'site') {
      setBounds({
        x: view.boundsOpt.rightOffset,
        y: 72,
        width: 250,
        height: 350
      });
    }
  }
}

async function toggle (parentWindow, menuId, opts) {
  var view = get$6(parentWindow);
  if (view) {
    if (view.isVisible) {
      return hide$2(parentWindow)
    } else {
      return show$2(parentWindow, menuId, opts)
    }
  }
}

async function update$1 (parentWindow, opts) {
  var view = get$6(parentWindow);
  if (view && view.isVisible) {
    view.boundsOpt = opts && opts.bounds ? opts.bounds : view.boundsOpt;
    reposition$2(parentWindow);
    var params = opts && opts.params ? opts.params : {};
    await view.webContents.executeJavaScript(`updateMenu(${JSON.stringify(params)}); undefined`);
  }
}

async function show$2 (parentWindow, menuId, opts) {
  var view = get$6(parentWindow);
  if (view) {
    view.menuId = menuId;
    view.boundsOpt = opts && opts.bounds;
    parentWindow.addBrowserView(view);
    reposition$2(parentWindow);
    view.isVisible = true;

    var params = opts && opts.params ? opts.params : {};
    await view.webContents.executeJavaScript(`openMenu('${menuId}', ${JSON.stringify(params)}); undefined`);
    view.webContents.focus();

    // await till hidden
    await new Promise(resolve => {
      events$5.once('hide', resolve);
    });
  }
}

function hide$2 (parentWindow) {
  var view = get$6(parentWindow);
  if (view) {
    view.webContents.executeJavaScript(`reset('${view.menuId}'); undefined`);
    parentWindow.removeBrowserView(view);
    view.currentDimensions = null;
    view.isVisible = false;
    events$5.emit('hide');
  }
}

// rpc api
// =

rpc.exportAPI('background-process-shell-menus', shellMenusRPCManifest, {
  async close () {
    hide$2(findWebContentsParentWindow(this.sender));
  },

  async createWindow (opts) {
    createShellWindow(opts);
  },

  async createTab (url) {
    var win = findWebContentsParentWindow(this.sender);
    hide$2(win); // always close the menu
    create$2(win, url, {setActive: true});
  },

  async createModal (name, opts) {
    return create$3(this.sender, name, opts)
  },

  async loadURL (url) {
    var win = findWebContentsParentWindow(this.sender);
    hide$2(win); // always close the menu
    getActive(win).loadURL(url);
  },

  async resizeSelf (dimensions) {
    var win = findWebContentsParentWindow(this.sender);
    var view = win ? views$2[win.id] : undefined;
    if (!view || !view.isVisible) return
    adjustDimensions(dimensions);
    view.currentDimensions = dimensions;
    reposition$2(findWebContentsParentWindow(this.sender));
  },

  async showInpageFind () {
    var win = findWebContentsParentWindow(this.sender);
    var tab = getActive(win);
    if (tab) tab.showInpageFind();
  },

  async triggerWindowMenuItemById (menu, id) {
    return triggerMenuItemById(menu, id)
  }
});

// internal methods
// =

function adjustPosition (bounds, view, parentWindow) {
  if (IS_RIGHT_ALIGNED.includes(view.menuId)) {
    let parentBounds = parentWindow.getContentBounds();
    bounds.x = (parentBounds.width - bounds.width - bounds.x) + MARGIN_SIZE$1;
  } else {
    bounds.x = bounds.x - MARGIN_SIZE$1;
  }
}

function adjustDimensions (bounds) {
  bounds.width = bounds.width + (MARGIN_SIZE$1 * 2),
  bounds.height = bounds.height + MARGIN_SIZE$1;
}

var shellMenusSubwindow = /*#__PURE__*/Object.freeze({
  __proto__: null,
  setup: setup$d,
  destroy: destroy$2,
  get: get$6,
  reposition: reposition$2,
  toggle: toggle,
  update: update$1,
  show: show$2,
  hide: hide$2
});

var locationBarRPCManifest = {
  close: 'promise',
  createTab: 'promise',
  loadURL: 'promise',
  reload: 'promise',
  resizeSelf: 'promise'
};

/**
 * Location Bar
 *
 * NOTES
 * - There can only ever be one Location Bar view for a given browser window
 * - Location Bar views are created with each browser window and then shown/hidden as needed
 * - When unfocused, the Location Bar view is hidden (it's meant to act as a popup menu)
 */

// globals
// =

const MARGIN_SIZE$2 = 10;
var events$6 = new EventEmitter__default();
var views$3 = {}; // map of {[parentWindow.id] => BrowserView}

// exported api
// =

function setup$e (parentWindow) {
  var id = parentWindow.id;
  var view = views$3[id] = new electron.BrowserView({
    webPreferences: {
      defaultEncoding: 'utf-8',
      preload: path__default.join(__dirname, 'fg', 'location-bar', 'index.build.js')
    }
  });
  view.setAutoResize({width: true, height: false});
  view.webContents.on('console-message', (e, level, message) => {
    console.log('Location-Bar window says:', message);
  });
  view.webContents.loadURL('wallets://location-bar/');

  on('set:search_engines', newValue => {
    if (id in views$3) {
      parentWindow.webContents.send('command', 'set-search-engines', newValue);
    }
  });
}

function destroy$3 (parentWindow) {
  if (get$7(parentWindow)) {
    get$7(parentWindow).webContents.destroy();
    delete views$3[parentWindow.id];
  }
}

function get$7 (parentWindow) {
  return views$3[parentWindow.id]
}

function reposition$3 (parentWindow) {
  // noop
}

async function show$3 (parentWindow, opts) {
  var view = get$7(parentWindow);
  if (view) {
    view.opts = opts;
    view.webContents.executeJavaScript(`setup(); undefined`);
    parentWindow.addBrowserView(view);
    view.setBounds({
      x: opts.bounds.x - MARGIN_SIZE$2,
      y: opts.bounds.y,
      width: opts.bounds.width + (MARGIN_SIZE$2*2),
      height: 588 + MARGIN_SIZE$2
    });
    view.isVisible = true;

    // await till hidden
    await new Promise(resolve => {
      // TODO confirm this works
      events$6.once('hide', resolve);
    });
  }
}

function hide$3 (parentWindow) {
  var view = get$7(parentWindow);
  if (view) {
    view.webContents.executeJavaScript(`invisibilityCloak(); undefined`);
    setTimeout(() => {
      parentWindow.removeBrowserView(view);
      view.isVisible = false;
      events$6.emit('hide'); // TODO confirm this works
    }, 150);
    // ^ this delay is how we give click events time to be handled in the UI
    // without it, the location input's blur event will remove our browserview too quickly
  }
}

async function runCmd (parentWindow, cmd, opts) {
  var view = get$7(parentWindow);
  if (view) {
    if (!view.isVisible) {
      if (cmd === 'show') {
        // show first
        show$3(parentWindow, opts);
      } else {
        return
      }
    }
    return view.webContents.executeJavaScript(`command("${cmd}", ${JSON.stringify(opts)})`)
  }
}

// rpc api
// =

rpc.exportAPI('background-process-location-bar', locationBarRPCManifest, {
  async close () {
    hide$3(getParentWindow$1(this.sender));
  },

  async createTab (url) {
    var win = getParentWindow$1(this.sender);
    hide$3(win); // always close the location bar
    create$2(win, url, {setActive: true});
  },

  async loadURL (url) {
    var win = getParentWindow$1(this.sender);
    hide$3(win); // always close the location bar
    getActive(win).primaryPane.loadURL(url);
    get$7(win).webContents.send('command', 'unfocus-location'); // we have to manually unfocus the location bar
  },

  async reload () {
    var win = getParentWindow$1(this.sender);
    hide$3(win); // always close the location bar
    getActive(win).primaryPane.reload();
    get$7(win).webContents.send('command', 'unfocus-location'); // we have to manually unfocus the location bar
  },

  async resizeSelf (dimensions) {
    var view = get$7(getParentWindow$1(this.sender));
    view.setBounds({
      x: view.opts.bounds.x - MARGIN_SIZE$2,
      y: view.opts.bounds.y,
      width: (dimensions.width || view.opts.bounds.width) + (MARGIN_SIZE$2*2),
      height: (dimensions.height || 588) + MARGIN_SIZE$2
    });
  }
});

// internal methods
// =

function getParentWindow$1 (sender) {
  for (let win of electron.BrowserWindow.getAllWindows()) {
    if (win.webContents === sender) return win
    for (let view of win.getBrowserViews()) {
      if (view.webContents === sender) return win
    }
  }
  throw new Error('Parent window not found')
}

var locationBarSubwindow = /*#__PURE__*/Object.freeze({
  __proto__: null,
  setup: setup$e,
  destroy: destroy$3,
  get: get$7,
  reposition: reposition$3,
  show: show$3,
  hide: hide$3,
  runCmd: runCmd
});

var promptsRPCManifest = {
  close: 'promise',
  createTab: 'promise',
  loadURL: 'promise'
};

// globals
// =

var setupWindow;

async function runSetupFlow () {
  var setupState = await get$2('SELECT * FROM setup_state');
  if (!setupState) {
    setupState = {
      migrated08to09: 0,
      profileSetup: 0
    };
    await run(knex('setup_state').insert(setupState));
  }

  var needsSetup = !setupState.profileSetup || !setupState.migrated08to09;
  if (needsSetup) {
    setupWindow = new electron.BrowserWindow({
      // titleBarStyle: 'hiddenInset',
      autoHideMenuBar: true,
      fullscreenable: false,
      resizable: false,
      fullscreenWindowTitle: true,
      frame: false,
      width: 600,
      height: 500,
      backgroundColor: '#334',
      webPreferences: {
        preload: path.join(__dirname, 'fg', 'webview-preload', 'index.build.js'),
        defaultEncoding: 'utf-8',
        nodeIntegration: false,
        contextIsolation: true,
        webviewTag: false,
        sandbox: true,
        webSecurity: true,
        enableRemoteModule: false,
        allowRunningInsecureContent: false
      },
      icon: ICON_PATH,
      show: true
    });
    setupWindow.loadURL(`wallets://setup/?${(new url.URLSearchParams(setupState)).toString()}`);
    await new Promise(r => setupWindow.once('close', r));
    setupWindow = undefined;
  }
}

async function updateSetupState (obj) {
  await run(knex('setup_state').update(obj));

  // HACK
  // window.close() isnt working within the UI thread for some reason
  // so use this as a cue to close the window
  // -prf
  var setupState = await get$2('SELECT * FROM setup_state');
  if (setupWindow && setupState.profileSetup && setupState.migrated08to09) setupWindow.close();
}

/**
 * Prompts
 *
 * NOTES
 * - Prompt views are created as-needed, and desroyed when not in use
 * - Prompt views are attached to individual BrowserView instances
 * - Prompt views are shown and hidden based on whether its owning BrowserView is visible
 */

// globals
// =

const MARGIN_SIZE$3 = 10;
var views$4 = {}; // map of {[tab.id] => BrowserView}

// exported api
// =

function setup$f (parentWindow) {
}

function destroy$4 (parentWindow) {
  // destroy all under this window
  for (let tab of getAll$1(parentWindow)) {
    if (tab.id in views$4) {
      views$4[tab.id].webContents.destroy();
      delete views$4[tab.id];
    }
  }
}

function reposition$4 (parentWindow) {
  // reposition all under this window
  for (let tab of getAll$1(parentWindow)) {
    if (tab.id in views$4) {
      setBounds$1(views$4[tab.id], tab);
    }
  }
}

async function create$1 (webContents, promptName, params = {}) {
  var parentWindow = findWebContentsParentWindow(webContents);
  var tab = getActive(parentWindow);

  // make sure a prompt window doesnt already exist
  if (tab.id in views$4) {
    return
  }

  if (!tab.isActive) {
    await tab.awaitActive();
  }

  // create the view
  var view = views$4[tab.id] = new electron.BrowserView({
    webPreferences: {
      defaultEncoding: 'utf-8',
      preload: path__default.join(__dirname, 'fg', 'prompts', 'index.build.js')
    }
  });
  view.promptName = promptName;
  view.tab = tab;
  if (getActive(parentWindow).id === tab.id) {
    parentWindow.addBrowserView(view);
  }
  setBounds$1(view, tab);
  view.webContents.on('console-message', (e, level, message) => {
    console.log('Prompts window says:', message);
  });
  view.webContents.loadURL('wallets://prompts/');
  await view.webContents.executeJavaScript(`showPrompt("${promptName}", ${JSON.stringify(params)}); undefined`);
  return view
}

function get$8 (tab) {
  return views$4[tab.id]
}

function show$4 (tab) {
  if (tab.id in views$4) {
    var view = views$4[tab.id];
    if (tab.browserWindow) {
      tab.browserWindow.addBrowserView(view);
      setBounds$1(view, tab);
    }
  }
}

function hide$4 (tab) {
  if (tab.id in views$4) {
    if (tab.browserWindow) {
      tab.browserWindow.removeBrowserView(views$4[tab.id]);
    }
  }
}

function close$1 (tab) {
  if (tab.id in views$4) {
    var view = views$4[tab.id];
    if (tab.browserWindow) {
      tab.browserWindow.removeBrowserView(view);
    }
    view.webContents.destroy();
    delete views$4[tab.id];
  }
}

// rpc api
// =

rpc.exportAPI('background-process-prompts', promptsRPCManifest, {
  async close () {
    close$1(findTab(this.sender));
  },

  async createTab (url) {
    var win = findWebContentsParentWindow(this.sender);
    create$2(win, url, {setActive: true, adjacentActive: true});
  },

  async loadURL (url) {
    var win = findWebContentsParentWindow(this.sender);
    getActive(win).loadURL(url);
  }
});

// internal methods
// =

function getDefaultWidth (view) {
  return 380
}

function getDefaultHeight (view) {
  return 80
}

function setBounds$1 (view, tab, {width, height} = {}) {
  var parentBounds = tab.browserWindow.getContentBounds();
  width = Math.min(width || getDefaultWidth(), parentBounds.width - 20);
  height = Math.min(height || getDefaultHeight(), parentBounds.height - 20);
  var y = getAddedWindowSettings(tab.browserWindow).isShellInterfaceHidden ? 10 : 95;
  view.setBounds({
    x: parentBounds.width - width - (MARGIN_SIZE$3 * 2),
    y,
    width: width + (MARGIN_SIZE$3 * 2),
    height: height + MARGIN_SIZE$3
  });
}

var promptsSubwindow = /*#__PURE__*/Object.freeze({
  __proto__: null,
  setup: setup$f,
  destroy: destroy$4,
  reposition: reposition$4,
  create: create$1,
  get: get$8,
  show: show$4,
  hide: hide$4,
  close: close$1
});

/**
 * Site Infos
 *
 * NOTES
 * - There can only ever be one Site Info view for a given browser window
 * - Site Info views are created with each browser window and then shown/hidden as needed
 * - When unfocused, the Site Info view is hidden (it's meant to act as a popup menu)
 */

// globals
// =

const MARGIN_SIZE$4 = 10;
var events$7 = new EventEmitter__default();
var views$5 = {}; // map of {[parentWindow.id] => BrowserView}

// exported api
// =

function setup$g (parentWindow) {
  var view = views$5[parentWindow.id] = new electron.BrowserView({
    webPreferences: {
      preload: path__default.join(__dirname, 'fg', 'webview-preload', 'index.build.js'),
      nodeIntegrationInSubFrames: true,
      contextIsolation: true,
      worldSafeExecuteJavaScript: false,
      webviewTag: false,
      sandbox: true,
      defaultEncoding: 'utf-8',
      nativeWindowOpen: true,
      nodeIntegration: false,
      scrollBounce: true,
      navigateOnDragDrop: false
    }
  });
  view.webContents.on('console-message', (e, level, message) => {
    console.log('Site-Info window says:', message);
  });
  view.webContents.loadURL('wallets://site-info/');
}

function destroy$5 (parentWindow) {
  if (get$9(parentWindow)) {
    get$9(parentWindow).webContents.destroy();
    delete views$5[parentWindow.id];
  }
}

function get$9 (parentWindow) {
  return views$5[parentWindow.id]
}

function reposition$5 (parentWindow) {
  var view = get$9(parentWindow);
  if (view) {
    const setBounds = (b) => {
      // HACK workaround the lack of view.getBounds() -prf
      if (view.currentBounds) {
        b = view.currentBounds; // use existing bounds
      }
      view.currentBounds = b; // store new bounds
      view.setBounds(adjustBounds(b));
    };
    setBounds({
      x: view.boundsOpt ? view.boundsOpt.left : 170,
      y: (view.boundsOpt ? view.boundsOpt.top : 67) + 5,
      width: 420,
      height: 350
    });
  }
}

function resize (parentWindow, bounds = {}) {
  var view = get$9(parentWindow);
  if (view && view.currentBounds) {
    view.currentBounds.width = bounds.width || view.currentBounds.width;
    view.currentBounds.height = bounds.height || view.currentBounds.height;
    view.setBounds(adjustBounds(view.currentBounds));
  }
}

function toggle$1 (parentWindow, opts) {
  var view = get$9(parentWindow);
  if (view) {
    if (view.isVisible) {
      return hide$5(parentWindow)
    } else {
      return show$5(parentWindow, opts)
    }
  }
}

async function show$5 (parentWindow, opts) {
  var view = get$9(parentWindow);
  if (view) {
    view.boundsOpt = opts && opts.bounds;
    parentWindow.addBrowserView(view);
    reposition$5(parentWindow);
    view.isVisible = true;

    var params = opts && opts.params ? opts.params : {};
    params.url = getActive(parentWindow).url;
    await view.webContents.executeJavaScript(`init(${JSON.stringify(params)}); undefined`);
    view.webContents.focus();

    // await till hidden
    await new Promise(resolve => {
      events$7.once('hide', resolve);
    });
  }
}

function hide$5 (parentWindow) {
  var view = get$9(parentWindow);
  if (view) {
    view.webContents.executeJavaScript(`reset(); undefined`);
    parentWindow.removeBrowserView(view);
    view.currentBounds = null;
    view.isVisible = false;
    events$7.emit('hide');
  }
}

// internal methods
// =

/**
 * @description
 * Ajust the bounds for margin
 */
function adjustBounds (bounds) {
  return {
    x: bounds.x - MARGIN_SIZE$4,
    y: bounds.y,
    width: bounds.width + (MARGIN_SIZE$4 * 2),
    height: bounds.height + MARGIN_SIZE$4
  }
}

var siteInfoSubwindow = /*#__PURE__*/Object.freeze({
  __proto__: null,
  setup: setup$g,
  destroy: destroy$5,
  get: get$9,
  reposition: reposition$5,
  resize: resize,
  toggle: toggle$1,
  show: show$5,
  hide: hide$5
});

/**
 * Tab Switchers
 *
 * NOTES
 * - There is one tab-switcher per BrowserWindow instance
 * - Switcher views are created with each browser window and then shown/hidden as needed
 */

// constants
// =

const VIEW_MARGIN = 10;
const TAB_ENTRY_WIDTH = 120;
const TAB_GAP = 10;
const HEIGHT = 114 + (VIEW_MARGIN * 2);

// globals
// =

var views$6 = {}; // map of {[parentWindow.id] => BrowserView}

// exported api
// =

function setup$h (parentWindow) {
  var view = views$6[parentWindow.id] = new electron.BrowserView({
    webPreferences: {
      defaultEncoding: 'utf-8'
    }
  });
  view.webContents.loadFile(path__default.join(__dirname, 'fg', 'tab-switcher', 'index.html'));
  setWcTrust(view.webContents, TRUST.TRUSTED);
}

function destroy$6 (parentWindow) {
  if (get$a(parentWindow)) {
    get$a(parentWindow).webContents.destroy();
    delete views$6[parentWindow.id];
  }
}

function get$a (parentWindow) {
  return views$6[parentWindow.id]
}

function reposition$6 (parentWindow) {
  var view = get$a(parentWindow);
  if (view) {
    var {width, height} = parentWindow.getContentBounds();
    var numTabs = (view.tabs ? view.tabs.length : 0);

    var viewWidth = (
      (numTabs * TAB_ENTRY_WIDTH) // tab entry width
      + ((numTabs - 1) * TAB_GAP) // tab entry grid-gap
      + 20 // tab-switcher body padding
      + (VIEW_MARGIN * 2) // tab-switcher body margin
    );
    var viewHeight = HEIGHT;

    if (viewWidth > (width - 100)) {
      viewWidth = width - 100;
    }

    view.setBounds({x: ((width / 2) - (viewWidth/ 2))|0, y: ((height / 2) - (viewHeight / 2))|0, width: viewWidth, height: viewHeight});
  }
}

function show$6 (parentWindow) {
  var view = get$a(parentWindow);
  if (view) {
    // read the current tabs state
    var defaultCurrentSelection = getPreviousTabIndex(parentWindow);
    var allTabs = getAllAcrossWindows();
    var tabInfos = [];
    for (let winId in allTabs) {
      for (let tab of allTabs[winId]) {
        tabInfos.push({
          winId: +winId,
          url: tab.url,
          title: tab.title
        });
      }
    }
    view.tabs = tabInfos;

    // render
    parentWindow.addBrowserView(view);
    view.webContents.executeJavaScript(`
      window.setTabs(${JSON.stringify(tabInfos)}, ${defaultCurrentSelection}); undefined
    `);
    reposition$6(parentWindow);
  }
}

async function hide$6 (parentWindow) {
  var view = get$a(parentWindow);
  if (view) {
    var selectedTab = await view.webContents.executeJavaScript(`
      window.getSelection()
    `);
    if (selectedTab && typeof selectedTab === 'object') {
      let win = electron.BrowserWindow.fromId(selectedTab.winId);
      if (!win.isFocused()) {
        win.focus();
      }
      setActive(win, selectedTab.tabIndex);
    }
    parentWindow.removeBrowserView(view);
  }
}

async function moveSelection (parentWindow, dir) {
  var view = get$a(parentWindow);
  if (view) {
    await view.webContents.executeJavaScript(`
      window.moveSelection(${dir}); undefined
    `);
  }
}

var tabSwitcherSubwindow = /*#__PURE__*/Object.freeze({
  __proto__: null,
  setup: setup$h,
  destroy: destroy$6,
  get: get$a,
  reposition: reposition$6,
  show: show$6,
  hide: hide$6,
  moveSelection: moveSelection
});

const logger$5 = child({category: 'browser'});

const IS_WIN = process.platform === 'win32';
const IS_LINUX = process.platform === 'linux';
const subwindows = {
  locationBar: locationBarSubwindow,
  menu: shellMenusSubwindow,
  prompts: promptsSubwindow,
  permPrompt: permPromptSubwindow,
  modals: modalsSubwindow,
  overlay: overlaySubwindow,
  siteInfo: siteInfoSubwindow,
  tabSwitcher: tabSwitcherSubwindow
};

// globals
// =

var userDataDir;
var numActiveWindows = 0;
var firstWindow = null;
var sessionWatcher = null;
var focusedDevtoolsHost;
var hasFirstWindowLoaded = false;
var isTabSwitcherActive = {}; // map of {[window.id] => Boolean}
var windowAddedSettings = {}; // map of {[window.id] => Object}
const BROWSING_SESSION_PATH = './shell-window-state.json';
const ICON_PATH = path__default.join(__dirname, (process.platform === 'win32') ? './assets/img/logo.ico' : './assets/img/logo.png');
const PRELOAD_PATH = path__default.join(__dirname, 'fg', 'shell-window', 'index.build.js');

// exported methods
// =

async function setup$i () {
  // config
  userDataDir = jetpack.cwd(electron.app.getPath('userData'));
  sessionWatcher = new SessionWatcher(userDataDir);
  var previousSessionState = getPreviousBrowsingSession();
  var customStartPage = await get$1('custom_start_page');
  var isTestDriverActive = !!getEnvVar('WALLETS_TEST_DRIVER');
  var isOpenUrlEnvVar = !!getEnvVar('WALLETS_OPEN_URL');

  // set up app events
  electron.app.on('activate', () => {
    // wait for ready (not waiting can trigger errors)
    if (electron.app.isReady()) ensureOneWindowExists();
    else electron.app.on('ready', ensureOneWindowExists);
  });
  electron.ipcMain.on('new-window', () => createShellWindow());
  electron.app.on('custom-window-all-closed', async () => {
    if (process.platform !== 'darwin') {
      var runBackground = await get$1('run_background');
      if (runBackground != 1) {
        electron.app.quit();
      }
    }
  });

  setup$9();
  await setup$m();

  electron.app.on('custom-background-tabs-update', backgroundTabs => {
    sessionWatcher.updateBackgroundTabs(backgroundTabs);
  });

  electron.app.on('custom-ready-to-show', () => {
    if (!previousSessionState.backgroundTabs) return
    initializeBackgroundFromSnapshot(previousSessionState);
  });

  electron.app.on('before-quit', async e => {
    sessionWatcher.stopRecording();
    sessionWatcher.exit();
  });

  electron.app.on('web-contents-created', async (e, wc) => {
    // await setup
    await new Promise(resolve => wc.once('did-start-loading', resolve));

    // handle shell-window webcontents
    const window = electron.BrowserWindow.fromWebContents(wc);
    if (window) {
      // attach global keybindings
      wc.on('before-input-event', globalTabSwitcherKeyHandler);
      wc.on('before-input-event', createGlobalKeybindingsHandler(window));
      return
    }

    // handle tab webcontents
    var parentWindow = findWebContentsParentWindow(wc);
    if (!parentWindow) {
      parentWindow = findContainingWindow(wc);
      if (!parentWindow) {
        return
      }
    }

    // attach global keybindings
    wc.on('before-input-event', globalTabSwitcherKeyHandler);
    wc.on('before-input-event', createGlobalKeybindingsHandler(parentWindow));
    wc.on('before-input-event', createKeybindingProtectionsHandler(parentWindow));

    // HACK
    // add link-click handling to page devtools
    // (it would be much better to update Electron to support this, rather than overriding like this)
    // -prf
    wc.on('devtools-opened', () => {
      if (wc.devToolsWebContents) {
        wc.devToolsWebContents.executeJavaScript('InspectorFrontendHost.openInNewTab = (url) => window.open(url); undefined');
        wc.devToolsWebContents.on('new-window', (e, url) => {
          if (url.startsWith('chrome-devtools://')) return // ignore
          create$2(parentWindow, url, {setActive: true, adjacentActive: true});
        });
      }
    });

    // track focused devtools host
    wc.on('devtools-focused', () => { focusedDevtoolsHost = wc; });
    wc.on('devtools-closed', unfocusDevtoolsHost);
    wc.on('destroyed', unfocusDevtoolsHost);
    function unfocusDevtoolsHost () {
      if (focusedDevtoolsHost === wc) {
        focusedDevtoolsHost = undefined;
      }
    }
  });

  if (!isTestDriverActive && !isOpenUrlEnvVar && (customStartPage === 'previous' || (!previousSessionState.cleanExit && userWantsToRestoreSession()))) {
    // restore old window
    restoreBrowsingSession(previousSessionState);
  } else {
    let opts = {};
    if (previousSessionState.windows[0]) {
      // use the last session's window position
      let {x, y, width, height} = previousSessionState.windows[0];
      opts.x = x;
      opts.y = y;
      opts.width = width;
      opts.height = height;
    }
    if (isOpenUrlEnvVar) {
      // use the env var if specified
      opts.pages = [getEnvVar('WALLETS_OPEN_URL')];
    }
    // create new window
    createShellWindow(opts);
  }
}

function createShellWindow (windowState, createOpts = {dontInitPages: false}) {
  if (!sessionWatcher) {
    logger$5.error('Attempted to create a shell window prior to setup', {stack: (new Error()).stack});
    return
  }
  // create window
  let state = ensureVisibleOnSomeDisplay(Object.assign({}, defaultWindowState(), lastWindowPositioning(), windowState));
  var { x, y, width, height, minWidth, minHeight } = state;
  var frameSettings = {
    titleBarStyle: 'hidden',
    trafficLightPosition: {x: 12, y: 20},
    frame: IS_LINUX || IS_WIN,
    title: undefined
  };
  var win = new electron.BrowserWindow(Object.assign({
    autoHideMenuBar: false,
    fullscreenable: true,
    fullscreenWindowTitle: true,
    alwaysOnTop: state.isAlwaysOnTop,
    x,
    y,
    width,
    height,
    minWidth,
    minHeight,
    backgroundColor: '#fff',
    webPreferences: {
      preload: PRELOAD_PATH,
      defaultEncoding: 'utf-8',
      nodeIntegration: false,
      contextIsolation: false,
      webviewTag: false,
      sandbox: true,
      webSecurity: false, // disable same-origin-policy in the shell window, webviews have it restored
      // enableRemoteModule: false, TODO would prefer this were true, but shell window needs this to get the webviews' webContents IDs -prf
      allowRunningInsecureContent: false,
      nativeWindowOpen: true
    },
    icon: ICON_PATH,
    show: false // will show when ready
  }, frameSettings));
  win.once('ready-to-show', () => {
    win.show();
    if (!hasFirstWindowLoaded) {
      hasFirstWindowLoaded = true;
      electron.app.emit('custom-ready-to-show');
    }
  });
  for (let k in subwindows) {
    subwindows[k].setup(win);
  }
  registerListener(win);
  win.loadURL('wallets://shell-window');
  sessionWatcher.watchWindow(win, state);

  numActiveWindows++;
  if (numActiveWindows === 1) {
    firstWindow = win.webContents.id;
  }

  electron.ipcMain.on('shell-window:ready', handlePagesReady);
  win.on('close', () => {
    electron.ipcMain.removeListener('shell-window:ready', handlePagesReady);
    for (let k in subwindows) {
      subwindows[k].destroy(win);
    }
    destroyAll(win);
  });

  async function handlePagesReady ({ sender }) {
    if (!win || win.isDestroyed()) return

    if (sender === win.webContents) {
      if (win.webContents.id === firstWindow) {
        // if this is the first window opened (since app start or since all windows closing)
        // NOTE this is legacy compat- the pins are now stored in the session state
        loadPins(win);
      }
      if (!createOpts.dontInitPages) {
        initializeWindowFromSnapshot(win, state.pages);
        if (getAll$1(win).length === 0) {
          create$2(win); // create default new tab
        }
      }
      if (state.isShellInterfaceHidden) {
        setShellInterfaceHidden(win, true);
      }
      if (state.isSidebarHidden) {
        setSidebarHidden(win, true);
      }
      win.emit('custom-pages-ready');

      // DISABLED
      // not sure whether we'll need this
      // -prf
      // run setup modal
      // let isTestDriverActive = !!getEnvVar('WALLETS_TEST_DRIVER')
      // let hasDoneSetup = Number(await sitedataDb.get('wallets://shell-window', 'has_done_setup')) === 1
      // if (!!getEnvVar('WALLETS_RUN_SETUP_FLOW')) {
      //   hasDoneSetup = false
      // }
      // if (!isTestDriverActive && !hasDoneSetup) {
      //   subwindows.modals.create(win.webContents, 'setup')
      //   await sitedataDb.set('wallets://shell-window', 'has_done_setup', 1)
      // }
    }
  }

  // register shortcuts
  registerGlobalKeybinding(win, 'CmdOrCtrl+[', onGoBack);
  registerGlobalKeybinding(win, 'CmdOrCtrl+]', onGoForward);
  registerGlobalKeybinding(win, 'Alt+D', onFocusLocation);
  registerGlobalKeybinding(win, 'F5', onReload);
  registerGlobalKeybinding(win, 'F6', onFocusLocation);

  // register event handlers
  win.on('browser-backward', onGoBack);
  win.on('browser-forward', onGoForward);
  // win.on('scroll-touch-begin', sendScrollTouchBegin) // TODO readd?
  // win.on('scroll-touch-end', sendToWebContents('scroll-touch-end')) // TODO readd?
  win.on('focus', e => {
    // sendToWebContents('focus')(e) TODO readd?
    var active = getActive(win);
    if (active) active.focus();
  });
  win.on('app-command', (e, cmd) => { onAppCommand(win, e, cmd); });
  win.on('enter-full-screen', e => {
    // update UI
    emitReplaceState(win);

    // TODO
    // registerGlobalKeybinding(win, 'Esc', onEscape(win))
    // sendToWebContents('enter-full-screen')(e)
  });
  win.on('leave-full-screen', e => {
    // update UI
    emitReplaceState(win);

    // TODO
    // unregisterGlobalKeybinding(win, 'Esc')
    // sendToWebContents('leave-full-screen')(e)
  });
  function onMaxChange () {
    resize$1(win);
    // on ubuntu, the maximize/unmaximize animations require multiple resizings
    setTimeout(() => resize$1(win), 250);
    setTimeout(() => resize$1(win), 500);
  }
  win.on('maximize', onMaxChange);
  win.on('unmaximize', onMaxChange);
  win.on('resize', () => {
    resize$1(win);
    for (let k in subwindows) {
      subwindows[k].reposition(win);
    }
  });
  win.on('move', () => {
    for (let k in subwindows) {
      subwindows[k].reposition(win);
    }
  });
  win.on('close', onClose(win));

  return win
}

function restoreLastShellWindow () {
  return createShellWindow(sessionWatcher.popLastClosedWindow())
}

function getActiveWindow () {
  // try to pull the `focus`ed window; if there isnt one, fallback to the last created
  var win = electron.BrowserWindow.getFocusedWindow();
  if (!win || win.webContents.getURL() !== 'wallets://shell-window/') {
    win = electron.BrowserWindow.getAllWindows().filter(win => win.webContents.getURL() === 'wallets://shell-window/').pop();
  }
  return win
}

function getFocusedDevToolsHost () {
  // check first if it's the shell window's devtools
  let win = electron.BrowserWindow.getAllWindows().find(w => w.webContents.isDevToolsFocused());
  if (win) return win.webContents
  // fallback to our manually tracked devtools host
  return focusedDevtoolsHost
}

function getAddedWindowSettings (win) {
  if (!win || !win.id) return {}
  return windowAddedSettings[win.id] || {}
}

function updateAddedWindowSettings (win, settings) {
  windowAddedSettings[win.id] = Object.assign(getAddedWindowSettings(win), settings);
}

function ensureOneWindowExists () {
  if (numActiveWindows === 0) {
    createShellWindow();
  }
}

function toggleShellInterface (win) {
  setShellInterfaceHidden(win, !getAddedWindowSettings(win).isShellInterfaceHidden);
}

function setShellInterfaceHidden (win, isShellInterfaceHidden) {
  updateAddedWindowSettings(win, {isShellInterfaceHidden});
  if (win.setWindowButtonVisibility) {
    win.setWindowButtonVisibility(!isShellInterfaceHidden);
  }
  sessionWatcher.updateState(win, {isShellInterfaceHidden});
  emitReplaceState(win);
  win.emit('resize');
}

function toggleSidebarHidden (win) {
  setSidebarHidden(win, !getAddedWindowSettings(win).isSidebarHidden);
}

function setSidebarHidden (win, isSidebarHidden) {
  updateAddedWindowSettings(win, {isSidebarHidden});
  sessionWatcher.updateState(win, {isSidebarHidden});
  emitReplaceState(win);
  win.emit('resize');
}

// internal methods
// =

function windowWithinBounds (windowState, bounds) {
  return windowState.x >= bounds.x &&
    windowState.y >= bounds.y &&
    windowState.x + windowState.width <= bounds.x + bounds.width &&
    windowState.y + windowState.height <= bounds.y + bounds.height
}

function userWantsToRestoreSession () {
  let answer = electron.dialog.showMessageBoxSync({
    type: 'question',
    message: 'Sorry! It looks like Wallets did not exit properly',
    detail: 'Would you like to restore your previous browsing session?',
    buttons: [ 'Restore Session', 'Start New Session' ],
    defaultId: 0,
    icon: ICON_PATH
  });
  return answer === 0
}

function restoreBrowsingSession (previousSessionState) {
  let { windows } = previousSessionState;
  if (windows.length) {
    for (let windowState of windows) {
      if (windowState) {
        createShellWindow(windowState);
      }
    }
  } else {
    createShellWindow();
  }
}

function getPreviousBrowsingSession () {
  var restoredState = {};
  try {
    restoredState = userDataDir.read(BROWSING_SESSION_PATH, 'json');
  } catch (err) {
    // For some reason json can't be read (might be corrupted).
    // No worries, we have defaults.
    console.error('Failed to read previous browsing session state', err);
  }
  return Object.assign({}, defaultBrowsingSessionState(), restoredState)
}

function lastWindowPositioning () {
  var activeWin = getActiveWindow();
  if (activeWin) {
    return activeWin.getBounds()
  }
  return getLastRecordedPositioning()
}

function ensureVisibleOnSomeDisplay (windowState) {
  // HACK
  // for some reason, electron.screen comes back null sometimes
  // not sure why, shouldn't be happening
  // check for existence for now, see #690
  // -prf
  const screen = getScreenAPI();
  var visible = screen && screen.getAllDisplays().some(display => windowWithinBounds(windowState, display.bounds));
  if (!visible) {
    // Window is partially or fully not visible now.
    // Reset it to safe defaults.
    return Object.assign({}, windowState, _pick(defaultWindowState(), ['x', 'y', 'width', 'height', 'minWidth', 'minHeight']))
  }
  return windowState
}

// shortcut event handlers
// =

function onClose (win) {
  return e => {
    numActiveWindows--;
    if (numActiveWindows === 0) {
      // emit a custom 'window-all-closed'
      // we need to do this because we have hidden windows running additional behaviors
      electron.app.emit('custom-window-all-closed');
    }

    // deny any outstanding permission requests
    denyAllRequests(win);
  }
}

function onGoBack () {
  var win = electron.BrowserWindow.getFocusedWindow();
  getActive(win).webContents.goBack();
}

function onGoForward () {
  var win = electron.BrowserWindow.getFocusedWindow();
  getActive(win).webContents.goForward();
}

function onReload () {
  var win = electron.BrowserWindow.getFocusedWindow();
  getActive(win).webContents.reload();
}

function onFocusLocation () {
  var win = electron.BrowserWindow.getFocusedWindow();
  win.webContents.send('command', 'focus-location');
}

function onAppCommand (win, e, cmd) {
  // handles App Command events (Windows)
  // see https://electronjs.org/docs/all#event-app-command-windows
  switch (cmd) {
    case 'browser-backward':
      getActive(win).webContents.goBack();
      break
    case 'browser-forward':
      getActive(win).webContents.goForward();
      break
  }
}

// tab switcher input handling
// =

function globalTabSwitcherKeyHandler (e, input) {
  var win = getActiveWindow();

  if (input.type === 'keyDown' && input.key === 'Tab' && input.control) {
    if (!isTabSwitcherActive[win.id]) {
      isTabSwitcherActive[win.id] = true;
      show$6(win);
    } else {
      if (input.shift) {
        moveSelection(win, -1);
      } else {
        moveSelection(win, 1);
      }
    }
  } else if (isTabSwitcherActive[win.id] && input.type === 'keyUp' && input.key === 'Control') {
    isTabSwitcherActive[win.id] = false;
    hide$6(win);
  }
}

// helpers
// =

function getScreenAPI () {
  return require('electron').screen
}

async function gitCloneToTmp (url) {
  var dir = await fs__default.promises.mkdtemp(path__default.join(os.tmpdir(), `beaker-git-`));
  try {
    await git.clone({fs: fs__default, http, dir, url});
  } catch (e) {
    if (!url.endsWith('.git') && e.toString().includes('404')) {
      return gitCloneToTmp(url + '.git')
    }
    throw e
  }
  return dir
}

// globals
// =

var db$3;
var migrations$3;
var events$8 = new EventEmitter__default();

// exported methods
// =

const WEBAPI$3 = {
  listAuditLog: list,
  streamAuditLog: stream$1,
  getAuditLogStats: stats
};

/**
 * @param {Object} opts
 * @param {string} opts.userDataPath
 */
async function setup$j (opts) {
  // open database
  var dbPath = path__default.join(opts.userDataPath, 'AuditLog');
  db$3 = new sqlite3.Database(dbPath);
  await setupSqliteDB(db$3, {migrations: migrations$3}, '[AUDIT-LOG]');
  db$3.run('delete from hyperdrive_ops;'); // clear history
}

async function record (caller, method, args, writeSize, fn, opts) {
  var ts = Date.now();
  var res;
  try {
    res = await fn();
    return res
  } finally {
    var runtime = Date.now() - ts;
    if (!opts || !opts.ignoreFast || runtime > 100) {
      var target;
      if (args.url) {
        target = extractHostname(args.url);
        delete args.url;
      }
      caller = extractOrigin$2(caller);
      if (method === 'query' && args.drive) {
        // massage the opts
        args = Object.assign({}, args);
        if (Array.isArray(args.drive)) {
          args.drive = args.drive.map(d => d.url);
        } else {
          args.drive = args.drive.url;
        }
      }
      insert('hyperdrive_ops', {
        caller,
        method,
        target,
        args: args ? JSON.stringify(args) : args,
        writeSize,
        ts,
        runtime
      }, res);
      if (writeSize) insert('hyperdrive_write_stats', {caller, writeSize});
    }
  }
}

async function list ({keys, caller, offset, limit} = {keys: [], caller: undefined, offset: 0, limit: 100}) {
  var query = knex('hyperdrive_ops').select(...(keys || [])).offset(offset).limit(limit).orderBy('rowid', 'desc');
  if (caller) {
    query = query.where({caller: extractOrigin$2(caller)});
  }
  var queryAsSql = query.toSQL();
  return cbPromise(cb => db$3.all(queryAsSql.sql, queryAsSql.bindings, cb))
}

async function stream$1 ({caller, includeResponse} = {caller: undefined, includeResponse: false}) {
  if (caller) caller = extractOrigin$2(caller);
  var s = new stream$2.Readable({
    read () {},
    objectMode: true
  });
  const onData = (detail, response) => {
    if (caller && detail.caller !== caller) return
    if (includeResponse) detail.response = response;
    s.push(['data', {detail}]);
  };
  events$8.on('insert', onData);
  s.on('close', e => events$8.removeListener('insert', onData));
  return s
}

async function stats () {
  var query = knex('hyperdrive_ops').select().orderBy('runtime', 'desc').toSQL();
  var rows = await cbPromise(cb => db$3.all(query.sql, query.bindings, cb));
  var stats = {
    runtime: {
      avg: 0,
      stdDev: 0,
      longest10: rows.slice(0, 10)
    }
  };
  stats.runtime.avg = rows.reduce((acc, row) => acc + row.runtime, 0) / rows.length;
  stats.runtime.stdDev = Math.sqrt(
   (rows
      .map(row => Math.pow(row.runtime - stats.runtime.avg, 2)) // (v-mean)^2
      .reduce((acc, v) => acc + v, 0)
    ) / rows.length // averaged
  );
  return stats
}

// internal methods
// =

function insert (table, data, response) {
  var query = knex(table).insert(data);
  var queryAsSql = query.toSQL();
  db$3.run(queryAsSql.sql, queryAsSql.bindings);
  events$8.emit('insert', data, response);
}

/**
 * @param {string} originURL
 * @returns {string}
 */
function extractOrigin$2 (originURL) {
  if (!originURL || !originURL.includes('://')) return originURL
  var urlp = parseDriveUrl(originURL);
  if (!urlp || !urlp.host || !urlp.protocol) return
  return (urlp.protocol + '//' + urlp.host + (urlp.port ? `:${urlp.port}` : ''))
}

/**
 * @param {string} originURL
 * @returns {string}
 */
function extractHostname (originURL) {
  var urlp = parseDriveUrl(originURL);
  return urlp.host
}

migrations$3 = [
  // version 1
  function (cb) {
    db$3.exec(`
      CREATE TABLE hyperdrive_ops (
        caller NOT NULL,
        method NOT NULL,
        target,
        args,
        ts,
        runtime,
        writeSize
      );
      CREATE INDEX hyperdrive_ops_caller ON hyperdrive_ops (caller);
      CREATE INDEX hyperdrive_ops_target ON hyperdrive_ops (target);
      CREATE TABLE hyperdrive_write_stats (
        caller NOT NULL,
        writeSize
      );
      CREATE INDEX hyperdrive_write_stats_caller ON hyperdrive_write_stats (caller);
      PRAGMA user_version = 1;
    `, cb);
  }
];

var auditLog = /*#__PURE__*/Object.freeze({
  __proto__: null,
  WEBAPI: WEBAPI$3,
  setup: setup$j,
  record: record,
  list: list,
  stream: stream$1,
  stats: stats
});

moment.updateLocale('en', {
  relativeTime: {s: 'seconds'}
});

// this is a wrapper for any behavior that needs to maintain a timeout
// you call it like this:
/*
timer(30e3, async (checkin, pause, resume) => {
  checkin('doing work')
  await work()

  checkin('doing other work')
  await otherWork()

  pause() // dont count this period against the timeout
  await askUserSomething()
  resume() // resume the timeout

  checkin('finishing')
  return finishing()
})
*/
// Rules of usage:
// - Call `checkin` after a period of async work to give the timer a chance to
//   abort further work. If the timer has expired, checkin() will stop running.
// - Give `checkin` a description of the task if you want the timeouterror to be
//   descriptive.
function timer (ms, fn) {
  var currentAction;
  var isTimedOut = false;

  // no timeout?
  if (!ms) return fn(noop$1, noop$1, noop$1)

  return new Promise((resolve, reject) => {
    var timer;
    var remaining = ms;
    var start;

    const checkin = action => {
      if (isTimedOut) throw new beakerErrorConstants.TimeoutError() // this will abort action, but the wrapping promise is already rejected
      if (action) currentAction = action;
    };
    const pause = () => {
      clearTimeout(timer);
      remaining -= (Date.now() - start);
    };
    const resume = () => {
      if (isTimedOut) return
      clearTimeout(timer);
      start = Date.now();
      timer = setTimeout(onTimeout, remaining);
    };
    const onTimeout = () => {
      isTimedOut = true;
      reject(new beakerErrorConstants.TimeoutError(currentAction ? `Timed out while ${currentAction}` : undefined));
    };

    // call the fn to get the promise
    var promise = fn(checkin, pause, resume);

    // start the timer
    resume();

    // wrap the promise
    promise.then(
      val => {
        clearTimeout(timer);
        resolve(val);
      },
      err => {
        clearTimeout(timer);
        reject(err);
      }
    );
  })
}

function noop$1 () {}

// typedefs
// =

/**
 * @typedef {import('../dat/daemon').DaemonHyperdrive} DaemonHyperdrive
 * 
 * @typedef {Object} FSQueryOpts
 * @prop {string|string[]} path
 * @prop {string} [type]
 * @prop {string} [mount]
 * @prop {Object} [metadata]
 * @prop {string} [sort] - 'name', 'ctime', 'mtime'
 * @prop {boolean} [reverse]
 * @prop {number} [limit]
 * @prop {number} [offset]
 * 
 * @typedef {Object} Stat
 * @prop {number} mode
 * @prop {number} size
 * @prop {number} offset
 * @prop {number} blocks
 * @prop {Date} atime
 * @prop {Date} mtime
 * @prop {Date} ctime
 * @prop {Object} metadata
 * @prop {Object} [mount]
 * @prop {string} [mount.key]
 * @prop {string} linkname
 *  
 * @typedef {Object} FSQueryResult
 * @prop {string} type
 * @prop {string} path
 * @prop {string} url
 * @prop {Stat} stat
 * @prop {string} drive
 * @prop {string} [mount]
 * @prop {Object} origin
 * @prop {string} origin.path
 * @prop {string} origin.drive
 * @prop {string} origin.url
 */

// exported api
// =

// query({type: 'mount', path: ['/profile', '/profile/follows/*', '/profile/follows/*/follows/*']})
// => [{type: 'mount', path: '/profile', stat, mount, drive}, {type: 'mount', path: '/profile/friend/bob', stat, mount, drive}, ...]

// query({type: 'mount', mount: url, path: ['/profile/follows/*', '/profile/follows/*/follows/*']})
// => [{type: 'mount', path: '/profile/friend/bob', stat, mount, drive}, ...]

// query({type: 'file', metadata: {href: url}, path: ['/profile/comments', '/profile/follows/*/comments', '/profile/follows/*/follows/*/comments']})
// => [{type: 'folder', path: '/profile/comments/foo.txt', stat, drive}]

/**
 * @param {DaemonHyperdrive} root
 * @param {FSQueryOpts} opts
 * @returns {Promise<FSQueryResult[]>}
 */
async function query$1 (root, opts) {
  // validate opts
  if (!opts || !opts.path) throw new Error('The `path` parameter is required')
  if (!(typeof opts.path === 'string' || (Array.isArray(opts.path) && opts.path.every(v => typeof v === 'string')))) {
    throw new Error('The `path` parameter must be a string or array of strings')
  }
  if (opts.type && typeof opts.type !== 'string') {
    throw new Error('The `type` parameter must be a string')
  }
  if (opts.mount && typeof opts.mount !== 'string') {
    throw new Error('The `mount` parameter must be a string')
  }
  if (opts.metadata && typeof opts.metadata !== 'object') {
    throw new Error('The `metadata` parameter must be an object')
  }

  // massage opts
  if (opts.mount) {
    opts.mount = await resolveName(opts.mount);
    opts.mount = HYPERDRIVE_HASH_REGEX.exec(opts.mount)[0];
  }

  var keyToUrlCache = {};
  async function keyToUrl (key) {
    if (keyToUrlCache[key]) return keyToUrlCache[key]
    var domain = await reverseResolve(key);
    if (!domain) domain = key;
    keyToUrlCache[key] = `hyper://${domain}/`;
    return keyToUrlCache[key]
  }

  // iterate all matching paths and match against the query
  var candidates = await expandPaths(root, opts.path);
  var results = [];
  await chunkMapAsync(candidates, 100, async (item) => {
    let {path, stat, originDriveKey, originPath} = item;

    var type = 'file';
    if (stat.mount && stat.mount.key) type = 'mount';
    else if (stat.isDirectory()) type = 'directory';

    if (opts.type && type !== opts.type) return
    if (opts.mount && (type !== 'mount' || stat.mount.key.toString('hex') !== opts.mount)) return
    if (opts.metadata) {
      let metaMatch = true;
      for (let k in opts.metadata) {
        if (stat.metadata[k] !== opts.metadata[k]) {
          metaMatch = false;
          break
        }
      }
      if (!metaMatch) return
    }

    var originDrive = await keyToUrl(originDriveKey);
    results.push({
      type,
      path,
      drive: root.url,
      url: joinPath(root.url, path),
      stat,
      mount: type === 'mount' ? await keyToUrl(stat.mount.key.toString('hex')) : undefined,
      origin: {
        path: originPath,
        drive: originDrive,
        url: joinPath(originDrive, originPath)
      }
    });
  });

  if (opts.sort === 'name') {
    results.sort((a, b) => (opts.reverse) ? path.basename(b.path).toLowerCase().localeCompare(path.basename(a.path).toLowerCase()) : path.basename(a.path).toLowerCase().localeCompare(path.basename(b.path).toLowerCase()));
  } else if (opts.sort === 'mtime') {
    results.sort((a, b) => (opts.reverse) ? b.stat.mtime - a.stat.mtime : a.stat.mtime - b.stat.mtime);
  } else if (opts.sort === 'ctime') {
    results.sort((a, b) => (opts.reverse) ? b.stat.ctime - a.stat.ctime : a.stat.ctime - b.stat.ctime);
  }

  if (opts.offset && opts.limit) results = results.slice(opts.offset, opts.offset + opts.limit);
  else if (opts.offset) results = results.slice(opts.offset);
  else if (opts.limit) results = results.slice(0, opts.limit);

  return results
}

// internal
// =

async function expandPaths (root, patterns) {
  var matches = [];
  patterns = Array.isArray(patterns) ? patterns : [patterns];
  await Promise.all(patterns.map(async (pattern) => {
    // parse the pattern into a set of ops
    let ops = [];
    for (let part of pattern.split('/')) {
      ops.push([part.includes('*') ? 'match' : 'push', part]);
    }

    // run the ops to assemble a list of matching paths
    var workingPaths = [{path: '/', originPath: '/', originDriveKey: root.key.toString('hex'), stat: undefined}];
    for (let i = 0; i < ops.length; i++) {
      let op = ops[i];
      let newWorkingPaths = [];
      if (op[0] === 'push') {
        // add the given segment to all working paths
        newWorkingPaths = await Promise.all(workingPaths.map(async (workingPath) => {
          let statpath = joinPath(workingPath.path, op[1]);
          let stat = await record(
            '-query',
            'stat',
            {url: root.url, path: statpath},
            undefined,
            () => root.pda.stat(statpath).catch(err => undefined)
          );
          if (!stat) return undefined
          let statMountKey = stat.mount && stat.mount.key ? stat.mount.key.toString('hex') : undefined;
          let isNewMount = statMountKey && statMountKey !== workingPath.originDriveKey;
          return {
            path: statpath,
            originPath: isNewMount ? '/' : joinPath(workingPath.originPath, op[1]),
            originDriveKey: isNewMount ? statMountKey : workingPath.originDriveKey,
            stat: stat
          }
        }));
        newWorkingPaths = newWorkingPaths.filter(Boolean);
      } else if (op[0] === 'match') {
        // compile a glob-matching regex from the segment
        var re = new RegExp(`^${op[1].replace(/\*/g, '[^/]*')}$`, 'i');
        
        // read the files at each working path
        for (let workingPath of workingPaths) {
          let items = await record(
            '-query',
            'readdir',
            {url: root.url, path: workingPath.path, includeStats: true},
            undefined,
            () => root.pda.readdir(workingPath.path, {includeStats: true}).catch(e => [])
          );
          for (let item of items) {
            // add matching names to the working path
            if (re.test(item.name)) {
              let statMountKey = item.stat.mount && item.stat.mount.key ? item.stat.mount.key.toString('hex') : undefined;
              let isNewMount = statMountKey && statMountKey !== workingPath.originDriveKey;
              newWorkingPaths.push({
                path: joinPath(workingPath.path, item.name),
                originPath: isNewMount ? '/' : joinPath(workingPath.originPath, item.name),
                originDriveKey: isNewMount ? item.stat.mount.key.toString('hex') : workingPath.originDriveKey,
                stat: item.stat
              });
            }
          }
        }
      }
      workingPaths = newWorkingPaths;
    }
    
    // emit the results
    for (let result of workingPaths) {
      matches.push(result);
    }
  }));
  return matches
}

// TODO!!
// put these tests somewhere!!
// const _get = require('lodash.get')
// const _isEqual = require('lodash.isequal')
// const assert = require('assert')
// const toArray = require('async-iterator-to-array')

// const RootMockPaths = {
//   foo: {
//     bar: {
//       baz: {
//         biz: {},
//         biz2: {},
//         biz3: {}
//       },
//       baz2: {
//         biz: {},
//         biz2: {},
//         biz3: {}
//       },
//       baz3: {
//         biz: {},
//         biz2: {},
//         biz3: {}
//       }
//     },
//     bar2: {
//       baz: {
//         biz: {},
//         biz2: {},
//         biz3: {}
//       },
//       baz2: {
//         biz: {},
//         biz2: {},
//         biz3: {}
//       },
//       baz3: {
//         biz: {},
//         biz2: {},
//         biz3: {}
//       }
//     },
//     bar3: {
//       baz: {
//         biz: {},
//         biz2: {},
//         biz3: {}
//       },
//       baz2: {
//         biz: {},
//         biz2: {},
//         biz3: {}
//       },
//       baz3: {
//         biz: {},
//         biz2: {},
//         biz3: {}
//       }
//     }
//   },
//   foo2: {
//     bar: {
//       baz: {
//         biz: {},
//         biz2: {},
//         biz3: {}
//       },
//       baz2: {
//         biz: {},
//         biz2: {},
//         biz3: {}
//       },
//       baz3: {
//         biz: {},
//         biz2: {},
//         biz3: {}
//       }
//     },
//     bar2: {
//       baz: {
//         biz: {},
//         biz2: {},
//         biz3: {}
//       },
//       baz2: {
//         biz: {},
//         biz2: {},
//         biz3: {}
//       },
//       baz3: {
//         biz: {},
//         biz2: {},
//         biz3: {}
//       }
//     },
//     bar3: {
//       baz: {
//         biz: {},
//         biz2: {},
//         biz3: {}
//       },
//       baz2: {
//         biz: {},
//         biz2: {},
//         biz3: {}
//       },
//       baz3: {
//         biz: {},
//         biz2: {},
//         biz3: {}
//       }
//     }
//   },
//   foo3: {
//     bar: {
//       baz: {
//         biz: {},
//         biz2: {},
//         biz3: {}
//       },
//       baz2: {
//         biz: {},
//         biz2: {},
//         biz3: {}
//       },
//       baz3: {
//         biz: {},
//         biz2: {},
//         biz3: {}
//       }
//     },
//     bar2: {
//       baz: {
//         biz: {},
//         biz2: {},
//         biz3: {}
//       },
//       baz2: {
//         biz: {},
//         biz2: {},
//         biz3: {}
//       },
//       baz3: {
//         biz: {},
//         biz2: {},
//         biz3: {}
//       }
//     },
//     bar3: {
//       baz: {
//         biz: {},
//         biz2: {},
//         biz3: {}
//       },
//       baz2: {
//         biz: {},
//         biz2: {},
//         biz3: {}
//       },
//       baz3: {
//         biz: {},
//         biz2: {},
//         biz3: {}
//       }
//     }
//   }
// }

// const RootMock = {
//   async readdir (path) {
//     path = path.replace(/\./g, '')
//     path = path.split('/').filter(Boolean).join('.')
//     if (!path) return Object.keys(RootMockPaths)
//     return Object.keys(_get(RootMockPaths, path) || {})
//   }
// }

// async function test () {
//   assert(_isEqual(await toArray(expandPaths(RootMock, ['/'])), ['/']))
//   assert(_isEqual(await toArray(expandPaths(RootMock, ['/foo'])), ['/foo']))
//   assert(_isEqual(await toArray(expandPaths(RootMock, ['/*'])), ['/foo', '/foo2', '/foo3']))
//   assert(_isEqual(await toArray(expandPaths(RootMock, ['/*oo'])), ['/foo']))
//   assert(_isEqual(await toArray(expandPaths(RootMock, ['/*oo*'])), ['/foo', '/foo2', '/foo3']))
//   assert(_isEqual(await toArray(expandPaths(RootMock, ['/*/bar'])), ['/foo/bar', '/foo2/bar', '/foo3/bar']))
//   assert(_isEqual(await toArray(expandPaths(RootMock, ['/f*/bar'])), ['/foo/bar', '/foo2/bar', '/foo3/bar']))
//   assert(_isEqual(await toArray(expandPaths(RootMock, ['/foo/*'])), ['/foo/bar', '/foo/bar2', '/foo/bar3']))
//   assert(_isEqual(await toArray(expandPaths(RootMock, ['/*oo/*'])), ['/foo/bar', '/foo/bar2', '/foo/bar3']))
//   assert(_isEqual(await toArray(expandPaths(RootMock, ['/foo/*/baz'])), ['/foo/bar/baz', '/foo/bar2/baz', '/foo/bar3/baz']))
//   assert(_isEqual(await toArray(expandPaths(RootMock, ['/foo/*/baz/*'])), [
//     '/foo/bar/baz/biz',
//     '/foo/bar/baz/biz2',
//     '/foo/bar/baz/biz3',
//     '/foo/bar2/baz/biz',
//     '/foo/bar2/baz/biz2',
//     '/foo/bar2/baz/biz3',
//     '/foo/bar3/baz/biz',
//     '/foo/bar3/baz/biz2',
//     '/foo/bar3/baz/biz3'
//   ]))
//   assert(_isEqual(await toArray(expandPaths(RootMock, ['/foo/*/*/biz'])), [
//     '/foo/bar/baz/biz',
//     '/foo/bar/baz2/biz',
//     '/foo/bar/baz3/biz',
//     '/foo/bar2/baz/biz',
//     '/foo/bar2/baz2/biz',
//     '/foo/bar2/baz3/biz',
//     '/foo/bar3/baz/biz',
//     '/foo/bar3/baz2/biz',
//     '/foo/bar3/baz3/biz'
//   ]))
//   assert(_isEqual(await toArray(expandPaths(RootMock, ['/', '/foo', '/*/bar'])), ['/', '/foo', '/foo/bar', '/foo2/bar', '/foo3/bar']))
//   console.log('done')
// }

// test()

// exported api
// =

var drivesAPI = {
  async get (key) {
    key = await fromURLToKey(key, true);
    var drive = listDrives$1().find(drive => drive.key === key);
    var info = await getDriveInfo(key, {onlyCache: true}).catch(e => ({}));
    var url = `hyper://${key}/`;
    var ident = getDriveIdent(url);
    return {
      key,
      url,
      info,
      saved: !!drive,
      forkOf: drive ? drive.forkOf : undefined,
      ident
    }
  },

  async list (opts) {
    return assembleRecords(listDrives$1(opts))
  },

  async getForks (key) {
    key = await fromURLToKey(key, true);
    var drivesList = listDrives$1();
    var rootDrive = drivesList.find(drive => drive.key === key);
    if (!rootDrive) return assembleRecords([{key}])

    // find root of the tree
    var seenKeys = new Set(); // used to break cycles
    while (rootDrive && rootDrive.forkOf && rootDrive.forkOf.key && !seenKeys.has(rootDrive.forkOf.key)) {
      seenKeys.add(rootDrive.key);
      rootDrive = drivesList.find(drive2 => drive2.key === rootDrive.forkOf.key);
    }
    if (!rootDrive) return []

    // build the tree
    var forks = [];
    function addForksOf (drive) {
      if (forks.includes(drive)) return // cycle
      forks.push(drive);
      for (let drive2 of drivesList) {
        if (drive2.forkOf && drive2.forkOf.key === drive.key) {
          addForksOf(drive2);
        }
      }
    }
    addForksOf(rootDrive);

    return assembleRecords(forks)
  },

  async configure (key, opts) {
    return configDrive(key, opts)
  },

  async remove (key) {
    return removeDrive(key)
  },

  async collectTrash () {
    return collect({olderThan: 0})
  },

  async delete (url) {
    // TODO
    // var drive = await drives.getOrLoadDrive(url)
    // assertDriveDeletable(drive.key)
    // await datLibrary.configureDrive(drive, {isSaved: false})
    // await drives.unloadDrive(drive.key)
    // var bytes = await archivesDb.deleteArchive(drive.key)
    // return {bytes}
  },

  async touch (key, timeVar, value) {
    return touch(key, timeVar, value)
  },

  async clearFileCache (url) {
    return clearFileCache(await fromURLToKey(url, true))
  },

  clearDnsCache () {
    hyper.dns.flushCache();
  },

  createEventStream () {
    return createEventStream()
  },

  getDebugLog (key) {
    return getDebugLog()
  },

  createDebugStream () {
    return createDebugStream()
  }
};

// internal methods
// =

async function assembleRecords (drivesList) {
  var records = [];
  for (let drive of drivesList) {
    let url = `hyper://${drive.key}/`;
    let ident = getDriveIdent(url);
    records.push({
      key: drive.key,
      url,
      tags: drive.tags || [],
      info: await getDriveInfo(drive.key, {onlyCache: true}),
      saved: true,
      forkOf: drive ? drive.forkOf : undefined,
      ident
    });
  }
  return records
}

// exported api
// =

const to = (opts) =>
  (opts && typeof opts.timeout !== 'undefined')
    ? opts.timeout
    : DEFAULT_DRIVE_API_TIMEOUT;

var hyperdriveAPI = {
  async createDrive ({title, description, tags, author, visibility, fromGitUrl, prompt} = {}) {
    var newDriveUrl;

    // only allow these vars to be set by beaker, for now
    if (!isWcTrusted(this.sender)) {
      fromGitUrl = undefined;
      visibility = undefined;
      author = undefined; // TODO _get(windows.getUserSessionFor(this.sender), 'url')
    }

    if (prompt !== false) {
      // run the creation modal
      let res;
      try {
        res = await create$3(this.sender, 'create-drive', {title, description, tags, author, visibility});
        if (res && res.gotoSync) {
          await create$3(this.sender, 'folder-sync', {url: res.url, closeAfterSync: true});
        }
      } catch (e) {
        if (e.name !== 'Error') {
          throw e // only rethrow if a specific error
        }
      }
      if (!res || !res.url) throw new beakerErrorConstants.UserDeniedError()
      newDriveUrl = res.url;
    } else {
      if (tags && typeof tags === 'string') {
        tags = tags.split(' ');
      } else if (tags && !Array.isArray(tags)) {
        tags = undefined;
      }
      tags = tags.filter(v => typeof v === 'string');

      // no modal, ask for permission
      await assertCreateDrivePermission(this.sender, {title, tags});

      let importFolder = undefined;
      if (fromGitUrl) {
        try {
          importFolder = await gitCloneToTmp(fromGitUrl);
        } catch (e) {
          throw new Error('Failed to clone git repo: ' + e.toString())
        }
      }

      // create
      let newDrive;
      try {
        let manifest = {title, description, /*TODO author,*/};
        newDrive = await createNewDrive(manifest);
        await configDrive(newDrive.url, {tags});
      } catch (e) {
        console.log(e);
        throw e
      }
      newDriveUrl = newDrive.url;

      // git clone if needed
      if (importFolder) {
        await pda__default.exportFilesystemToArchive({
          srcPath: importFolder,
          dstArchive: newDrive.session.drive,
          dstPath: '/',
          ignore: ['.git', '**/.git', 'index.json'],
          inplaceImport: true,
          dryRun: false
        });
      }
    }
    let newDriveKey = await lookupUrlDriveKey(newDriveUrl);

    if (!isWcTrusted(this.sender)) {
      // grant write permissions to the creating app
      grantPermission('modifyDrive:' + newDriveKey, this.sender.getURL());
    }
    return newDriveUrl
  },

  async forkDrive (url, {detached, title, description, tags, label, prompt} = {}) {
    var newDriveUrl;

    // only allow these vars to be set by beaker, for now
    if (!isWcTrusted(this.sender)) {
      label = undefined;
    }

    if (prompt !== false) {
      // run the fork modal
      let res;
      let forks = await drivesAPI.getForks(url);
      try {
        res = await create$3(this.sender, 'fork-drive', {url, title, description, tags, forks, detached, label});
      } catch (e) {
        if (e.name !== 'Error') {
          throw e // only rethrow if a specific error
        }
      }
      if (!res || !res.url) throw new beakerErrorConstants.UserDeniedError()
      newDriveUrl = res.url;
    } else {
      if (tags && typeof tags === 'string') {
        tags = tags.split(' ');
      } else if (tags && !Array.isArray(tags)) {
        tags = undefined;
      }
      tags = tags.filter(v => typeof v === 'string');

      // no modal, ask for permission
      await assertCreateDrivePermission(this.sender, {title, tags});

      let key = await lookupUrlDriveKey(url);

      // save the parent if needed
      if (!getDriveConfig(key)) {
        await configDrive(key);
      }

      // create
      let newDrive = await forkDrive(key, {
        title: detached ? title : undefined,
        description: detached ? description : undefined,
        detached
      });
      await configDrive(newDrive.url, {
        tags,
        forkOf: detached ? undefined : {key, label}
      });
      newDriveUrl = newDrive.url;
    }

    return newDriveUrl
  },

  async loadDrive (url) {
    if (!url || typeof url !== 'string') {
      return Promise.reject(new beakerErrorConstants.InvalidURLError())
    }
    var urlp = parseDriveUrl(url);
    await lookupDrive(this.sender, urlp.hostname, urlp.version);
    return Promise.resolve(true)
  },

  async getInfo (url, opts = {}) {
    return record(this.sender.getURL(), 'getInfo', {url}, undefined, () => (
      timer(to(opts), async (checkin, pause, resume) => {
        var urlp = parseDriveUrl(url);
        var {driveKey, version} = await lookupDrive(this.sender, urlp.hostname, urlp.version, true);
        var info = await getDriveInfo(driveKey);
        info.tags = getDriveConfig(driveKey)?.tags || [];
        var isCap = urlp.hostname.endsWith('.cap');

        // request from beaker internal sites: give all data
        if (isWcTrusted(this.sender)) {
          return info
        }

        pause(); // dont count against timeout, there may be user prompts
        await assertReadPermission(driveKey, this.sender);
        resume();

        // request from userland: return a subset of the data
        return {
          key: isCap ? urlp.hostname : info.key,
          url: isCap ? urlp.origin : info.url,
          // domain: info.domain, TODO
          writable: info.writable,

          // state
          version: info.version,
          peers: info.peers,

          // manifest
          title: info.title,
          description: info.description
        }
      })
    ))
  },

  async configure (url, settings, opts) {
    return record(this.sender.getURL(), 'configure', {url, ...settings}, undefined, () => (
      timer(to(opts), async (checkin, pause, resume) => {
        checkin('looking up drive');

        var urlp = parseDriveUrl(url);
        var {drive, checkoutFS, isHistoric} = await lookupDrive(this.sender, urlp.hostname, urlp.version);
        if (isHistoric) throw new beakerErrorConstants.ArchiveNotWritableError('Cannot modify a historic version')
        if (!settings || typeof settings !== 'object') throw new Error('Invalid argument')

        if (('tags' in settings) && isWcTrusted(this.sender)) {
          await configDrive(drive.url, {tags: settings.tags});
        }

        // only allow beaker to set these manifest updates for now
        if (!isWcTrusted(this.sender)) {
          delete settings.tags;
          delete settings.author;
        }

        // manifest updates
        let manifestUpdates = _pick(settings, DRIVE_CONFIGURABLE_FIELDS);
        if (!drive.writable || Object.keys(manifestUpdates).length === 0) {
          // no manifest updates
          return
        }

        pause(); // dont count against timeout, there may be user prompts
        var senderOrigin = extractOrigin(this.sender.getURL());
        await assertWritePermission(drive, this.sender);
        await assertQuotaPermission(drive, senderOrigin, Buffer.byteLength(JSON.stringify(settings), 'utf8'));
        resume();

        checkin('updating drive');
        await checkoutFS.pda.updateManifest(manifestUpdates);
        await pullLatestDriveMeta(drive);
      })
    ))
  },

  async diff (url, other, opts = {}) {
    var urlp = parseDriveUrl(url);
    var url = urlp.origin;
    var prefix = urlp.pathname;
    return record(this.sender.getURL(), 'diff', {url, other, prefix}, undefined, () => (
      timer(to(opts), async (checkin, pause, resume) => {
        checkin('looking up drive');
        const {checkoutFS} = await lookupDrive(this.sender, url, urlp.version);
        pause(); // dont count against timeout, there may be user prompts
        await assertReadPermission(checkoutFS, this.sender);
        resume();
        checkin('diffing');
        return checkoutFS.pda.diff(other, prefix)
      })
    ))
  },

  async stat (url, opts = {}) {
    var urlp = parseDriveUrl(url);
    var url = urlp.origin;
    var filepath = normalizeFilepath(urlp.pathname || '');
    return record(this.sender.getURL(), 'stat', {url, filepath}, undefined, () => (
      timer(to(opts), async (checkin, pause, resume) => {
        checkin('looking up drive');
        const {checkoutFS} = await lookupDrive(this.sender, urlp.hostname, urlp.version);
        pause(); // dont count against timeout, there may be user prompts
        await assertReadPermission(checkoutFS, this.sender, filepath);
        resume();
        checkin('stating file');
        return checkoutFS.pda.stat(filepath, opts)
      })
    ))
  },

  async readFile (url, opts = {}) {
    var urlp = parseDriveUrl(url);
    var url = urlp.origin;
    var filepath = normalizeFilepath(urlp.pathname || '');
    return record(this.sender.getURL(), 'readFile', {url, filepath, opts}, undefined, () => (
      timer(to(opts), async (checkin, pause, resume) => {
        checkin('looking up drive');
        const {checkoutFS} = await lookupDrive(this.sender, urlp.hostname, urlp.version);
        pause(); // dont count against timeout, there may be user prompts
        await assertReadPermission(checkoutFS, this.sender, filepath);
        resume();
        checkin('reading file');
        return checkoutFS.pda.readFile(filepath, opts)
      })
    ))
  },

  async writeFile (url, data, opts = {}) {
    var urlp = parseDriveUrl(url);
    var url = urlp.origin;
    var filepath = normalizeFilepath(urlp.pathname || '');
    if (typeof opts === 'string') {
      opts = {encoding: opts};
    }
    if (opts.encoding === 'json') {
      data = JSON.stringify(data, null, 2);
      opts.encoding = 'utf8';
    }
    const sourceSize = Buffer.byteLength(data, opts.encoding);
    return record(this.sender.getURL(), 'writeFile', {url, filepath}, sourceSize, () => (
      timer(to(opts), async (checkin, pause, resume) => {
        checkin('looking up drive');
        const {drive, checkoutFS, isHistoric} = await lookupDrive(this.sender, urlp.hostname, urlp.version);
        if (isHistoric) throw new beakerErrorConstants.ArchiveNotWritableError('Cannot modify a historic version')

        pause(); // dont count against timeout, there may be user prompts
        const senderOrigin = extractOrigin(this.sender.getURL());
        await assertWritePermission(drive, this.sender, filepath);
        await assertQuotaPermission(drive, senderOrigin, sourceSize);
        assertValidFilePath(filepath);
        assertUnprotectedFilePath(filepath, this.sender);
        resume();

        checkin('writing file');
        var res = await checkoutFS.pda.writeFile(filepath, data, opts);
        return res
      })
    ))
  },

  async unlink (url, opts = {}) {
    var urlp = parseDriveUrl(url);
    var url = urlp.origin;
    var filepath = normalizeFilepath(urlp.pathname || '');
    return record(this.sender.getURL(), 'unlink', {url, filepath}, undefined, () => (
      timer(to(opts), async (checkin, pause, resume) => {
        checkin('looking up drive');
        const {drive, checkoutFS, isHistoric} = await lookupDrive(this.sender, urlp.hostname, urlp.version);
        if (isHistoric) throw new beakerErrorConstants.ArchiveNotWritableError('Cannot modify a historic version')

        pause(); // dont count against timeout, there may be user prompts
        await assertWritePermission(drive, this.sender, filepath);
        assertUnprotectedFilePath(filepath, this.sender);
        resume();

        checkin('deleting file');
        var res = await checkoutFS.pda.unlink(filepath);
        return res
      })
    ))
  },

  async copy (url, dstpath, opts = {}) {
    var urlp = parseDriveUrl(url);
    var url = urlp.origin;
    var srcpath = normalizeFilepath(urlp.pathname || '');
    dstpath = normalizeFilepath(dstpath || '');
    const src = await lookupDrive(this.sender, urlp.hostname, urlp.version);
    const sourceSize = await src.drive.pda.readSize(srcpath);
    return record(this.sender.getURL(), 'copy', {url, srcpath, dstpath}, sourceSize, () => (
      timer(to(opts), async (checkin, pause, resume) => {
        checkin('searching for drive');

        const dst = await lookupDrive(this.sender, dstpath.includes('://') ? dstpath : url);

        if (srcpath.includes('://')) srcpath = normalizeFilepath((new URL(srcpath)).pathname);
        if (dstpath.includes('://')) dstpath = normalizeFilepath((new URL(dstpath)).pathname);

        pause(); // dont count against timeout, there may be user prompts
        const senderOrigin = extractOrigin(this.sender.getURL());
        await assertReadPermission(src.drive, this.sender, srcpath);
        await assertWritePermission(dst.drive, this.sender, dstpath);
        assertUnprotectedFilePath(dstpath, this.sender);
        await assertQuotaPermission(dst.drive, senderOrigin, sourceSize);
        resume();

        checkin('copying');
        var res = await src.checkoutFS.pda.copy(srcpath, dst.checkoutFS.session.drive, dstpath);
        return res
      })
    ))
  },

  async rename (url, dstpath, opts = {}) {
    var urlp = parseDriveUrl(url);
    var url = urlp.origin;
    var srcpath = normalizeFilepath(urlp.pathname || '');
    dstpath = normalizeFilepath(dstpath || '');
    return record(this.sender.getURL(), 'rename', {url, srcpath, dstpath}, undefined, () => (
      timer(to(opts), async (checkin, pause, resume) => {
        checkin('searching for drive');

        const src = await lookupDrive(this.sender, urlp.hostname, urlp.version);
        const dst = await lookupDrive(this.sender, dstpath.includes('://') ? dstpath : url);

        if (srcpath.includes('://')) srcpath = normalizeFilepath((new URL(srcpath)).pathname);
        if (dstpath.includes('://')) dstpath = normalizeFilepath((new URL(dstpath)).pathname);

        pause(); // dont count against timeout, there may be user prompts
        await assertWritePermission(src.drive, this.sender, srcpath);
        await assertWritePermission(dst.drive, this.sender, dstpath);
        assertValidPath(dstpath);
        assertUnprotectedFilePath(srcpath, this.sender);
        assertUnprotectedFilePath(dstpath, this.sender);
        resume();

        checkin('renaming file');
        var res = await src.checkoutFS.pda.rename(srcpath, dst.checkoutFS.session.drive, dstpath);
        return res
      })
    ))
  },

  async updateMetadata (url, metadata, opts = {}) {
    var urlp = parseDriveUrl(url);
    var url = urlp.origin;
    var filepath = normalizeFilepath(urlp.pathname || '');
    return record(this.sender.getURL(), 'updateMetadata', {url, filepath, metadata}, undefined, () => (
      timer(to(opts), async (checkin, pause, resume) => {
        checkin('looking up drive');
        const {drive, checkoutFS, isHistoric} = await lookupDrive(this.sender, urlp.hostname, urlp.version);
        if (isHistoric) throw new beakerErrorConstants.ArchiveNotWritableError('Cannot modify a historic version')

        pause(); // dont count against timeout, there may be user prompts
        await assertWritePermission(drive, this.sender, filepath);
        assertValidPath(filepath);
        resume();

        checkin('updating metadata');
        var res = await checkoutFS.pda.updateMetadata(filepath, metadata);
        return res
      })
    ))
  },

  async deleteMetadata (url, keys, opts = {}) {
    var urlp = parseDriveUrl(url);
    var url = urlp.origin;
    var filepath = normalizeFilepath(urlp.pathname || '');
    return record(this.sender.getURL(), 'deleteMetadata', {url, filepath, keys}, undefined, () => (
      timer(to(opts), async (checkin, pause, resume) => {
        checkin('looking up drive');
        const {drive, checkoutFS, isHistoric} = await lookupDrive(this.sender, urlp.hostname, urlp.version);
        if (isHistoric) throw new beakerErrorConstants.ArchiveNotWritableError('Cannot modify a historic version')

        pause(); // dont count against timeout, there may be user prompts
        await assertWritePermission(drive, this.sender, filepath);
        assertValidPath(filepath);
        resume();

        checkin('updating metadata');
        var res = await checkoutFS.pda.deleteMetadata(filepath, keys);
        return res
      })
    ))
  },

  async readdir (url, opts = {}) {
    var urlp = parseDriveUrl(url);
    var url = urlp.origin;
    var filepath = normalizeFilepath(urlp.pathname || '');
    return record(this.sender.getURL(), 'readdir', {url, filepath, opts}, undefined, () => (
      timer(to(opts), async (checkin, pause, resume) => {
        checkin('searching for drive');
        const {checkoutFS} = await lookupDrive(this.sender, urlp.hostname, urlp.version);

        pause(); // dont count against timeout, there may be user prompts
        await assertReadPermission(checkoutFS, this.sender, filepath);
        resume();

        checkin('reading directory');
        var names = await checkoutFS.pda.readdir(filepath, opts);
        if (opts.includeStats) {
          names = names.map(obj => ({name: obj.name, stat: obj.stat}));
        }
        return names
      })
    ))
  },

  async mkdir (url, opts) {
    var urlp = parseDriveUrl(url);
    var url = urlp.origin;
    var filepath = normalizeFilepath(urlp.pathname || '');
    return record(this.sender.getURL(), 'mkdir', {url, filepath, opts}, undefined, () => (
      timer(to(opts), async (checkin, pause, resume) => {
        checkin('searching for drive');
        const {drive, checkoutFS, isHistoric} = await lookupDrive(this.sender, urlp.hostname, urlp.version);
        if (isHistoric) throw new beakerErrorConstants.ArchiveNotWritableError('Cannot modify a historic version')

        pause(); // dont count against timeout, there may be user prompts
        await assertWritePermission(drive, this.sender);
        await assertValidPath(filepath);
        assertUnprotectedFilePath(filepath, this.sender);
        resume();

        checkin('making directory');
        var res = await checkoutFS.pda.mkdir(filepath, opts);
        return res
      })
    ))
  },

  async rmdir (url, opts = {}) {
    var urlp = parseDriveUrl(url);
    var url = urlp.origin;
    var filepath = normalizeFilepath(urlp.pathname || '');
    return record(this.sender.getURL(), 'rmdir', {url, filepath, opts}, undefined, () => (
      timer(to(opts), async (checkin, pause, resume) => {
        checkin('searching for drive');
        const {drive, checkoutFS, isHistoric} = await lookupDrive(this.sender, urlp.hostname, urlp.version);
        if (isHistoric) throw new beakerErrorConstants.ArchiveNotWritableError('Cannot modify a historic version')

        pause(); // dont count against timeout, there may be user prompts
        await assertWritePermission(drive, this.sender);
        assertUnprotectedFilePath(filepath, this.sender);
        resume();

        checkin('removing directory');
        var res = await checkoutFS.pda.rmdir(filepath, opts);
        return res
      })
    ))
  },

  async symlink (url, linkname, opts) {
    var urlp = parseDriveUrl(url);
    var url = urlp.origin;
    var target = normalizeFilepath(urlp.pathname || '');
    linkname = normalizeFilepath(linkname || '');
    return record(this.sender.getURL(), 'symlink', {url, target, linkname}, undefined, () => (
      timer(to(opts), async (checkin, pause, resume) => {
        checkin('searching for drive');
        const {drive, checkoutFS, isHistoric} = await lookupDrive(this.sender, urlp.hostname, urlp.version);
        if (isHistoric) throw new beakerErrorConstants.ArchiveNotWritableError('Cannot modify a historic version')

        pause(); // dont count against timeout, there may be user prompts
        await assertReadPermission(drive, this.sender, target);
        await assertWritePermission(drive, this.sender, linkname);
        await assertValidPath(linkname);
        assertUnprotectedFilePath(linkname, this.sender);
        resume();

        checkin('symlinking');
        var res = await checkoutFS.pda.symlink(target, linkname);
        return res
      })
    ))
  },

  async mount (url, mount, opts) {
    var urlp = parseDriveUrl(url);
    var url = urlp.origin;
    var filepath = normalizeFilepath(urlp.pathname || '');
    var mountKey = typeof mount === "object" ? mount.key : mount;
    if (mountKey.includes('.cap')) throw new Error('Unable to mount capability URLs')
    return record(this.sender.getURL(), 'mount', {url, filepath, opts}, undefined, () => (
      timer(to(opts), async (checkin, pause, resume) => {
        checkin('searching for drive');
        const {drive, checkoutFS, isHistoric} = await lookupDrive(this.sender, urlp.hostname, urlp.version);
        if (isHistoric) throw new beakerErrorConstants.ArchiveNotWritableError('Cannot modify a historic version')

        pause(); // dont count against timeout, there may be user prompts
        await assertWritePermission(drive, this.sender);
        await assertValidPath(filepath);
        assertUnprotectedFilePath(filepath, this.sender);
        resume();

        checkin('mounting drive');
        var res = await checkoutFS.pda.mount(filepath, mount);
        return res
      })
    ))
  },

  async unmount (url, opts = {}) {
    var urlp = parseDriveUrl(url);
    var url = urlp.origin;
    var filepath = normalizeFilepath(urlp.pathname || '');
    return record(this.sender.getURL(), 'unmount', {url, filepath, opts}, undefined, () => (
      timer(to(opts), async (checkin, pause, resume) => {
        checkin('searching for drive');
        const {drive, checkoutFS, isHistoric} = await lookupDrive(this.sender, urlp.hostname, urlp.version);
        if (isHistoric) throw new beakerErrorConstants.ArchiveNotWritableError('Cannot modify a historic version')

        pause(); // dont count against timeout, there may be user prompts
        await assertWritePermission(drive, this.sender);
        assertUnprotectedFilePath(filepath, this.sender);
        resume();

        checkin('unmounting drive');
        var res = await checkoutFS.pda.unmount(filepath);
        return res
      })
    ))
  },

  async query (opts) {
    if (!opts.drive) return []
    if (!Array.isArray(opts.drive)) opts.drive = [opts.drive];
    return record(this.sender.getURL(), 'query', opts, undefined, () => (
      timer(to(opts), async (checkin, pause, resume) => {
        checkin('looking up drives');
        var capUrls = {};
        for (let i = 0; i < opts.drive.length; i++) {
          let urlp = parseDriveUrl(opts.drive[i]);
          opts.drive[i] = (await
            record('-query', 'lookupDrive', {url: opts.drive[i]}, undefined, () => (
              lookupDrive(this.sender, urlp.hostname, urlp.version)
            ), {ignoreFast: true})
          ).checkoutFS;
          if (urlp.hostname.endsWith('.cap')) {
            capUrls[opts.drive[i].key.toString('hex')] = urlp.hostname;
          }
        }
        pause(); // dont count against timeout, there may be user prompts
        for (let drive of opts.drive) {
          await assertReadPermission(drive, this.sender);
        }
        resume();
        checkin('running query');
        var queryOpts = opts;
        if (opts.drive.length > 1) {
          // HACK we need to get more results in the individual drive queries so that we can correctly
          // merge, re-sort, and slice after -prf
          queryOpts = Object.assign({}, opts);
          queryOpts.limit = queryOpts.offset + queryOpts.limit;
          queryOpts.offset = 0;
        }
        var queriesResults = await Promise.all(opts.drive.map(drive => query$1(drive, queryOpts)));
        var results = _flattenDeep(queriesResults);
        if (opts.drive.length > 1) {
          // HACK re-sort and slice here because each query was run separately -prf
          if (opts.sort === 'name') {
            results.sort((a, b) => (opts.reverse) ? path__default.basename(b.path).toLowerCase().localeCompare(path__default.basename(a.path).toLowerCase()) : path__default.basename(a.path).toLowerCase().localeCompare(path__default.basename(b.path).toLowerCase()));
          } else if (opts.sort === 'mtime') {
            results.sort((a, b) => (opts.reverse) ? b.stat.mtime - a.stat.mtime : a.stat.mtime - b.stat.mtime);
          } else if (opts.sort === 'ctime') {
            results.sort((a, b) => (opts.reverse) ? b.stat.ctime - a.stat.ctime : a.stat.ctime - b.stat.ctime);
          }
          if (opts.offset && opts.limit) results = results.slice(opts.offset, opts.offset + opts.limit);
          else if (opts.offset) results = results.slice(opts.offset);
          else if (opts.limit) results = results.slice(0, opts.limit);
        }
        if (Object.keys(capUrls).length > 0) {
          // mask capability URLs
          for (let res of results) {
            for (let key in capUrls) {
              res.drive = res.drive.replace(key, capUrls[key]);
              res.url = res.url.replace(key, capUrls[key]);
            }
          }
        }
        return results
      })
    ))
  },

  async watch (url, pathPattern) {
    var {drive} = await lookupDrive(this.sender, url);
    await assertReadPermission(drive, this.sender);
    return drive.pda.watch(pathPattern)
  },

  async createNetworkActivityStream (url) {
    var {drive} = await lookupDrive(this.sender, url);
    await assertReadPermission(drive, this.sender);
    return drive.pda.createNetworkActivityStream()
  },

  async beakerDiff (srcUrl, dstUrl, opts) {
    assertBeakerOnly(this.sender);
    if (!srcUrl || typeof srcUrl !== 'string') {
      throw new beakerErrorConstants.InvalidURLError('The first parameter of diff() must be a hyperdrive URL')
    }
    if (!dstUrl || typeof dstUrl !== 'string') {
      throw new beakerErrorConstants.InvalidURLError('The second parameter of diff() must be a hyperdrive URL')
    }
    var [src, dst] = await Promise.all([lookupDrive(this.sender, srcUrl), lookupDrive(this.sender, dstUrl)]);
    return pda__default.diff(src.checkoutFS.pda, src.filepath, dst.checkoutFS.pda, dst.filepath, opts)
  },

  async beakerMerge (srcUrl, dstUrl, opts) {
    assertBeakerOnly(this.sender);
    if (!srcUrl || typeof srcUrl !== 'string') {
      throw new beakerErrorConstants.InvalidURLError('The first parameter of merge() must be a hyperdrive URL')
    }
    if (!dstUrl || typeof dstUrl !== 'string') {
      throw new beakerErrorConstants.InvalidURLError('The second parameter of merge() must be a hyperdrive URL')
    }
    var [src, dst] = await Promise.all([lookupDrive(this.sender, srcUrl), lookupDrive(this.sender, dstUrl)]);
    if (!dst.drive.writable) throw new beakerErrorConstants.ArchiveNotWritableError('The destination drive is not writable')
    if (dst.isHistoric) throw new beakerErrorConstants.ArchiveNotWritableError('Cannot modify a historic version')
    var res = await pda__default.merge(src.checkoutFS.pda, src.filepath, dst.checkoutFS.pda, dst.filepath, opts);
    return res
  },

  async importFromFilesystem (opts) {
    assertBeakerOnly(this.sender);
    var {checkoutFS, filepath, isHistoric} = await lookupDrive(this.sender, opts.dst);
    if (isHistoric) throw new beakerErrorConstants.ArchiveNotWritableError('Cannot modify a historic version')
    var res = await pda__default.exportFilesystemToArchive({
      srcPath: opts.src,
      dstArchive: checkoutFS.session ? checkoutFS.session.drive : checkoutFS,
      dstPath: filepath,
      ignore: opts.ignore,
      inplaceImport: opts.inplaceImport !== false,
      dryRun: opts.dryRun
    });
    return res
  },

  async exportToFilesystem (opts) {
    assertBeakerOnly(this.sender);

    // TODO do we need to replace this? -prf
    // if (await checkFolderIsEmpty(opts.dst) === false) {
    // return
    // }

    var {checkoutFS, filepath} = await lookupDrive(this.sender, opts.src);
    return pda__default.exportArchiveToFilesystem({
      srcArchive: checkoutFS.session ? checkoutFS.session.drive : checkoutFS,
      srcPath: filepath,
      dstPath: opts.dst,
      ignore: opts.ignore,
      overwriteExisting: opts.overwriteExisting,
      skipUndownloadedFiles: opts.skipUndownloadedFiles
    })
  },

  async exportToDrive (opts) {
    assertBeakerOnly(this.sender);
    var src = await lookupDrive(this.sender, opts.src);
    var dst = await lookupDrive(this.sender, opts.dst);
    if (dst.isHistoric) throw new beakerErrorConstants.ArchiveNotWritableError('Cannot modify a historic version')
    var res = await pda__default.exportArchiveToArchive({
      srcArchive: src.checkoutFS.session ? src.checkoutFS.session.drive : src.checkoutFS,
      srcPath: src.filepath,
      dstArchive: dst.checkoutFS.session ? dst.checkoutFS.session.drive : dst.checkoutFS,
      dstPath: dst.filepath,
      ignore: opts.ignore,
      skipUndownloadedFiles: opts.skipUndownloadedFiles
    });
    return res
  }
};

// internal helpers
// =

// helper to check if filepath refers to a file that userland is not allowed to edit directly
function assertUnprotectedFilePath (filepath, sender) {
  if (isWcTrusted(sender)) {
    return // can write any file
  }
  if (filepath === '/' + DRIVE_MANIFEST_FILENAME) {
    throw new beakerErrorConstants.ProtectedFileNotWritableError()
  }
}

// temporary helper to make sure the call is made by a wallets: page
function assertBeakerOnly (sender) {
  if (!isWcTrusted(sender)) {
    throw new beakerErrorConstants.PermissionsError()
  }
}

async function assertCreateDrivePermission (sender, opts) {
  // wallets: always allowed
  if (isWcTrusted(sender)) {
    return true
  }

  // ask the user
  let allowed = await requestPermission('createDrive', sender, opts);
  if (!allowed) {
    throw new beakerErrorConstants.UserDeniedError()
  }
}

async function assertReadPermission (drive, sender, filepath = undefined) {
  var driveUrl;
  if (typeof drive === 'string') {
    driveUrl = `hyper://${await fromURLToKey(drive, true)}/`;
  } else {
    driveUrl = drive.url;
  }

  let ident = getDriveIdent(driveUrl);
  if (ident.system) {
    let origin = extractOrigin(sender.getURL()) + '/';
    if (isWcTrusted(sender) || isRootUrl(origin)) {
      return true
    }
    throw new beakerErrorConstants.PermissionsError('Cannot read the hyper://private/ drive')
  }

  return true
}

async function assertWritePermission (drive, sender, filepath = undefined) {
  var driveKey = drive.key.toString('hex');
  var driveUrl = `hyper://${driveKey}`;
  const perm = ('modifyDrive:' + driveKey);

  // wallets: always allowed
  if (isWcTrusted(sender)) {
    return true
  }

  // self-modification ALWAYS allowed
  var senderDatKey = await lookupUrlDriveKey(sender.getURL());
  if (senderDatKey === driveKey) {
    return true
  }

  let ident = getDriveIdent(driveUrl);

  // cant even ask to write the private drive 
  if (ident.system) {
    throw new beakerErrorConstants.PermissionsError('Cannot write the hyper://private/ drive')
  }

  // ensure the sender is allowed to write
  var allowed = await queryPermission(perm, sender);
  if (allowed) return true

  // ask the user
  var details = await getDriveInfo(driveKey);
  allowed = await requestPermission(perm, sender, { title: details.title });
  if (!allowed) throw new beakerErrorConstants.UserDeniedError()
  return true
}

async function assertQuotaPermission (drive, senderOrigin, byteLength) {
  // wallets: always allowed
  if (senderOrigin.startsWith('wallets:')) {
    return
  }

  // fetch the drive meta
  const meta = await getMeta(drive.key);

  // fallback to default quota
  var bytesAllowed = /* TODO userSettings.bytesAllowed ||*/ DAT_QUOTA_DEFAULT_BYTES_ALLOWED;

  // check the new size
  var newSize = (meta.size + byteLength);
  if (newSize > bytesAllowed) {
    throw new beakerErrorConstants.QuotaExceededError()
  }
}

function assertValidFilePath (filepath) {
  if (filepath.slice(-1) === '/') {
    throw new beakerErrorConstants.InvalidPathError('Files can not have a trailing slash')
  }
  assertValidPath(filepath);
}

function assertValidPath (fileOrFolderPath) {
  if (!DRIVE_VALID_PATH_REGEX.test(fileOrFolderPath)) {
    throw new beakerErrorConstants.InvalidPathError('Path contains invalid characters')
  }
}

function normalizeFilepath (str) {
  str = decodeURIComponent(str);
  if (!str.includes('://') && str.charAt(0) !== '/') {
    str = '/' + str;
  }
  return str
}

// helper to handle the URL argument that's given to most args
// - can get a hyperdrive hash, or hyperdrive url
// - sets checkoutFS to what's requested by version
async function lookupDrive (sender, driveHostname, version, dontGetDrive = false) {
  var driveKey;
  
  if (driveHostname.endsWith('.cap')) {
    let cap = lookupCap(driveHostname);
    if (cap) {
      driveKey = cap.target.key;
      version = cap.target.version;
    } else {
      throw new Error('Capability does not exist')
    }
  }
  
  if (!driveKey) {
    driveKey = await fromURLToKey(driveHostname, true);
  }

  if (dontGetDrive) {
    return {driveKey, version}
  }

  var drive = getDrive(driveKey);
  if (!drive) drive = await loadDrive(driveKey);
  var {checkoutFS, isHistoric} = await getDriveCheckout(drive, version);
  return {drive, version, isHistoric, checkoutFS}
}

async function lookupUrlDriveKey (url) {
  if (HYPERDRIVE_HASH_REGEX.test(url)) return url
  if (!url.startsWith('hyper://')) {
    return false // not a drive site
  }

  var urlp = parseDriveUrl(url);
  try {
    return await resolveName(urlp.hostname)
  } catch (e) {
    return false
  }
}

// typedefs
// =

/**
 * @typedef {Object} BeakerShellPublicAPIDriveRecord
 * @prop {string} url
 * @prop {string} title
 * @prop {string} description
 */

// exported api
// =

/**
 * @param {string} url 
 * @returns {Promise<void>}
 */
async function drivePropertiesDialog (url) {
  assert(url && typeof url === 'string', '`url` must be a string');
  var info = await getDriveInfo(url);
  var cfg = getDriveConfig(info.key);
  await create$3(this.sender, 'drive-properties', {
    url: info.url,
    writable: info.writable,
    props: Object.assign(_pick(info, ['title', 'description']), {tags: cfg.tags || []})
  });
}

/**
 * @param {Object} [opts]
 * @param {string} [opts.title]
 * @param {string} [opts.buttonLabel]
 * @param {string} [opts.drive]
 * @param {string} [opts.defaultPath]
 * @param {string[]} [opts.select]
 * @param {Object} [opts.filters]
 * @param {string[]} [opts.filters.extensions]
 * @param {boolean} [opts.filters.writable]
 * @param {boolean} [opts.filters.networked]
 * @param {boolean} [opts.allowMultiple]
 * @param {boolean} [opts.disallowCreate]
 * @returns {Promise<string[]>}
 */
async function selectFileDialog (opts = {}) {
  // validate
  assert(opts && typeof opts === 'object', 'Must pass an options object');
  assert(!opts.title || typeof opts.title === 'string', '.title must be a string');
  assert(!opts.buttonLabel || typeof opts.buttonLabel === 'string', '.buttonLabel must be a string');
  assert(!opts.drive || typeof opts.drive === 'string', '.drive must be a string');
  assert(!opts.defaultPath || typeof opts.defaultPath === 'string', '.defaultPath must be a string');
  assert(!opts.select || isStrArray(opts.select), '.select must be an array of strings');
  if (opts.filters) {
    assert(typeof opts.filters === 'object', '.filters must be an object');
    assert(!opts.filters.extensions || isStrArray(opts.filters.extensions), '.filters.extensions must be an array of strings');
    assert(!opts.filters.writable || typeof opts.filters.writable === 'boolean', '.filters.writable must be a boolean');
    assert(!opts.filters.networked || typeof opts.filters.networked === 'boolean', '.filters.networked must be a boolean');
  }
  assert(!opts.allowMultiple || typeof opts.allowMultiple === 'boolean', '.filters.allowMultiple must be a boolean');
  assert(!opts.disallowCreate || typeof opts.disallowCreate === 'boolean', '.filters.disallowCreate must be a boolean');

  // initiate the modal
  var res;
  try {
    while (true) {
      res = await create$3(this.sender, 'select-file', opts);
      if (res && res.gotoCreateDrive) {
        res = await create$3(this.sender, 'create-drive').catch(e => undefined);
        if (res && res.gotoSync) {
          await create$3(this.sender, 'folder-sync', {url: res.url, closeAfterSync: true});
        }
        if (res) opts.drive = res.url;
      } else {
        break
      }
    }
  } catch (e) {
    if (e.name !== 'Error') {
      throw e // only rethrow if a specific error
    }
  }
  if (!res) throw new beakerErrorConstants.UserDeniedError()
  return res
}

/**
 * @param {Object} [opts]
 * @param {string} [opts.title]
 * @param {string} [opts.buttonLabel]
 * @param {string} [opts.drive]
 * @param {string} [opts.defaultPath]
 * @param {string} [opts.defaultFilename]
 * @param {string} [opts.extension]
 * @param {Object} [opts.filters]
 * @param {string[]} [opts.filters.extensions]
 * @param {boolean} [opts.filters.networked]
 * @returns {Promise<string[]>}
 */
async function saveFileDialog (opts = {}) {
  // validate
  assert(opts && typeof opts === 'object', 'Must pass an options object');
  assert(!opts.title || typeof opts.title === 'string', '.title must be a string');
  assert(!opts.buttonLabel || typeof opts.buttonLabel === 'string', '.buttonLabel must be a string');
  assert(!opts.drive || typeof opts.drive === 'string', '.drive must be a string');
  assert(!opts.defaultPath || typeof opts.defaultPath === 'string', '.defaultPath must be a string');
  assert(!opts.defaultFilename || typeof opts.defaultFilename === 'string', '.defaultFilename must be a string');
  if (opts.filters) {
    assert(typeof opts.filters === 'object', '.filters must be an object');
    assert(!opts.filters.extensions || isStrArray(opts.filters.extensions), '.filters.extensions must be an array of strings');
    assert(!opts.filters.networked || typeof opts.filters.networked === 'boolean', '.filters.networked must be a boolean');
  }

  // initiate the modal
  opts.saveMode = true;
  var res;
  try {
    while (true) {
      res = await create$3(this.sender, 'select-file', opts);
      if (res && res.gotoCreateDrive) {
        res = await create$3(this.sender, 'create-drive').catch(e => undefined);
        if (res && res.gotoSync) {
          await create$3(this.sender, 'folder-sync', {url: res.url, closeAfterSync: true});
        }
        if (res) opts.drive = res.url;
      } else {
        break
      }
    }
  } catch (e) {
    if (e.name !== 'Error') {
      throw e // only rethrow if a specific error
    }
  }
  if (!res) throw new beakerErrorConstants.UserDeniedError()
  return res
}

/**
 * @param {Object} [opts]
 * @param {string} [opts.title]
 * @param {string} [opts.buttonLabel]
 * @param {boolean} [opts.writable]
 * @param {string} [opts.tag]
 * @param {boolean} [opts.allowMultiple]
 * @param {string} [opts.template]
 * @returns {Promise<string|string[]>}
 */
async function selectDriveDialog (opts = {}) {
  // validate
  assert(opts && typeof opts === 'object', 'Must pass an options object');
  assert(!opts.title || typeof opts.title === 'string', '.title must be a string');
  assert(!opts.buttonLabel || typeof opts.buttonLabel === 'string', '.buttonLabel must be a string');
  assert(!opts.tag || typeof opts.tag === 'string', '.tag must be a string');
  assert(!opts.writable || typeof opts.writable === 'boolean', '.writable must be a boolean');
  assert(!opts.allowMultiple || typeof opts.allowMultiple === 'boolean', '.allowMultiple must be a boolean');
  assert(!opts.template || typeof opts.template === 'string', '.template must be a string');
  if (opts.template && !isHyperUrl(opts.template)) {
    throw new Error('.template must be a hyper:// URL')
  }

  // initiate the modal
  var res;
  try {
    res = await create$3(this.sender, 'select-drive', opts);
    if (res && res.gotoCreate) {
      if (opts.template) {
        res = await create$3(this.sender, 'fork-drive', {
          url: opts.template,
          forks: [{url: opts.template}],
          detached: true,
          isTemplate: true,
          title: '',
          description: '',
          tags: [opts.tag]
        });
      } else {
        res = await create$3(this.sender, 'create-drive', {tags: [opts.tag]});
        if (res && res.gotoSync) {
          await create$3(this.sender, 'folder-sync', {url: res.url, closeAfterSync: true});
        }
      }
    }
  } catch (e) {
    if (e.name !== 'Error') {
      throw e // only rethrow if a specific error
    }
  }
  if (!res) throw new beakerErrorConstants.UserDeniedError()
  return res.urls || res.url
}

/**
 * @param {Object} [opts]
 * @param {string} [opts.tags]
 * @returns {Promise<void>}
 */
async function saveDriveDialog (url, {tags} = {tags: ''}) {
  if (Array.isArray(tags)) {
    tags = tags.filter(t => typeof t === 'string').join(' ');
  } else if (typeof tags !== 'string') {
    tags = '';
  }

  var res;
  try {
    res = await create$3(this.sender, 'add-drive', {url, tags});
  } catch (e) {
    if (e.name !== 'Error') {
      throw e // only rethrow if a specific error
    }
  }
  if (!res) throw new beakerErrorConstants.UserDeniedError()
  await configDrive(res.key, {tags: res.tags});
}

/**
 * @param {Object} [opts]
 * @param {boolean} [opts.writable]
 * @param {string} [opts.tag]
 * @returns {Promise<BeakerShellPublicAPIDriveRecord[]>}
 */
async function listDrives (opts = {}) {
  // validate
  assert(opts && typeof opts === 'object', 'Must pass an options object');
  assert(!opts.tag || typeof opts.tag === 'string', '.tag must be a string');
  assert(!opts.writable || typeof opts.writable === 'boolean', '.writable must be a boolean');

  let perm = opts.tag ? `listDrives:${opts.tag || ''}` : 'listDrives';
  if (!(await requestPermission(perm, this.sender))) {
    throw new beakerErrorConstants.UserDeniedError()
  }

  let drivesList = listDrives$1();
  let records = [];
  for (let drive of drivesList) {
    let url = `hyper://${drive.key}/`;
    let info = await getDriveInfo(drive.key, {onlyCache: true});
    if (typeof opts.writable === 'boolean' && info.writable !== opts.writable) {
      continue
    }
    if (typeof opts.tag === 'string' && !drive.tags?.includes?.(opts.tag)) {
      continue
    }
    records.push({url, title: info.title, description: info.description});
  }
  return records
}

async function unsaveDrive (url) {
  // validate
  assert(url && typeof url === 'string', 'Must provide a URL string');

  var key = await fromURLToKey(url, true);
  var cfg = getDriveConfig(key);
  if (cfg) {
    var info = await getDriveInfo(key, {onlyCache: true});
    if (!(await requestPermission(`deleteDrive:${key}`, this.sender, { title: info.title }))) {
      throw new beakerErrorConstants.UserDeniedError()
    }
    await removeDrive(key);
  }
}

async function tagDrive (url, tags) {
  // validate
  assert(url && typeof url === 'string', 'Must provide a URL string');
  if (!tags) throw new Error('Tags must be a string or array of strings')
  if (Array.isArray(tags)) {
    tags = tags.filter(v => typeof v === 'string');
    if (tags.length === 0) throw new Error('Tags must be a string or array of strings')
  } else if (typeof tags !== 'string') {
    throw new Error('Tags must be a string or array of strings')
  } else {
    tags = tags.split(' ');
  }

  var key = await fromURLToKey(url, true);
  var cfg = getDriveConfig(key);
  if (!cfg) {
    return saveDriveDialog.call(this, url, {tags})
  }

  if (cfg.tags) {
    // remove any tags already present
    tags = tags.filter(tag => !cfg.tags.includes(tag));
    if (tags.length === 0) {
      return // already tagged with all requested tags
    }
  }

  var info = await getDriveInfo(key, {onlyCache: true});
  if (!(await requestPermission(`tagDrive:${key}`, this.sender, { title: info.title, tags }))) {
    throw new beakerErrorConstants.UserDeniedError()
  }

  if (cfg.tags) tags = tags.concat(cfg.tags);
  await configDrive(key, {tags});
}

async function importFilesAndFolders (url, filePaths) {
  if (!isWcTrusted(this.sender)) return
  return doImport(this.sender, url, filePaths)
}

async function importFilesDialog (url) {
  if (!isWcTrusted(this.sender)) return

  var res = await electron.dialog.showOpenDialog({
    title: 'Import files',
    buttonLabel: 'Import',
    properties: ['openFile', 'multiSelections', 'createDirectory']
  });
  if (res.filePaths.length) {
    return doImport(this.sender, url, res.filePaths)
  }
  return {numImported: 0}
}

async function importFoldersDialog (url) {
  if (!isWcTrusted(this.sender)) return

  var res = await electron.dialog.showOpenDialog({
    title: 'Import folders',
    buttonLabel: 'Import',
    properties: ['openDirectory', 'multiSelections', 'createDirectory']
  });
  if (res.filePaths.length) {
    return doImport(this.sender, url, res.filePaths)
  }
  return {numImported: 0}
}

async function exportFilesDialog (urls) {
  if (!isWcTrusted(this.sender)) return

  var res = await electron.dialog.showOpenDialog({
    title: 'Export files',
    buttonLabel: 'Export',
    properties: ['openDirectory', 'createDirectory']
  });
  if (res.filePaths.length) {
    var baseDstPath = res.filePaths[0];
    urls = Array.isArray(urls) ? urls : [urls];
    for (let srcUrl of urls) {
      var urlp = parseDriveUrl(srcUrl);
      let {checkoutFS} = await lookupDrive(this.sender, urlp.hostname, urlp.version);
      let dstPath = joinPath(baseDstPath, urlp.pathname.split('/').pop());
      await pda__default.exportArchiveToFilesystem({
        srcArchive: checkoutFS.session ? checkoutFS.session.drive : checkoutFS,
        srcPath: urlp.pathname,
        dstPath,
        overwriteExisting: false,
        skipUndownloadedFiles: false
      });
    }
    return {numExported: res.filePaths.length}
  }
  return {numExported: 0}
}

// internal methods
// =

function isStrArray (v) {
  return (Array.isArray(v) && v.every(el => typeof el === 'string'))
}

async function doImport (wc, url, filePaths) {
  var urlp = parseDriveUrl(url);
  var {checkoutFS, isHistoric} = await lookupDrive(wc, urlp.hostname, urlp.version);
  if (isHistoric) throw new beakerErrorConstants.ArchiveNotWritableError('Cannot modify a historic version')

  // calculate size of import for progress
  var numFilesToImport = 0;
  for (let srcPath of filePaths) {
    let stats = await pda__default.exportFilesystemToArchive({
      srcPath,
      dstArchive: checkoutFS.session ? checkoutFS.session.drive : checkoutFS,
      dstPath: urlp.pathname,
      ignore: ['index.json'],
      inplaceImport: false,
      dryRun: true
    });
    numFilesToImport += stats.fileCount;
  }

  var prompt = await create$1(wc, 'progress', {label: 'Importing files...'});
  let numImported = 0;
  try {
    for (let srcPath of filePaths) {
      let stats = await pda__default.exportFilesystemToArchive({
        srcPath,
        dstArchive: checkoutFS.session ? checkoutFS.session.drive : checkoutFS,
        dstPath: urlp.pathname,
        ignore: ['index.json'],
        inplaceImport: false,
        dryRun: false,
        progress (stats) {
          prompt.webContents.executeJavaScript(`updateProgress(${(numImported + stats.fileCount) / numFilesToImport}); undefined`);
        }
      });
      numImported += stats.fileCount;
    }
  } finally {
    close$1(prompt.tab);
  }

  return {numImported}
}

var shellAPI = /*#__PURE__*/Object.freeze({
  __proto__: null,
  drivePropertiesDialog: drivePropertiesDialog,
  selectFileDialog: selectFileDialog,
  saveFileDialog: saveFileDialog,
  selectDriveDialog: selectDriveDialog,
  saveDriveDialog: saveDriveDialog,
  listDrives: listDrives,
  unsaveDrive: unsaveDrive,
  tagDrive: tagDrive,
  importFilesAndFolders: importFilesAndFolders,
  importFilesDialog: importFilesDialog,
  importFoldersDialog: importFoldersDialog,
  exportFilesDialog: exportFilesDialog
});

async function runSelectFileDialog (win, opts = {}) {
    var res;
    try {
      res = await create$3(win.webContents, 'select-file', opts);
    } catch (e) {
      if (e.name !== 'Error') throw e // only rethrow if a specific error
    }
    if (!res) throw new beakerErrorConstants.UserDeniedError()
    return res
}

async function runForkFlow (win, url, {detached} = {detached: false}) {
  var res;
  try {
    let forks = await drivesAPI.getForks(url);
    res = await create$3(win.webContents, 'fork-drive', {url, forks, detached});
  } catch (e) {
    if (e.name !== 'Error') {
      throw e // only rethrow if a specific error
    }
  }
  if (!res || !res.url) throw new beakerErrorConstants.UserDeniedError()
  return res.url
}

async function runDrivePropertiesFlow (win, key) {
  await drivePropertiesDialog.call({sender: win}, key);
}

async function exportDriveToFilesystem (sourceUrl, targetPath) {
  var drive = await hyper.drives.getOrLoadDrive(sourceUrl);
  return pda__default.exportArchiveToFilesystem({
    srcArchive: drive.session.drive,
    srcPath: '/',
    dstPath: targetPath,
    overwriteExisting: true,
    skipUndownloadedFiles: false
  })
}

async function importFilesystemToDrive (srcPath, targetUrl, {preserveFolder} = {preserveFolder: false}) {
  var targetUrlp = new URL(targetUrl);
  var drive = await hyper.drives.getOrLoadDrive(targetUrlp.hostname);
  return pda__default.exportFilesystemToArchive({
    srcPath,
    dstArchive: drive.session.drive,
    dstPath: targetUrlp.pathname,
    inplaceImport: !preserveFolder
  })
}

// globals
// =

var currentMenuTemplate;

// exported APIs
// =

function setup$k () {
  setApplicationMenu({noWindows: true});

  // watch for changes to the currently active window
  electron.app.on('browser-window-focus', async (e, win) => {
    try {
      setApplicationMenu();
    } catch (e) {
      // `pages` not set yet
    }
  });

  // watch for all windows to be closed
  electron.app.on('custom-window-all-closed', () => {
    setApplicationMenu({noWindows: true});
  });

  // watch for any window to be opened
  electron.app.on('browser-window-created', () => {
    setApplicationMenu();
  });
}

function onSetCurrentLocation (win) {
  // check if this is the currently focused window
  if (win !== electron.BrowserWindow.getFocusedWindow()) {
    return
  }
  setApplicationMenu();
}

function setApplicationMenu (opts = {}) {
  currentMenuTemplate = buildWindowMenu(opts);
  electron.Menu.setApplicationMenu(electron.Menu.buildFromTemplate(currentMenuTemplate));
}

function buildWindowMenu (opts = {}) {
  var win = opts.noWindows ? undefined : opts.win ? opts.win : getActiveWindow();
  if (win && win.isDestroyed()) win = undefined;
  const noWindows = !win;
  const tab = !noWindows && win ? getActive(win) : undefined;
  const url = tab?.url || tab?.loadingURL || '';
  const isDriveSite = url.startsWith('hyper://');
  const driveInfo = isDriveSite ? tab.driveInfo : undefined;
  const isWritable = driveInfo && driveInfo.writable;

  var darwinMenu = {
    label: 'Wallets',
    submenu: [
      {
        label: 'Preferences',
        accelerator: 'Cmd+,',
        click (item) {
          if (win) create$2(win, 'wallets://settings', {setActive: true});
          else createShellWindow({ pages: ['wallets://settings'] });
        }
      },
      { type: 'separator' },
      { label: 'Services', role: 'services', submenu: [] },
      { type: 'separator' },
      { label: 'Hide Wallets', accelerator: 'Cmd+H', role: 'hide' },
      { label: 'Hide Others', accelerator: 'Cmd+Alt+H', role: 'hideothers' },
      { label: 'Show All', role: 'unhide' },
      { type: 'separator' },
      {
        id: 'quit',
        label: 'Quit',
        accelerator: 'Cmd+Q',
        async click () {
          var runBackground = await get$1('run_background');
          if (runBackground == 1) {
            for (let win of electron.BrowserWindow.getAllWindows()) {
              win.close();
            }
          } else {
            electron.app.quit();
          }
        },
        reserved: true
      }
    ]
  };

  var fileMenu = {
    label: 'File',
    submenu: [
      {
        id: 'newTab',
        label: 'New Tab',
        accelerator: 'CmdOrCtrl+T',
        click: function (item) {
          if (win) {
            create$2(win, undefined, {setActive: true, focusLocationBar: true});
          } else {
            createShellWindow();
          }
        },
        reserved: true
      },
      {
        id: 'newWindow',
        label: 'New Window',
        accelerator: 'CmdOrCtrl+N',
        click: function () { createShellWindow(); },
        reserved: true
      },
      { type: 'separator' },
      {
        id: 'openFile',
        label: 'Open File',
        accelerator: 'CmdOrCtrl+O',
        click: item => {
          createWindowIfNone(win, async (win) => {
            var res = await runSelectFileDialog(win, {
              buttonLabel: 'Open File'
            });
            create$2(win, res[0].url, {setActive: true, adjacentActive: true});
          });
        }
      },
      { type: 'separator' },
      // TODO
      // {
      //   id: 'savePageAs',
      //   label: 'Save Page As...',
      //   enabled: !noWindows,
      //   accelerator: 'CmdOrCtrl+Shift+S',
      //   click: async (item) => {
      //     createWindowIfNone(getWin(), async (win) => {
      //       if (!tab) return
      //       const {url, title} = tab
      //       var res = await runSelectFileDialog(win, {
      //         saveMode: true,
      //         title: `Save ${title} as...`,
      //         buttonLabel: 'Save Page',
      //         defaultFilename: url.split('/').filter(Boolean).pop() || 'index.html',
      //         drive: url.startsWith('hyper:') ? url : undefined
      //       })
      //       let drive = await hyper.drives.getOrLoadDrive(res.origin)
      //       await drive.pda.writeFile(res.path, await fetch(url))
      //       tabManager.create(win, res.url, {setActive: true, adjacentActive: true})
      //     })
      //   }
      // },
      {
        id: 'exportPageAs',
        label: 'Export Page As...',
        enabled: !noWindows,
        click: async (item) => {
          if (!tab) return
          const {url, title} = tab;
          var {filePath} = await electron.dialog.showSaveDialog({ title: `Save ${title} as...`, defaultPath: electron.app.getPath('downloads') });
          if (filePath) download(win, win.webContents, url, { saveAs: filePath, suppressNewDownloadEvent: true });
        }
      },
      {
        id: 'print',
        label: 'Print',
        enabled: !noWindows,
        accelerator: 'CmdOrCtrl+P',
        click: (item) => {
          if (!tab) return
          tab.webContents.print();
        }
      },
      { type: 'separator' },
      {
        id: 'reopenClosedTab',
        label: 'Reopen Closed Tab',
        accelerator: 'CmdOrCtrl+Shift+T',
        click: function (item) {
          createWindowIfNone(win, (win) => {
            reopenLastRemoved(win);
          });
        },
        reserved: true
      },
      {
        id: 'closeTab',
        label: 'Close Tab',
        enabled: !noWindows,
        accelerator: 'CmdOrCtrl+W',
        click: function (item) {
          if (win) {
            // a regular browser window
            let active = getActive(win);
            if (active) active.removePane(active.activePane);
          } else {
            // devtools
            let wc = getFocusedDevToolsHost();
            if (wc) {
              wc.closeDevTools();
            }
          }
        },
        reserved: true
      },
      {
        id: 'closeWindow',
        label: 'Close Window',
        enabled: !noWindows,
        accelerator: 'CmdOrCtrl+Shift+W',
        click: function (item) {
          if (win) win.close();
        },
        reserved: true
      }
    ]
  };

  var editMenu = {
    label: 'Edit',
    submenu: [
      { id: 'undo', label: 'Undo', enabled: !noWindows, accelerator: 'CmdOrCtrl+Z', selector: 'undo:', reserved: true },
      { id: 'redo', label: 'Redo', enabled: !noWindows, accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:', reserved: true },
      { type: 'separator' },
      { id: 'cut', label: 'Cut', enabled: !noWindows, accelerator: 'CmdOrCtrl+X', selector: 'cut:', reserved: true },
      { id: 'copy', label: 'Copy', enabled: !noWindows, accelerator: 'CmdOrCtrl+C', selector: 'copy:', reserved: true },
      { id: 'paste', label: 'Paste', enabled: !noWindows, accelerator: 'CmdOrCtrl+V', selector: 'paste:', reserved: true },
      { id: 'selectAll', label: 'Select All', enabled: !noWindows, accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' },
      { type: 'separator' },
      {
        id: 'findInPage',
        label: 'Find in Page',
        enabled: !noWindows,
        accelerator: 'CmdOrCtrl+F',
        click: function (item) {
          if (tab) tab.showInpageFind();
        }
      },
      {
        id: 'findNext',
        label: 'Find Next',
        enabled: !noWindows,
        accelerator: 'CmdOrCtrl+G',
        click: function (item) {
          if (tab) tab.moveInpageFind(1);
        }
      },
      {
        id: 'findPrevious',
        label: 'Find Previous',
        enabled: !noWindows,
        accelerator: 'Shift+CmdOrCtrl+G',
        click: function (item) {
          if (tab) tab.moveInpageFind(-1);
        }
      }
    ]
  };

  var viewMenu = {
    label: 'View',
    submenu: [
      {
        id: 'reload',
        label: 'Reload',
        enabled: !noWindows,
        accelerator: 'CmdOrCtrl+R',
        click: function (item) {
          if (tab) tab.webContents.reload();
        },
        reserved: true
      },
      {
        id: 'hardReload',
        label: 'Hard Reload (Clear Cache)',
        accelerator: 'CmdOrCtrl+Shift+R',
        enabled: !noWindows,
        click: function (item) {
          if (tab) tab.webContents.reloadIgnoringCache();
        },
        reserved: true
      },
      {type: 'separator'},
      {
        id: 'zoomIn',
        label: 'Zoom In',
        enabled: !noWindows,
        accelerator: 'CmdOrCtrl+Plus',
        reserved: true,
        click: function (item) {
          if (tab) zoomIn(tab);
        }
      },
      {
        id: 'zoomOut',
        label: 'Zoom Out',
        enabled: !noWindows,
        accelerator: 'CmdOrCtrl+-',
        reserved: true,
        click: function (item) {
          if (tab) zoomOut(tab);
        }
      },
      {
        id: 'actualSize',
        label: 'Actual Size',
        enabled: !noWindows,
        accelerator: 'CmdOrCtrl+0',
        click: function (item) {
          if (tab) zoomReset(tab);
        }
      },
      {type: 'separator'},
      {
        id: 'splitPaneVertical',
        label: 'Split Pane Vertically',
        enabled: !noWindows,
        accelerator: 'CmdOrCtrl+E',
        click () {
          if (tab && tab.activePane) {
            tab.splitPane(tab.activePane, 'vert');
          }
        }
      },
      {
        id: 'splitPaneHorizontal',
        label: 'Split Pane Horizontally',
        enabled: !noWindows,
        accelerator: 'CmdOrCtrl+Shift+E',
        click () {
          if (tab && tab.activePane) {
            tab.splitPane(tab.activePane, 'horz');
          }
        }
      },
      {type: 'separator'},
      {
        id: 'selectPaneUp',
        label: 'Select Pane Up',
        enabled: !noWindows,
        accelerator: `${(process.platform !== 'darwin') ? 'Ctrl+Alt' : 'Ctrl+Cmd'}+Up`,
        click () {
          if (tab && tab.activePane) {
            tab.activateAdjacentPane('up');
          }
        }
      },
      {
        id: 'selectPaneDown',
        label: 'Select Pane Down',
        enabled: !noWindows,
        accelerator: `${(process.platform !== 'darwin') ? 'Ctrl+Alt' : 'Ctrl+Cmd'}+Down`,
        click () {
          if (tab && tab.activePane) {
            tab.activateAdjacentPane('down');
          }
        }
      },
      {
        id: 'selectPaneLeft',
        label: 'Select Pane Left',
        enabled: !noWindows,
        accelerator: `${(process.platform !== 'darwin') ? 'Ctrl+Alt' : 'Ctrl+Cmd'}+Left`,
        click () {
          if (tab && tab.activePane) {
            tab.activateAdjacentPane('left');
          }
        }
      },
      {
        id: 'selectPaneRight',
        label: 'Select Pane Right',
        enabled: !noWindows,
        accelerator: `${(process.platform !== 'darwin') ? 'Ctrl+Alt' : 'Ctrl+Cmd'}+Right`,
        click () {
          if (tab && tab.activePane) {
            tab.activateAdjacentPane('right');
          }
        }
      },
      {type: 'separator'},
      {
        id: 'movePaneUp',
        label: 'Move Pane Up',
        enabled: !noWindows,
        accelerator: `Shift+${(process.platform !== 'darwin') ? 'Ctrl+Alt' : 'Ctrl+Cmd'}+Up`,
        click () {
          if (tab && tab.activePane) {
            tab.movePane(tab.activePane, 'up');
          }
        }
      },
      {
        id: 'movePaneDown',
        label: 'Move Pane Down',
        enabled: !noWindows,
        accelerator: `Shift+${(process.platform !== 'darwin') ? 'Ctrl+Alt' : 'Ctrl+Cmd'}+Down`,
        click () {
          if (tab && tab.activePane) {
            tab.movePane(tab.activePane, 'down');
          }
        }
      },
      {
        id: 'movePaneLeft',
        label: 'Move Pane Left',
        enabled: !noWindows,
        accelerator: `Shift+${(process.platform !== 'darwin') ? 'Ctrl+Alt' : 'Ctrl+Cmd'}+Left`,
        click () {
          if (tab && tab.activePane) {
            tab.movePane(tab.activePane, 'left');
          }
        }
      },
      {
        id: 'movePaneRight',
        label: 'Move Pane Right',
        enabled: !noWindows,
        accelerator: `Shift+${(process.platform !== 'darwin') ? 'Ctrl+Alt' : 'Ctrl+Cmd'}+Right`,
        click () {
          if (tab && tab.activePane) {
            tab.movePane(tab.activePane, 'right');
          }
        }
      }
    ]
  };

  var driveMenu = {
    label: 'Drive',
    submenu: [
      {
        id: 'toggleFilesExplorer',
        label: 'Explore Files',
        enabled: !noWindows && !!isDriveSite,
        click: async function (item) {
          if (tab) tab.togglePaneByOrigin({url: 'wallets://explorer/'});
        }
      },
      {type: 'separator'},
      {
        id: 'forkDrive',
        label: 'Fork Drive',
        enabled: !!isDriveSite,
        async click (item) {
          if (win) {
            let newUrl = await runForkFlow(win, url);
            create$2(win, newUrl, {setActive: true});
          }
        }
      },
      {
        id: 'diffMerge',
        label: 'Diff / Merge',
        enabled: !!isDriveSite,
        async click (item) {
          if (win) create$2(win, `wallets://diff/?base=${url}`, {setActive: true});
        }
      },
      { type: 'separator' },
      {
        id: 'importFiles',
        label: 'Import Files',
        enabled: !noWindows && isDriveSite && isWritable,
        click: async (item) => {
          if (!driveInfo || !driveInfo.writable) return
          var {filePaths} = await electron.dialog.showOpenDialog({
            title: `Import Files`,
            buttonLabel: 'Select File(s)',
            properties: ['openFile', 'multiSelections']
          });
          if (!filePaths[0]) return
          var res = await runSelectFileDialog(win, {
            title: 'Choose where to import to',
            buttonLabel: 'Import File(s)',
            drive: driveInfo.url,
            select: 'folder'
          });
          var targetUrl = res[0].url;
          let confirmation = await electron.dialog.showMessageBox({
            type: 'question',
            message: `Import ${filePaths.length > 1 ? `${filePaths.length} files` : filePaths[0]} to ${targetUrl}? Any conflicting files will be overwritten.`,
            buttons: ['OK', 'Cancel']
          });
          if (confirmation.response !== 0) return
          for (let filePath of filePaths) {
            await importFilesystemToDrive(filePath, targetUrl);
          }
          electron.dialog.showMessageBox({message: 'Import complete'});
        }
      },
      {
        id: 'importFolder',
        label: 'Import Folder',
        enabled: !noWindows && isDriveSite && isWritable,
        click: async (item) => {
          if (!driveInfo || !driveInfo.writable) return
          var {filePaths} = await electron.dialog.showOpenDialog({
            title: `Import Folder`,
            buttonLabel: 'Select Folder(s)',
            properties: ['openDirectory', 'multiSelections']
          });
          if (!filePaths[0]) return
          var res = await runSelectFileDialog(win, {
            title: 'Choose where to import to',
            buttonLabel: 'Import Folder(s)',
            drive: driveInfo.url,
            select: 'folder'
          });
          var targetUrl = res[0].url;
          let confirmation = await electron.dialog.showMessageBox({
            type: 'question',
            message: `Import ${filePaths.length > 1 ? `${filePaths.length} folders` : filePaths[0]} to ${targetUrl}? Any conflicting files will be overwritten.`,
            buttons: ['OK', 'Cancel']
          });
          if (confirmation.response !== 0) return
          for (let filePath of filePaths) {
            await importFilesystemToDrive(filePath, targetUrl, {preserveFolder: true});
          }
          electron.dialog.showMessageBox({message: 'Import complete'});
        }
      },
      {
        id: 'exportFiles',
        label: 'Export Files',
        enabled: !noWindows && isDriveSite,
        click: async (item) => {
          if (!driveInfo) return
          var {filePaths} = await electron.dialog.showOpenDialog({
            title: `Export Drive Files`,
            buttonLabel: 'Export',
            properties: ['openDirectory', 'createDirectory']
          });
          if (!filePaths[0]) return
          let confirmation = await electron.dialog.showMessageBox({
            type: 'question',
            message: `Export ${driveInfo.title || driveInfo.key} to ${filePaths[0]}? Any conflicting files will be overwritten.`,
            buttons: ['OK', 'Cancel']
          });
          if (confirmation.response !== 0) return
          await exportDriveToFilesystem(driveInfo.url, filePaths[0]);
          electron.dialog.showMessageBox({message: 'Export complete'});
        }
      },
      {type: 'separator'},
      {
        id: 'driveProperties',
        label: 'Drive Properties',
        enabled: !!isDriveSite,
        async click (item) {
          if (win) runDrivePropertiesFlow(win, hyper.drives.fromURLToKey(url));
        }
      }
    ]
  };

  var showHistoryAccelerator = 'Ctrl+H';

  if (process.platform === 'darwin') {
    showHistoryAccelerator = 'Cmd+Y';
  }

  var historyMenu = {
    label: 'History',
    role: 'history',
    submenu: [
      {
        id: 'back',
        label: 'Back',
        enabled: !noWindows,
        accelerator: 'CmdOrCtrl+Left',
        click: function (item) {
          if (tab) tab.webContents.goBack();
        }
      },
      {
        id: 'forward',
        label: 'Forward',
        enabled: !noWindows,
        accelerator: 'CmdOrCtrl+Right',
        click: function (item) {
          if (tab) tab.webContents.goForward();
        }
      },
      {
        id: 'showFullHistory',
        label: 'Show Full History',
        accelerator: showHistoryAccelerator,
        click: function (item) {
          if (win) create$2(win, 'wallets://history', {setActive: true});
          else createShellWindow({ pages: ['wallets://history'] });
        }
      },
      { type: 'separator' },
      {
        id: 'bookmarkThisPage',
        label: 'Bookmark this Page',
        enabled: !noWindows,
        accelerator: 'CmdOrCtrl+D',
        click: function (item) {
          if (win) win.webContents.send('command', 'create-bookmark');
        }
      }
    ]
  };

  var developerMenu = {
    label: 'Developer',
    submenu: [
      {
        id: 'toggleDevTools',
        label: 'Toggle DevTools',
        enabled: !noWindows,
        accelerator: (process.platform === 'darwin') ? 'Alt+CmdOrCtrl+I' : 'Shift+CmdOrCtrl+I',
        click: function (item) {
          if (tab) tab.webContents.toggleDevTools();
        },
        reserved: true
      },
      {
        id: 'toggleEditor',
        label: 'Toggle Editor',
        enabled: !noWindows,
        accelerator: 'CmdOrCtrl+B',
        click: async function (item) {
          if (tab) tab.togglePaneByOrigin({url: 'wallets://editor/'});
        }
      },
      {
        id: 'toggleTerminal',
        label: 'Toggle Terminal',
        enabled: !noWindows,
        accelerator: 'Ctrl+`',
        click: function (item) {
          if (tab) tab.togglePaneByOrigin({url: 'wallets://webterm/'});
        }
      },
      {
        id: 'toggleHypercoreDevtools',
        label: 'Toggle Hypercore Devtools',
        enabled: !noWindows,
        click: async function (item) {
          if (tab) tab.togglePaneByOrigin({url: 'wallets://hypercore-tools/'});
        }
      },
      {
        id: 'toggleLiveReloading',
        label: 'Toggle Live Reloading',
        enabled: !!isDriveSite,
        click: function (item) {
          if (tab) tab.toggleLiveReloading();
        }
      }
    ]
  };

  if (getEnvVar('WALLETS_DEV_MODE')) {
    developerMenu.submenu.unshift({
      type: 'submenu',
      label: 'Advanced Tools',
      submenu: [
        {
          label: 'Reload Shell-Window',
          enabled: !noWindows,
          click: function () {
            win.webContents.reloadIgnoringCache();
          }
        },
        {
          label: 'Toggle Shell-Window DevTools',
          enabled: !noWindows,
          click: function () {
            win.webContents.openDevTools({mode: 'detach'});
          }
        }
      ]
    });
  }

  const gotoTabShortcut = index => ({
    label: `Tab ${index}`,
    enabled: !noWindows,
    accelerator: `CmdOrCtrl+${index}`,
    click: function (item) {
      if (win) {
        hide$2(win); // HACK: closes the background tray if it's open
        setActive(win, index - 1);
      }
    }
  });
  var windowMenu = {
    label: 'Window',
    role: 'window',
    submenu: [
      {
        id: 'toggleAlwaysOnTop',
        type: 'checkbox',
        label: 'Always on Top',
        checked: (win ? win.isAlwaysOnTop() : false),
        click: function () {
          if (win) win.setAlwaysOnTop(!win.isAlwaysOnTop());
        }
      },
      {
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
      },
      {type: 'separator'},
      {
        id: 'toggleFullScreen',
        label: 'Full Screen',
        enabled: !noWindows,
        accelerator: (process.platform === 'darwin') ? 'Ctrl+Cmd+F' : 'F11',
        role: 'toggleFullScreen',
        click: function () {
          if (win) {
            win.setFullScreen(!win.isFullScreen());
          }
        }
      },
      {
        id: 'toggleBrowserUi',
        label: 'Toggle Browser UI',
        enabled: !noWindows,
        accelerator: 'CmdOrCtrl+Shift+H',
        click: function (item) {
          if (win) toggleShellInterface(win);
        }
      },
      {
        id: 'focusLocationBar',
        label: 'Focus Location Bar',
        accelerator: 'CmdOrCtrl+L',
        click: function (item) {
          createWindowIfNone(win, (win) => {
            win.webContents.send('command', 'focus-location');
          });
        }
      },
      {type: 'separator'},
      {
        id: 'nextTab',
        label: 'Next Tab',
        enabled: !noWindows,
        accelerator: (process.platform === 'darwin') ? 'Alt+CmdOrCtrl+Right' : 'CmdOrCtrl+PageDown',
        click: function (item) {
          if (win) changeActiveBy(win, 1);
        }
      },
      {
        id: 'previousTab',
        label: 'Previous Tab',
        enabled: !noWindows,
        accelerator: (process.platform === 'darwin') ? 'Alt+CmdOrCtrl+Left' : 'CmdOrCtrl+PageUp',
        click: function (item) {
          if (win) changeActiveBy(win, -1);
        }
      },
      {
        label: 'Tab Shortcuts',
        type: 'submenu',
        submenu: [
          gotoTabShortcut(1),
          gotoTabShortcut(2),
          gotoTabShortcut(3),
          gotoTabShortcut(4),
          gotoTabShortcut(5),
          gotoTabShortcut(6),
          gotoTabShortcut(7),
          gotoTabShortcut(8),
          {
            label: `Last Tab`,
            enabled: !noWindows,
            accelerator: `CmdOrCtrl+9`,
            click: function (item) {
              if (win) setActive(win, getAll$1(win).slice(-1)[0]);
            }
          }
        ]
      },
      {
        id: 'popOutTab',
        label: 'Pop Out Tab',
        enabled: !noWindows,
        accelerator: 'Shift+CmdOrCtrl+P',
        click: function (item) {
          if (tab) popOutTab(tab);
        }
      }
    ]
  };
  if (process.platform == 'darwin') {
    windowMenu.submenu.push({
      type: 'separator'
    });
    windowMenu.submenu.push({
      label: 'Bring All to Front',
      role: 'front'
    });
  }

  var helpMenu = {
    label: 'Help',
    role: 'help',
    submenu: [
      {
        id: 'walletsHelp',
        label: 'Wallets Help',
        accelerator: 'F1',
        click: function (item) {
          if (win) create$2(win, 'https://docs.walllets.app', {setActive: true});
        }
      },
      {type: 'separator'},
      {
        id: 'reportIssue',
        label: 'Report Issue',
        click: function (item) {
          if (win) create$2(win, 'https://github.com/walletsbrowser/wallets/issues', {setActive: true});
        }
      },
      {
        id: 'walletsDiscussions',
        label: 'Discussion Forum',
        click: function (item) {
          if (win) create$2(win, 'https://github.com/walletsbrowser/wallets/discussions', {setActive: true});
        }
      }
    ]
  };
  if (process.platform !== 'darwin') {
    helpMenu.submenu.push({ type: 'separator' });
    helpMenu.submenu.push({
      label: 'About',
      role: 'about',
      click: function (item) {
        if (win) create$2(win, 'wallets://settings', {setActive: true});
      }
    });
  }

  // assemble final menu
  var menus = [fileMenu, editMenu, viewMenu, driveMenu, historyMenu, developerMenu, windowMenu, helpMenu];
  if (process.platform === 'darwin') menus.unshift(darwinMenu);
  return menus
}

function triggerMenuItemById (menuLabel, id) {
  if (!currentMenuTemplate) return
  var items = currentMenuTemplate.find(menu => menu.label === menuLabel).submenu;
  if (!items) return
  var item = items.find(item => item.id === id);
  return item.click()
}

// internal helpers
// =

function createWindowIfNone (win, onShow) {
  if (win) return onShow(win)
  win = createShellWindow();
  win.once('show', onShow.bind(null, win));
}

// typedefs
// =

class BadParamError extends Error {
  /**
   * @param {string} msg
   */
  constructor (msg) {
    super();
    this.name = 'BadParamError';
    this.message = msg;
  }
}

/**
 * @typedef {Object} Visit
 * @prop {number} profileId
 * @prop {string} url
 * @prop {string} title
 * @prop {number} ts
 *
 * @typedef {Object} VisitSearchResult
 * @prop {string} offsets
 * @prop {string} url
 * @prop {string} title
 * @prop {number} num_visits
 */

// exported methods
// =

/**
 * @param {number} profileId
 * @param {Object} values
 * @param {string} values.url
 * @param {string} values.title
 * @returns {Promise<void>}
 */
const addVisit = async function (profileId, {url, title}) {
  // validate parameters
  if (!url || typeof url !== 'string') {
    throw new BadParamError('url must be a string')
  }
  if (!title || typeof title !== 'string') {
    throw new BadParamError('title must be a string')
  }

  var release = await lock('history-db');
  try {
    await run('BEGIN TRANSACTION;');

    var ts = Date.now();
    if (!url.startsWith('wallets://')) { // dont log stats on internal sites, keep them out of the search
      // get current stats
      var stats = await get$2('SELECT * FROM visit_stats WHERE url = ?;', [url]);

      // create or update stats
      if (!stats) {
        await run('INSERT INTO visit_stats (url, num_visits, last_visit_ts) VALUES (?, ?, ?);', [url, 1, ts]);
        await run('INSERT INTO visit_fts (url, title) VALUES (?, ?);', [url, title]);
      } else {
        let num_visits = (+stats.num_visits || 1) + 1;
        await run('UPDATE visit_stats SET num_visits = ?, last_visit_ts = ? WHERE url = ?;', [num_visits, ts, url]);
      }
    }

    // visited within 1 hour?
    var visit = await get$2('SELECT rowid, * from visits WHERE profileId = ? AND url = ? AND ts > ? ORDER BY ts DESC LIMIT 1', [profileId, url, ts - 1000 * 60 * 60]);
    if (visit) {
      // update visit ts and title
      await run('UPDATE visits SET ts = ?, title = ? WHERE rowid = ?', [ts, title, visit.rowid]);
    } else {
      // log visit
      await run('INSERT INTO visits (profileId, url, title, tabClose, ts) VALUES (?, ?, ?, ?, ?);', [profileId, url, title, 0, ts]);
    }

    await run('COMMIT;');
  } catch (e) {
    await run('ROLLBACK;');
    throw e
  } finally {
    release();
  }
};

/**
 * @param {number} profileId
 * @param {Object} values
 * @param {string} values.url
 * @param {string} values.title
 * @returns {Promise<void>}
 */
const addTabClose = async function (profileId, {url, title}) {
  // validate parameters
  if (!url || typeof url !== 'string') {
    throw new BadParamError('url must be a string')
  }
  if (!title || typeof title !== 'string') {
    throw new BadParamError('title must be a string')
  }

  var release = await lock('history-db');
  try {
    await run('BEGIN TRANSACTION;');

    var ts = Date.now();
    // visited within 1 hour?
    var visit = await get$2('SELECT rowid, * from visits WHERE profileId = ? AND url = ? AND ts > ? ORDER BY ts DESC LIMIT 1', [profileId, url, ts - 1000 * 60 * 60]);
    if (visit) {
      // update visit ts and title
      await run('UPDATE visits SET ts = ?, title = ?, tabClose = ? WHERE rowid = ?', [ts, title, 1, visit.rowid]);
    } else {
      // log visit
      await run('INSERT INTO visits (profileId, url, title, tabClose, ts) VALUES (?, ?, ?, ?);', [profileId, url, title, 1, ts]);
    }

    await run('COMMIT;');
  } catch (e) {
    await run('ROLLBACK;');
    throw e
  } finally {
    release();
  }
};

/**
 * @param {number} profileId
 * @param {Object} opts
 * @param {string} [opts.search]
 * @param {number} [opts.offset]
 * @param {number} [opts.limit]
 * @param {number} [opts.before]
 * @param {number} [opts.after]
 * @param {Boolean} [opts.tabClose]
 * @returns {Promise<Array<Visit>>}
 */
const getVisitHistory = async function (profileId, {search, offset, limit, before, after, tabClose}) {
  var release = await lock('history-db');
  try {
    const params = /** @type Array<string | number> */([
      profileId,
      limit || 50,
      offset || 0
    ]);
    if (search) {
      // prep search terms
      params.push(
        search
          .toLowerCase() // all lowercase. (uppercase is interpretted as a directive by sqlite.)
          .replace(/[:^*]/g, '') + // strip symbols that sqlite interprets.
          '*' // allow partial matches
      );
      return await all(`
        SELECT visits.*
          FROM visit_fts
            LEFT JOIN visits ON visits.url = visit_fts.url
          WHERE visits.profileId = ?1 AND visit_fts MATCH ?4 ${tabClose ? `AND tabClose = 1` : ''}
          ORDER BY visits.ts DESC
          LIMIT ?2 OFFSET ?3
      `, params)
    }
    let where = '';
    if (before && after) {
      where += 'AND ts <= ?4 AND ts >= ?5';
      params.push(before);
      params.push(after);
    } else if (before) {
      where += 'AND ts <= ?4';
      params.push(before);
    } else if (after) {
      where += 'AND ts >= ?4';
      params.push(after);
    }
    if (tabClose) {
      where += `AND tabClose = 1`;
    }
    return await all(`
      SELECT * FROM visits
        WHERE profileId = ?1 ${where}
        ORDER BY ts DESC
        LIMIT ?2 OFFSET ?3
    `, params)
  } finally {
    release();
  }
};

/**
 * @param {number} profileId
 * @param {Object} opts
 * @param {number} [opts.offset]
 * @param {number} [opts.limit]
 * @returns {Promise<Array<Visit>>}
 */
const getMostVisited = async function (profileId, { offset, limit }) {
  var release = await lock('history-db');
  try {
    offset = offset || 0;
    limit = limit || 50;
    return await all(`
      SELECT visit_stats.*, visits.title AS title
        FROM visit_stats
          LEFT JOIN visits ON visits.url = visit_stats.url
        WHERE profileId = ? AND visit_stats.num_visits > 5
        GROUP BY visit_stats.url
        ORDER BY num_visits DESC, last_visit_ts DESC
        LIMIT ? OFFSET ?
    `, [profileId, limit, offset])
  } finally {
    release();
  }
};

/**
 * @param {string} q
 * @returns {Promise<Array<VisitSearchResult>>}
 */
const search = async function (q) {
  if (!q || typeof q !== 'string') {
    throw new BadParamError('q must be a string')
  }

  var release = await lock('history-db');
  try {
    // prep search terms
    q = q
      .toLowerCase() // all lowercase. (uppercase is interpretted as a directive by sqlite.)
      .replace(/[:^*]/g, '') // strip symbols that sqlite interprets
      .replace(/[-]/g, ' ') + // strip symbols that sqlite interprets
      '*'; // allow partial matches

    // run query
    return await all(`
      SELECT offsets(visit_fts) as offsets, visit_fts.url, visit_fts.title, visit_stats.num_visits
        FROM visit_fts
        LEFT JOIN visit_stats ON visit_stats.url = visit_fts.url
        WHERE visit_fts MATCH ? AND visit_stats.num_visits > 2
        ORDER BY visit_stats.num_visits DESC
        LIMIT 10;
    `, [q])
  } finally {
    release();
  }
};

/**
 * @param {string} url
 * @returns {Promise<void>}
 */
const removeVisit = async function (url) {
  // validate parameters
  if (!url || typeof url !== 'string') {
    throw new BadParamError('url must be a string')
  }

  var release = await lock('history-db');
  try {
    serialize();
    run('BEGIN TRANSACTION;');
    run('DELETE FROM visits WHERE url = ?;', url);
    run('DELETE FROM visit_stats WHERE url = ?;', url);
    run('DELETE FROM visit_fts WHERE url = ?;', url);
    await run('COMMIT;');
  } catch (e) {
    await run('ROLLBACK;');
    throw e
  } finally {
    parallelize();
    release();
  }
};

/**
 * @param {number} timestamp
 * @returns {Promise<void>}
 */
const removeVisitsAfter = async function (timestamp) {
  var release = await lock('history-db');
  try {
    serialize();
    run('BEGIN TRANSACTION;');
    run('DELETE FROM visits WHERE ts >= ?;', timestamp);
    run('DELETE FROM visit_stats WHERE last_visit_ts >= ?;', timestamp);
    await run('COMMIT;');
  } catch (e) {
    await run('ROLLBACK;');
    throw e
  } finally {
    parallelize();
    release();
  }
};

/**
 * @returns {Promise<void>}
 */
const removeAllVisits = async function () {
  var release = await lock('history-db');
  run('DELETE FROM visits;');
  run('DELETE FROM visit_stats;');
  run('DELETE FROM visit_fts;');
  release();
};

var history = /*#__PURE__*/Object.freeze({
  __proto__: null,
  addVisit: addVisit,
  addTabClose: addTabClose,
  getVisitHistory: getVisitHistory,
  getMostVisited: getMostVisited,
  search: search,
  removeVisit: removeVisit,
  removeVisitsAfter: removeVisitsAfter,
  removeAllVisits: removeAllVisits
});

async function get$b (key) {
  return get$2(knex('folder_syncs').where({key}))
}

async function getPath (key) {
  var setting = await get$b(key);
  return setting ? setting.localPath : undefined
}

async function insert$1 (key, values) {
  return run(knex('folder_syncs').insert(Object.assign({key}, values)))
}

async function update$2 (key, values) {
  return run(knex('folder_syncs').update(values).where({key}))
}

async function del (key) {
  return run(knex('folder_syncs').where({key}).del())
}

// exported api
// =

async function setup$l () {
  var privateDrive = get$e();

  var exists = await privateDrive.pda.stat('/beaker/pins.json').catch(e => false);
  if (exists) return

  // migrate bookmarks
  var pins = [];
  for (let bookmark of await query$1(privateDrive, {path: '/bookmarks/*.goto'})) {
    if (bookmark.stat.metadata.pinned || bookmark.stat.metadata['beaker/pinned']) {
      pins.push(normalizeUrl(bookmark.stat.metadata.href));
      await privateDrive.pda.deleteMetadata(bookmark.path, ['pinned', 'beaker/pinned']);
    }
  }
  await write(pins);
}

async function getCurrent () {
  return read()
}

async function add (url) {
  var data = await read();
  if (!data.includes(url)) {
    data.push(url);
    await write(data);
  }
}

async function remove$1 (url) {
  var data = await read();
  var index = data.indexOf(url);
  if (index === -1) return
  data.splice(index, 1);
  await write(data);
}

// internal methods
// =

async function read () {
  var data;
  try { data = await get$e().pda.readFile('/beaker/pins.json').then(JSON.parse); }
  catch (e) { data = []; }
  data = data.filter(b => b && typeof b === 'string').map(v => normalizeUrl(v));
  return data
}

async function write (data) {
  data = data && Array.isArray(data) ? data : [];
  data = data.filter(b => b && typeof b === 'string');
  await get$e().pda.mkdir('/beaker').catch(e => undefined);
  await get$e().pda.writeFile('/beaker/pins.json', JSON.stringify(data, null, 2));
}

// exported
// =

/**
 * @returns {Promise<Object>}
 */
async function list$1 () {
  var privateDrive = get$e();

  var bookmarks =  await query$1(privateDrive, {path: '/bookmarks/*.goto'});
  var pins = await getCurrent();
  return bookmarks.map(r => massageBookmark(r, pins))
}

/**
 * @param {string} href
 * @returns {Promise<Object>}
 */
async function get$c (href) {
  href = normalizeUrl(href);
  var bookmarks = await list$1();
  return bookmarks.find(b => b.href === href)
}

/**
 * @param {Object} bookmark
 * @param {string} bookmark.href
 * @param {string} bookmark.title
 * @param {Boolean} bookmark.pinned
 * @returns {Promise<string>}
 */
async function add$1 ({href, title, pinned}) {
  href = normalizeUrl(href);
  var drive = get$e();

  let existing = await get$c(href);
  if (existing) {
    if (typeof title === 'undefined') title = existing.title;
    if (typeof pinned === 'undefined') pinned = existing.pinned;

    let urlp = new url.URL(existing.bookmarkUrl);
    await drive.pda.updateMetadata(urlp.pathname, {href, title});
    if (pinned !== existing.pinned) {
      if (pinned) await add(href);
      else await remove$1(href);
    }
    return
  }

  // new bookmark
  var slug = createResourceSlug(href, title);
  var filename = await getAvailableName('/bookmarks', slug, 'goto', drive); // avoid collisions
  var path = joinPath('/bookmarks', filename);
  await ensureDir('/bookmarks', drive);
  await drive.pda.writeFile(path, '', {metadata: {href, title}});
  if (pinned) await add(href);
  return path
}

/**
 * @param {string} href
 * @returns {Promise<void>}
 */
async function remove$2 (href) {
  let existing = await get$c(href);
  if (!existing) return
  let urlp = new url.URL(existing.bookmarkUrl);
  let drive = await getOrLoadDrive(urlp.hostname);
  await drive.pda.unlink(urlp.pathname);
  if (existing.pinned) await remove$1(existing.href);
}

async function migrateBookmarksFromSqlite () {
  var bookmarks = await all(`SELECT * FROM bookmarks`);
  for (let bookmark of bookmarks) {
    await add$1({
      href: bookmark.url,
      title: bookmark.title,
      pinned: false, // pinned: bookmark.pinned - DONT migrate this because 0.8 pinned bookmarks are often dat://
    });
  }
}

// internal
// =

function massageBookmark (result, pins) {
  let href = normalizeUrl(result.stat.metadata.href) || '';
  return {
    bookmarkUrl: result.url,
    href,
    title: result.stat.metadata.title || href || '',
    pinned: pins.includes(href)
  }
}

var bookmarksAPI = /*#__PURE__*/Object.freeze({
  __proto__: null,
  list: list$1,
  get: get$c,
  add: add$1,
  remove: remove$2,
  migrateBookmarksFromSqlite: migrateBookmarksFromSqlite
});

const ERR_ABORTED = -3;
const ERR_CONNECTION_REFUSED = -102;
const ERR_INSECURE_RESPONSE = -501;
const TLS_ERROR_CODES = Object.values({
  ERR_NO_SSL_VERSIONS_ENABLED: -112,
  ERR_SSL_VERSION_OR_CIPHER_MISMATCH: -113,
  ERR_SSL_RENEGOTIATION_REQUESTED: -114,
  ERR_PROXY_AUTH_UNSUPPORTED: -115,
  ERR_CERT_ERROR_IN_SSL_RENEGOTIATION: -116,
  ERR_BAD_SSL_CLIENT_AUTH_CERT: -117,
  ERR_SSL_NO_RENEGOTIATION: -123,
  ERR_SSL_WEAK_SERVER_EPHEMERAL_DH_KEY: -129,
  ERR_PROXY_CERTIFICATE_INVALID: -136,
  ERR_SSL_HANDSHAKE_NOT_COMPLETED: -148,
  ERR_SSL_BAD_PEER_PUBLIC_KEY: -149,
  ERR_SSL_PINNED_KEY_NOT_IN_CERT_CHAIN: -150,
  ERR_CLIENT_AUTH_CERT_TYPE_UNSUPPORTED: -151,
  ERR_SSL_DECRYPT_ERROR_ALERT: -153,
  ERR_SSL_SERVER_CERT_CHANGED: -156,
  ERR_SSL_UNRECOGNIZED_NAME_ALERT: -159,
  ERR_SSL_SERVER_CERT_BAD_FORMAT: -167,
  ERR_CT_STH_PARSING_FAILED: -168,
  ERR_CT_STH_INCOMPLETE: -169,
  ERR_CT_CONSISTENCY_PROOF_PARSING_FAILED: -171,
  ERR_SSL_OBSOLETE_CIPHER: -172,
  ERR_SSL_VERSION_INTERFERENCE: -175,
  ERR_EARLY_DATA_REJECTED: -178,
  ERR_WRONG_VERSION_ON_EARLY_DATA: -179,
  ERR_TLS13_DOWNGRADE_DETECTED: -180
});
const IS_CODE_INSECURE_RESPONSE = x => x === ERR_CONNECTION_REFUSED || x === ERR_INSECURE_RESPONSE || (x <= -200 && x > -300) || TLS_ERROR_CODES.includes(x);

const TRIGGER_LIVE_RELOAD_DEBOUNCE = 500; // throttle live-reload triggers by this amount
const STATUS_BAR_HEIGHT = 22;

// the variables which are automatically sent to the shell-window for rendering
const STATE_VARS = [
  'id',
  'url',
  'title',
  'siteTitle',
  'siteSubtitle',
  'siteIcon',
  'siteTrust',
  'driveDomain',
  'driveIdent',
  'writable',
  'folderSyncPath',
  'peers',
  'favicons',
  'zoom',
  'loadError',
  // 'isActive', tab sends this
  // 'isPinned', tab sends this
  'isBookmarked',
  'isLoading',
  'isReceivingAssets',
  'canGoBack',
  'canGoForward',
  'isAudioMuted',
  'isCurrentlyAudible',
  'isInpageFindActive',
  'currentInpageFindString',
  'currentInpageFindResults',
  'donateLinkHref',
  'isLiveReloading'
];

// classes
// =

class Pane extends EventEmitter.EventEmitter {
  constructor (tab) {
    super();
    this.tab = tab;
    this.browserView = new electron.BrowserView({
      webPreferences: {
        preload: path__default.join(__dirname, 'fg', 'webview-preload', 'index.build.js'),
        nodeIntegrationInSubFrames: true,
        contextIsolation: true,
        worldSafeExecuteJavaScript: false, // TODO- this causes promises to fail in executeJavaScript, need to file an issue with electron
        webviewTag: false,
        sandbox: true,
        defaultEncoding: 'utf-8',
        nativeWindowOpen: true,
        nodeIntegration: false,
        scrollBounce: true,
        navigateOnDragDrop: true,
        enableRemoteModule: false,
        safeDialogs: true
      }
    });
    this.browserView.setBackgroundColor('#fff');

    // webview state
    this.loadingURL = null; // URL being loaded, if any
    this.isLoading = false; // is the pane loading?
    this.isReceivingAssets = false; // has the webview started receiving assets in the current load-cycle?
    this.favicons = null; // array of favicon URLs
    this.zoom = 0; // what's the current zoom level?
    this.loadError = null; // page error state, if any
    this.mainFrameId = undefined; // the frameRoutingId of the main frame
    this.frameUrls = {}; // map of frameRoutingId -> string (url)

    // browser state
    this.isActive = false; // is this the active pane in the tab?
    this.currentStatus = false; // the status-bar value
    this.liveReloadEvents = null; // live-reload event stream
    this.isInpageFindActive = false; // is the inpage-finder UI active?
    this.currentInpageFindString = undefined; // what's the current inpage-finder query string?
    this.currentInpageFindResults = undefined; // what's the current inpage-finder query results?
    this.fadeoutCssId = undefined; // injected CSS id to fade out the page content
    this.attachedPane = undefined; // pane which this pane is currently attached to
    this.wantsAttachedPane = false; // has the app asked for attached panes?
    this.attachedPaneEvents = new EventEmitter.EventEmitter(); // emitter for events specifically realted to the attached pane
    this.onAttachedPaneNavigated = (e, url) => this.attachedPaneEvents.emit('pane-navigated', {detail: {url}});

    // helper state
    this.folderSyncPath = undefined; // current folder sync path
    this.peers = 0; // how many peers does the site have?
    this.isBookmarked = false; // is the active page bookmarked?
    this.driveInfo = null; // metadata about the site if viewing a hyperdrive
    this.donateLinkHref = null; // the URL of the donate site, if set by the index.json
    this.wasDriveTimeout = false; // did the last navigation result in a timed-out hyperdrive?
    this.layoutHeight = undefined; // used by pane-layout to track height

    // wire up events
    this.webContents.on('did-start-loading', this.onDidStartLoading.bind(this));
    this.webContents.on('did-start-navigation', this.onDidStartNavigation.bind(this));
    this.webContents.on('did-navigate', this.onDidNavigate.bind(this));
    this.webContents.on('did-navigate-in-page', this.onDidNavigateInPage.bind(this));
    this.webContents.on('did-stop-loading', this.onDidStopLoading.bind(this));
    this.webContents.on('dom-ready', this.onDomReady.bind(this));
    this.webContents.on('did-fail-load', this.onDidFailLoad.bind(this));
    this.webContents.on('update-target-url', this.onUpdateTargetUrl.bind(this));
    this.webContents.on('page-title-updated', this.onPageTitleUpdated.bind(this)); // NOTE page-title-updated isn't documented on webContents but it is supported
    this.webContents.on('page-favicon-updated', this.onPageFaviconUpdated.bind(this));
    this.webContents.on('new-window', this.onNewWindow.bind(this));
    this.webContents.on('-will-add-new-contents', this.onWillAddNewContents.bind(this));
    this.webContents.on('media-started-playing', this.onMediaChange.bind(this));
    this.webContents.on('media-paused', this.onMediaChange.bind(this));
    this.webContents.on('found-in-page', this.onFoundInPage.bind(this));
    this.webContents.on('zoom-changed', this.onZoomChanged.bind(this));

    // security - deny these events
    const deny = e => e.preventDefault();
    this.webContents.on('remote-require', deny);
    this.webContents.on('remote-get-global', deny);
    this.webContents.on('remote-get-builtin', deny);
    this.webContents.on('remote-get-current-window', deny);
    this.webContents.on('remote-get-current-web-contents', deny);
    this.webContents.on('remote-get-guest-web-contents', deny);
  }

  get id () {
    return this.webContents.id
  }

  get webContents () {
    return this.browserView.webContents
  }

  get browserWindow () {
    return this.tab && this.tab.browserWindow
  }

  get url () {
    return this.webContents.getURL()
  }

  get origin () {
    return toOrigin(this.url)
  }

  get title () {
    var title = this.webContents.getTitle();
    if ((!title || toOrigin(title) === this.origin) && this.driveInfo?.title) {
      // fallback to the index.json title field if the page doesnt provide a title
      title = this.driveInfo.title;
    }
    return title
  }

  get siteTitle () {
    try {
      var urlp = new URL(this.loadingURL || this.url);
      var hostname = urlp.hostname;
      if (DRIVE_KEY_REGEX.test(hostname)) {
        hostname = hostname.replace(DRIVE_KEY_REGEX, v => `${v.slice(0, 6)}..${v.slice(-2)}`);
      }
      if (hostname.includes('+')) {
        hostname = hostname.replace(/\+[\d]+/, '');
      }
      if (this.driveInfo) {
        if (this.driveInfo.ident?.system) {
          return 'My Private Drive'
        }
      }
      if (urlp.protocol === 'wallets:') {
        if (urlp.hostname === 'diff') return 'Diff/Merge Tool'
        if (urlp.hostname === 'explorer') return 'Files Explorer'
        if (urlp.hostname === 'history') return 'History'
        if (urlp.hostname === 'library') return 'Library'
        if (urlp.hostname === 'settings') return 'Settings'
        if (urlp.hostname === 'webterm') return 'Webterm'
        return ''
      }
      return hostname + (urlp.port ? `:${urlp.port}` : '')
    } catch (e) {
      return ''
    }
  }

  get siteSubtitle () {
    if (this.driveInfo) {
      var origin = this.origin;
      var version = /\+([\d]+)/.exec(origin) ? `v${/\+([\d]+)/.exec(origin)[1]}` : '';
      var forkLabel = _get(listDrives$1().find(d => d.key === this.driveInfo.key), 'forkOf.label', '');
      return [forkLabel, version].filter(Boolean).join(' ')
    }
    return ''
  }

  get siteIcon () {
    if (this.driveInfo) {
      if (this.driveInfo.ident?.profile) {
        return 'fas fa-user-circle'
      }
      if (this.driveInfo.ident?.system) {
        return 'fas fa-lock'
      }
    }
    var url = this.loadingURL || this.url;
    if (url.startsWith('https:') && !(this.loadError && this.loadError.isInsecureResponse)) {
      return 'fas fa-check-circle'
    }
    if (url.startsWith('wallets:')) {
      return 'wallets-logo'
    }
    // return 'fas fa-info-circle'
  }

  get siteTrust () {
    try {
      var urlp = new URL(this.loadingURL || this.url);
      if (this.loadError && this.loadError.isInsecureResponse) {
        return 'untrusted'
      }
      if (['https:', 'wallets:'].includes(urlp.protocol)) {
        return 'trusted'
      }
      if (urlp.protocol === 'http:') {
        return 'untrusted'
      }
      if (urlp.protocol === 'hyper:' && this.driveInfo) {
        if (this.driveInfo.ident?.internal) {
          return 'trusted'
        }
      }
    } catch (e) {
    }
    return 'notrust'
  }

  get driveDomain () {
    return _get(this.driveInfo, 'domain', '')
  }

  get driveIdent () {
    if (this.driveInfo?.ident?.system) return 'system'
    if (this.driveInfo?.ident?.profile) return 'profile'
    return ''
  }

  get writable () {
    return _get(this.driveInfo, 'writable', false)
  }

  get canGoBack () {
    return this.webContents.canGoBack()
  }

  get canGoForward () {
    return this.webContents.canGoForward()
  }

  get isAudioMuted () {
    return this.webContents.isAudioMuted()
  }

  get isCurrentlyAudible () {
    return this.webContents.isCurrentlyAudible()
  }

  get isLiveReloading () {
    return !!this.liveReloadEvents
  }

  get state () {
    var state = _pick(this, STATE_VARS);
    if (this.loadingURL) state.url = this.loadingURL;
    return state
  }

  getIPCSenderInfo (event) {
    if (event.sender === this.webContents) {
      return {
        url: this.frameUrls[event.frameId],
        isMainFrame: event.frameId === this.mainFrameId
      }
    }
  }

  setTab (tab) {
    this.tab = tab;
    if (this.tab !== tab) {
      this.setAttachedPane(undefined);
    }
  }

  // management
  // =

  loadURL (url, opts = undefined) {
    this.webContents.loadURL(url, opts);
  }

  reload () {
    this.webContents.reload();
  }

  setBounds (bounds) {
    this.browserView.setBounds({
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height - STATUS_BAR_HEIGHT
    });
  }

  show ({noFocus} = {noFocus: false}) {
    if (this.tab.isHidden) return
    this.browserWindow.addBrowserView(this.browserView);
    if (!noFocus) this.webContents.focus();
    this.emit('showed');
  }

  focus () {
    if (this.tab.isHidden) return
    this.webContents.focus();
  }

  hide () {
    if (!this.browserWindow) return
    this.browserWindow.removeBrowserView(this.browserView);
  }

  destroy () {
    if (this.url && !this.url.startsWith('wallets://')) {
      addTabClose(0, {url: this.url, title: this.title});
    }
    this.hide();
    this.stopLiveReloading();
    this.browserView.webContents.destroy();
    this.emit('destroyed');
  }

  awaitActive () {
    return new Promise((resolve, reject) => {
      const showed = () => {
        this.removeListener('showed', showed);
        this.removeListener('destroyed', destroyed);
        resolve();
      };
      const destroyed = () => {
        this.removeListener('showed', showed);
        this.removeListener('destroyed', destroyed);
        reject();
      };
      this.on('showed', showed);
      this.on('destroyed', destroyed);
    })
  }

  async fadeout () {
    if (this.fadeoutCssId) return
    this.fadeoutCssId = await this.webContents.insertCSS(`body { opacity: 0.5 }`);
  }

  async fadein () {
    if (!this.fadeoutCssId) return
    await this.webContents.removeInsertedCSS(this.fadeoutCssId);
    this.fadeoutCssId = undefined;
  }

  transferWindow (targetWindow) {
    this.hide();
    this.browserWindow = targetWindow;
  }

  async updateHistory () {
    var url = this.url;
    var title = this.title;
    if (url && !url.startsWith('wallets://')) {
      addVisit(0, {url, title});
    }
  }

  toggleMuted () {
    this.webContents.setAudioMuted(!this.isAudioMuted);
  }

  async captureScreenshot () {
    try {
      // wait a sec to allow loading to finish
      var url = this.url;
      await new Promise(r => setTimeout(r, 2e3));

      // capture the page
      this.browserView.webContents.incrementCapturerCount({width: 1000, height: 800}, !this.isActive);
      var image = await this.browserView.webContents.capturePage();
      this.browserView.webContents.decrementCapturerCount(!this.isActive);
      var bounds = image.getSize();
      if (bounds.width === 0 || bounds.height === 0) return
      if (bounds.width <= bounds.height) return // only save if it's a useful image
      await set$1(url, 'screenshot', image.toDataURL(), {dontExtractOrigin: true, normalizeUrl: true});
    } catch (e) {
      // ignore, can happen if the pane was closed during wait
      console.log('Failed to capture page screenshot', e);
    }
  }

  // inpage finder
  // =

  showInpageFind () {
    if (this.tab.isHidden) return
    if (this.isInpageFindActive) {
      // go to next result on repeat "show" commands
      this.moveInpageFind(1);
    } else {
      this.isInpageFindActive = true;
      this.currentInpageFindResults = {activeMatchOrdinal: 0, matches: 0};
      this.emitUpdateState();
    }
    this.browserWindow.webContents.focus();
  }

  hideInpageFind () {
    this.webContents.stopFindInPage('clearSelection');
    this.isInpageFindActive = false;
    this.currentInpageFindString = undefined;
    this.currentInpageFindResults = undefined;
    this.emitUpdateState();
  }

  setInpageFindString (str, dir) {
    this.currentInpageFindString = str;
    this.webContents.findInPage(this.currentInpageFindString, {findNext: true, forward: dir !== -1});
  }

  moveInpageFind (dir) {
    if (!this.currentInpageFindString) return
    this.webContents.findInPage(this.currentInpageFindString, {findNext: false, forward: dir !== -1});
  }

  // live reloading
  // =

  async toggleLiveReloading (enable) {
    if (typeof enable === 'undefined') {
      enable = !this.liveReloadEvents;
    }
    if (this.liveReloadEvents) {
      this.liveReloadEvents.destroy();
      this.liveReloadEvents = false;
    } else if (this.driveInfo) {
      let drive = hyper.drives.getDrive(this.driveInfo.key);
      if (!drive) return

      let {version} = parseDriveUrl(this.url);
      let {checkoutFS} = await hyper.drives.getDriveCheckout(drive, version);
      this.liveReloadEvents = await checkoutFS.pda.watch();

      const reload = _throttle(() => {
        this.browserView.webContents.reload();
      }, TRIGGER_LIVE_RELOAD_DEBOUNCE, {leading: false});
      this.liveReloadEvents.on('data', ([evt]) => {
        if (evt === 'changed') reload();
      });
      // ^ note this throttle is run on the front edge.
      // That means snappier reloads (no delay) but possible double reloads if multiple files change
    }
    this.emitUpdateState();
  }

  stopLiveReloading () {
    if (this.liveReloadEvents) {
      this.liveReloadEvents.destroy();
      this.liveReloadEvents = false;
      this.emitUpdateState();
    }
  }

  // custom renderers
  // =

  async injectCustomRenderers () {
    // determine content type
    let contentType = getResourceContentType(this.url) || '';
    let isPlainText = contentType.startsWith('text/plain');
    let isJSON = contentType.startsWith('application/json') || (isPlainText && this.url.endsWith('.json'));
    let isJS = contentType.includes('/javascript') || (isPlainText && this.url.endsWith('.js'));
    let isCSS = contentType.startsWith('text/css') || (isPlainText && this.url.endsWith('.css'));

    // json rendering
    // inject the json render script
    if (isJSON) {
      this.webContents.insertCSS(`
        .hidden { display: none !important; }
        .json-formatter-row {
          font-family: Consolas, 'Lucida Console', Monaco, monospace !important;
          line-height: 1.6 !important;
          font-size: 13px;
        }
        .json-formatter-row > a > .json-formatter-preview-text {
          transition: none !important;
        }
        nav { margin-bottom: 5px; user-select: none; }
        nav > span {
          cursor: pointer;
          display: inline-block;
          font-family: Consolas, "Lucida Console", Monaco, monospace;
          cursor: pointer;
          font-size: 13px;
          background: rgb(250, 250, 250);
          padding: 3px 5px;
          margin-right: 5px;
        }
        nav > span.pressed {
          box-shadow: inset 2px 2px 2px rgba(0,0,0,.05);
          background: #ddd;
        }
      `);
      let jsonpath = path__default.join(electron.app.getAppPath(), 'fg', 'json-renderer', 'index.build.js');
      jsonpath = jsonpath.replace('app.asar', 'app.asar.unpacked'); // fetch from unpacked dir
      try {
        await this.webContents.executeJavaScript(await fs.promises.readFile(jsonpath, 'utf8'));
      } catch (e) {
        // ignore
      }
    }
    // js/css syntax highlighting
    if (isJS || isCSS) {
      this.webContents.insertCSS(`
      .hljs {
        display: block;
        overflow-x: auto;
        padding: 0.5em;
        background: white;
        color: black;
      }
      .hljs-comment, .hljs-quote, .hljs-variable { color: #008000; }
      .hljs-keyword, .hljs-selector-tag, .hljs-built_in, .hljs-name, .hljs-tag { color: #00f; }
      .hljs-string, .hljs-title, .hljs-section, .hljs-attribute, .hljs-literal, .hljs-template-tag, .hljs-template-variable, .hljs-type, .hljs-addition { color: #a31515; }
      .hljs-deletion, .hljs-selector-attr, .hljs-selector-pseudo, .hljs-meta { color: #2b91af; }
      .hljs-doctag { color: #808080; }
      .hljs-attr { color: #f00; }
      .hljs-symbol, .hljs-bullet, .hljs-link { color: #00b0e8; }
      .hljs-emphasis { font-style: italic; }
      .hljs-strong { font-weight: bold; }
      `);
      let scriptpath = path__default.join(electron.app.getAppPath(), 'fg', 'syntax-highlighter', 'index.js');
      scriptpath = scriptpath.replace('app.asar', 'app.asar.unpacked'); // fetch from unpacked dir
      try {
        await this.webContents.executeJavaScript(await fs.promises.readFile(scriptpath, 'utf8'));
      } catch (e) {
        // ignore
      }
    }
  }

  // state fetching
  // =

  // helper called by UIs to pull latest state if a change event has occurred
  // eg called by the bookmark systems after the bookmark state has changed
  async refreshState () {
    await Promise.all([
      this.fetchIsBookmarked(true),
      this.fetchDriveInfo(true)
    ]);
    this.emitUpdateState();
  }

  async fetchIsBookmarked (noEmit = false) {
    var wasBookmarked = this.isBookmarked;
    this.isBookmarked = !!(await get$c(this.url));
    if (this.isBookmarked && !wasBookmarked) {
      this.captureScreenshot();
    }
    if (!noEmit) {
      this.emitUpdateState();
    }
  }

  async fetchDriveInfo (noEmit = false) {
    // clear existing state
    this.folderSyncPath = undefined;
    this.peers = 0;
    this.donateLinkHref = null;

    if (!this.url.startsWith('hyper://')) {
      this.driveInfo = null;
      return
    }
    
    // fetch new state
    var key;
    try {
      key = await hyper.dns.resolveName(this.url);
      this.driveInfo = await hyper.drives.getDriveInfo(key);
      this.driveInfo.ident = await getDriveIdent(this.driveInfo.url, true);
      this.folderSyncPath = await getPath(this.driveInfo.key);
      this.peers = this.driveInfo.peers;
      this.donateLinkHref = _get(this, 'driveInfo.links.payment.0.href');
    } catch (e) {
      this.driveInfo = null;
    }
    if (!noEmit) this.emitUpdateState();
  }

  // attached pane
  // =

  setAttachedPane (pane) {
    if (this.attachedPane) {
      if (!this.attachedPane.webContents.isDestroyed()) {
        this.attachedPane.webContents.removeListener('did-navigate', this.onAttachedPaneNavigated);
      }
      this.attachedPaneEvents.emit('pane-detached');
    }
    this.attachedPane = pane;
    if (pane) {
      this.attachedPaneEvents.emit('pane-attached', {detail: {id: pane.id}});
      this.attachedPane.webContents.on('did-navigate', this.onAttachedPaneNavigated);
    }
    this.tab.emitPaneUpdateState();
  }

  // events
  // =

  emitUpdateState () {
    this.tab.emitTabUpdateState(this);
  }

  onDidStartLoading (e) {
    // update state
    this.loadingURL = null;
    this.isReceivingAssets = false;
    this.wasDriveTimeout = false;

    // emit
    this.emitUpdateState();
  }

  onDidStartNavigation (e, url, isInPlace, isMainFrame, frameProcessId, frameRoutingId) {
    this.frameUrls[frameRoutingId] = url;
    if (!isMainFrame) return
    this.mainFrameId = frameRoutingId;
    var origin = toOrigin(url);

    // handle origin changes
    if (origin !== toOrigin(this.url)) {
      this.stopLiveReloading();
      this.setAttachedPane(undefined);
      this.wantsAttachedPane = false;
    }

    // update state
    this.loadingURL = url;
    this.isLoading = true;
    this.emitUpdateState();
    // if (this.tab.isHidden) app.emit('custom-background-tabs-update', backgroundTabs) TODO
  }

  async onDidNavigate (e, url, httpResponseCode) {
    // remove any active subwindows
    close$2(this.tab);

    // read zoom
    setZoomFromSitedata(this);

    // update state
    this.loadError = null;
    this.loadingURL = null;
    this.isReceivingAssets = true;
    this.favicons = null;
    this.frameUrls = {[this.mainFrameId]: url}; // drop all non-main-frame URLs
    await Promise.all([
      this.fetchIsBookmarked(),
      this.fetchDriveInfo()
    ]);
    if (httpResponseCode === 504 && url.startsWith('hyper://')) {
      this.wasDriveTimeout = true;
    }

    // emit
    this.emitUpdateState();
  }

  onDidNavigateInPage (e) {
    this.fetchIsBookmarked();
    this.updateHistory();
  }

  onDidStopLoading () {
    this.updateHistory();

    // update state
    this.isLoading = false;
    this.loadingURL = null;
    this.isReceivingAssets = false;

    if (!this.url) {
      // aborted load on a new tab
      this.loadURL('about:blank');
    }

    // run custom renderer apps
    this.injectCustomRenderers();

    // emit
    if (!this.tab.isHidden) {
      onSetCurrentLocation(this.browserWindow, this.url);
    }
    this.emitUpdateState();
  }

  onDomReady (e) {
    // HACK
    // sometimes 'did-stop-loading' doesnt get fired
    // not sure why, but 'dom-ready' indicates that loading is done
    // if still isLoading or isReceivingAssets, run the did-stop-loading handler
    // -prf
    if (this.isLoading || this.isReceivingAssets) {
      this.onDidStopLoading();
    }
  }

  async onDidFailLoad (e, errorCode, errorDescription, validatedURL, isMainFrame) {
    // ignore if this is a subresource
    if (!isMainFrame) return

    // ignore aborts. why:
    // - sometimes, aborts are caused by redirects. no biggy
    // - if the user cancels, then we dont want to give an error screen
    if (errorDescription == 'ERR_ABORTED' || errorCode == ERR_ABORTED) return

    // also ignore non-errors
    if (errorCode == 0) return

    // update state
    var isInsecureResponse = IS_CODE_INSECURE_RESPONSE(errorCode);
    this.loadError = {isInsecureResponse, errorCode, errorDescription, validatedURL};
    this.emitUpdateState();

    // render failure page
    var errorPageHTML = errorPage(this.loadError);
    try {
      await this.webContents.executeJavaScript('document.documentElement.innerHTML = \'' + errorPageHTML + '\'; undefined');
    } catch (e) {
      // ignore
    }
  }

  onUpdateTargetUrl (e, url) {
    if (this.tab.isHidden) return
    if (this.browserWindow.isDestroyed()) return
    this.currentStatus = url ? toNiceUrl(url) : url;
    this.tab.emitPaneUpdateState();
  }

  onPageTitleUpdated (e, title) {
    if (this.browserWindow && this.browserWindow.isDestroyed()) return
    this.emitUpdateState();
  }

  onPageFaviconUpdated (e, favicons) {
    this.favicons = favicons && favicons[0] ? favicons : null;

    if (this.favicons) {
      let url = this.url;
      this.webContents.executeJavaScriptInIsolatedWorld(999, [{code: `
        new Promise(async (resolve) => {
          var img = await new Promise(resolve => {
            var img = new Image()
            img.crossOrigin = 'Anonymous'
            img.onload = e => resolve(img)
            img.onerror = () => resolve(false)
            img.src = "${this.favicons[0]}"
          })
          if (!img) return resolve(undefined)
            
          let {width, height} = img
          var ratio = width / height
          if (width / height > ratio) { height = width / ratio } else { width = height * ratio }
        
          var canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          var ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)
          resolve(canvas.toDataURL('image/png'))
        })
      `}]).then((dataUrl, err) => {
        if (err) console.log(err);
        else if (dataUrl) {
          set$1(url, 'favicon', dataUrl);
        }
      });
    }
    
    this.emitUpdateState();
  }

  onNewWindow (e, url, frameName, disposition, options) {
    e.preventDefault();
    if (!this.isActive || !this.tab) return // only open if coming from the active pane
    var setActive = disposition === 'foreground-tab' || disposition === 'new-window';
    var setActiveBySettings = !setActive;
    this.tab.createTab(url, {setActive, setActiveBySettings, adjacentActive: true});
  }

  onWillAddNewContents (e, url) {
    // HACK
    // this should be handled by new-window, but new-window currently crashes
    // if you prevent default, so we handle it here
    // see https://github.com/electron/electron/issues/23859
    // -prf
    e.preventDefault();
    if (!this.tab) return
    this.tab.createTab(url, {setActive: true, adjacentActive: true});
  }

  onMediaChange (e) {
    // our goal with this event handler is to detect that audio is playing
    // this lets us then render an "audio playing" icon on the tab
    // for whatever reason, the event consistently precedes the "is audible" being set by at most 1s
    // so, we delay for 1s, then emit a state update
    setTimeout(() => this.emitUpdateState(), 1e3);
  }

  onFoundInPage (e, res) {
    this.currentInpageFindResults = {
      activeMatchOrdinal: res.activeMatchOrdinal,
      matches: res.matches
    };
    this.emitUpdateState();
  }

  onZoomChanged (e, zoomDirection) {
    if (zoomDirection === 'in') zoomIn(this);
    if (zoomDirection === 'out') zoomOut(this);
  }
}

// internal methods
// =

function toOrigin (str) {
  try {
    var u = new URL(str);
    return u.protocol + '//' + u.hostname + (u.port ? `:${u.port}` : '') + '/'
  } catch (e) { return '' }
}

const MIN_DIM_PCT = 5; // stacks and panes can't be smaller than this %
const PANE_BORDER_WIDTH = 2;

class PaneLayout extends EventEmitter.EventEmitter {
  constructor () {
    super();
    this.stacks = [];
    this.bounds = {};
  }

  get state () {
    let state = [];
    for (let id in this.bounds) {
      let b = this.bounds[id];
      state.push({
        id,
        isActive: b.pane?.tab?.primaryPane === b.pane,
        isEdge: b.isEdge,
        bounds: {x: b.x, y: b.y, width: b.width, height: b.height},
        url: b.pane.url,
        title: b.pane.title,
        status: b.pane.currentStatus,
        attachedPaneId: b.pane.attachedPane ? b.pane.attachedPane.id : undefined,
        wantsAttachedPane: b.pane.wantsAttachedPane
      });
    }
    return state
  }

  // management
  // =

  addPane (pane, {after, layoutWidth, layoutHeight, noRebalance} = {after: undefined, layoutWidth: undefined, layoutHeight: undefined, noRebalance: false}) {
    var stack = new PaneLayoutStack(this);
    if (layoutWidth) stack.layoutWidth = layoutWidth;
    else if (after) stack.layoutWidth = after.layoutWidth;
    else if (this.stacks[0]) stack.layoutWidth = this.stacks[0].layoutWidth;
    else stack.layoutWidth = 100;
    stack.addPane(pane, {layoutHeight, noRebalance});
    insert$2(this.stacks, stack, after);
    if (!noRebalance) this.rebalanceWidths();
    this.emit('changed');
  }

  addPaneToStack (stack, pane, {after, layoutHeight, noRebalance} = {after: undefined, layoutHeight: undefined, noRebalance: false}) {
    stack.addPane(pane, {after, layoutHeight, noRebalance});
    this.emit('changed');
  }

  removePane (pane) {
    var stack = this.findStack(pane);
    if (stack) {
      stack.removePane(pane);
      if (stack.empty) remove$3(this.stacks, stack);
    }
    this.rebalanceWidths();
    this.emit('changed');
  }

  findStack (pane) {
    for (let stack of this.stacks) {
      if (stack.contains(pane)) return stack
    }
  }

  getAdjacentPane (pane, dir) {
    var stack = this.findStack(pane);
    if (dir === 'up') {
      return stack.panes[stack.panes.indexOf(pane) - 1]
    }
    if (dir === 'down') {
      return stack.panes[stack.panes.indexOf(pane) + 1]
    }
    if (dir === 'left') {
      let stack2 = this.stacks[this.stacks.indexOf(stack) - 1];
      if (!stack2) return
      let i = Math.min(stack.panes.indexOf(pane), stack2.panes.length - 1);
      return stack2.panes[i]
    }
    if (dir === 'right') {
      let stack2 = this.stacks[this.stacks.indexOf(stack) + 1];
      if (!stack2) return
      let i = Math.min(stack.panes.indexOf(pane), stack2.panes.length - 1);
      return stack2.panes[i]
    }
  }

  movePane (pane, dir) {
    var stack = this.findStack(pane);
    var i = stack.panes.indexOf(pane);
    if (dir === 'up' || dir === 'down') {
      if (dir === 'up' && i > 0) {
        stack.panes.splice(i, 1);
        stack.panes.splice(i - 1, 0, pane);
      } else if (dir === 'down' && i < stack.panes.length - 1) {
        stack.panes.splice(i, 1);
        stack.panes.splice(i + 1, 0, pane);
      } else {
        return
      }
    }
    if (dir === 'left' || dir === 'right') {
      let stackIndex = this.stacks.indexOf(stack);
      let stack2 = this.stacks[stackIndex + (dir === 'left' ? -1 : 1)];
      if (!stack2) {
        if (stack.panes.length === 1) {
          return // dont create a new stack if this is the only pane in the stack
        }
        stack2 = new PaneLayoutStack(this);
        stack2.layoutWidth = stack.layoutWidth;
        if (dir === 'left') this.stacks.splice(0, 0, stack2);
        else this.stacks.push(stack2);
      }
      stack.panes.splice(i, 1);
      stack2.panes.splice(Math.max(i, stack2.panes.length), 0, pane);
      if (stack.empty) {
        remove$3(this.stacks, stack);
      } else {
        stack.rebalanceHeights();
      }
      this.rebalanceWidths();
      stack2.rebalanceHeights();
    }
    this.emit('changed');
  }

  // bounds
  // =

  computePanesBounds ({x, y, width, height}) {
    this.bounds = {};
    let stackX = x;
    let stackWidths = this.computeStackWidths(width);
    let isMultiplePanes = this.stacks.length > 1 || (this.stacks[0] && this.stacks[0].panes.length > 1);
    for (let i = 0; i < this.stacks.length; i++) {
      let stack = this.stacks[i];
      let stackWidth = stackWidths[i];
      let paneY = y;
      let paneHeights = stack.computePaneHeights(height);
      for (let j = 0; j < stack.panes.length; j++) {
        let pane = stack.panes[j];
        let paneHeight = paneHeights[j];
        let isEdge = {
          top: j === 0,
          bottom: j === stack.panes.length - 1,
          left: i === 0,
          right: i === this.stacks.length - 1
        };
        this.bounds[pane.id] = {pane, isEdge, x: stackX, y: paneY, width: stackWidth, height: paneHeight};
        if (isMultiplePanes) {
          if (isEdge.top) {
            this.bounds[pane.id].y += PANE_BORDER_WIDTH;
            this.bounds[pane.id].height -= PANE_BORDER_WIDTH;
          }
          if (!isEdge.right) {
            this.bounds[pane.id].width -= PANE_BORDER_WIDTH;
          }
          if (!isEdge.bottom) {
            this.bounds[pane.id].height -= PANE_BORDER_WIDTH;
          }
        }
        paneY += paneHeight;
      }
      stackX += stackWidth;
    }
  }

  changePaneWidth (pane, pct) {
    var stack = this.findStack(pane);
    if (!stack) return
    var nextStack = this.stacks[this.stacks.indexOf(stack) + 1];
    if (!nextStack) return
    if (stack.layoutWidth + pct < MIN_DIM_PCT) return
    if (nextStack.layoutWidth - pct < MIN_DIM_PCT) return
    stack.layoutWidth += pct;
    nextStack.layoutWidth -= pct;
  }

  changePaneHeight (pane, pct) {
    var stack = this.findStack(pane);
    if (!stack) return
    var nextPane = stack.panes[stack.panes.indexOf(pane) + 1];
    if (!nextPane) return
    if (pane.layoutHeight + pct < MIN_DIM_PCT) return
    if (nextPane.layoutHeight - pct < MIN_DIM_PCT) return
    pane.layoutHeight += pct;
    nextPane.layoutHeight -= pct;
  }

  rebalanceAll () {
    this.rebalanceWidths();
    for (let stack of this.stacks) {
      stack.rebalanceHeights();
    }
  }

  rebalanceWidths () {
    if (!this.stacks.length) return
    
    // redistribute to 100%
    var total = this.stacks.reduce((acc, s) => acc + s.layoutWidth, 0);
    var scale = 100 / total;
    for (let stack of this.stacks) {
      stack.layoutWidth = Math.max(Math.round(stack.layoutWidth * scale), MIN_DIM_PCT + 1);
    }

    // make sure we add up to 100
    total = this.stacks.reduce((acc, s) => acc + s.layoutWidth, 0);
    if (total !== 100) {
      for (let stack of this.stacks) {
        if (stack.layoutWidth + (100 - total) > MIN_DIM_PCT) {
          stack.layoutWidth += (100 - total);
          break
        }
      }
    }
  }

  computeStackWidths (width) {
    return this.stacks.map(stack => Math.round(stack.layoutWidth / 100 * width))
  }

  getBoundsForPane (pane) {
    return this.bounds[pane.id]
  }
}

class PaneLayoutStack {
  constructor (layout) {
    this.layout = layout;
    this.panes = [];
    this.layoutWidth = undefined;
  }

  get empty () {
    return this.panes.length === 0
  }

  contains (pane) {
    return this.panes.includes(pane)
  }

  // management
  // =

  addPane (pane, {after, layoutHeight, noRebalance} = {after: undefined, layoutHeight: undefined, noRebalance: false}) {
    if (layoutHeight) pane.layoutHeight = layoutHeight;
    else if (after) pane.layoutHeight = after.layoutHeight;
    else if (this.panes[0]) pane.layoutHeight = this.panes[0].layoutHeight;
    else pane.layoutHeight = 100;
    insert$2(this.panes, pane, after);
    if (!noRebalance) this.rebalanceHeights();
  }

  removePane (pane) {
    remove$3(this.panes, pane);
    this.rebalanceHeights();
  }

  // bounds
  // =

  rebalanceHeights () {
    if (this.empty) return

    // redistribute to 100%
    var total = this.panes.reduce((acc, p) => acc + p.layoutHeight, 0);
    var scale = 100 / total;
    for (let pane of this.panes) {
      pane.layoutHeight = Math.max(Math.round(pane.layoutHeight * scale), MIN_DIM_PCT + 1);
    }

    // make sure we add up to 100
    total = this.panes.reduce((acc, p) => acc + p.layoutHeight, 0);
    if (total !== 100) {
      for (let pane of this.panes) {
        if (pane.layoutHeight + (100 - total) > MIN_DIM_PCT) {
          pane.layoutHeight += 100 - total;
          break
        }
      }
    }
  }

  computePaneHeights (height) {
    return this.panes.map(pane => Math.round(pane.layoutHeight / 100 * height))
  }
}

function insert$2 (arr, item, after = undefined) {
  if (after) {
    let i = arr.indexOf(after);
    if (i !== -1) arr.splice(i + 1, 0, item);
    else arr.push(item);
  } else {
    arr.unshift(item);
  }
}

function remove$3 (arr, item) {
  let i = arr.indexOf(item);
  if (i === -1) return
  arr.splice(i, 1);
}

var viewsRPCManifest = {
  createEventStream: 'readable',
  refreshState: 'promise',
  getState: 'promise',
  getTabState: 'promise',
  getNetworkState: 'promise',
  getBackgroundTabs: 'promise',
  createTab: 'promise',
  createPane: 'promise',
  togglePaneByOrigin: 'promise',
  loadURL: 'promise',
  minimizeTab: 'promise',
  closeTab: 'promise',
  setActiveTab: 'promise',
  reorderTab: 'promise',
  restoreBgTab: 'promise',
  closeBgTab: 'promise',
  showTabContextMenu: 'promise',
  showLocationBarContextMenu: 'promise',
  goBack: 'promise',
  goForward: 'promise',
  stop: 'promise',
  reload: 'promise',
  resetZoom: 'promise',
  toggleLiveReloading: 'promise',
  toggleDevTools: 'promise',
  print: 'promise',
  showInpageFind: 'promise',
  hideInpageFind: 'promise',
  setInpageFindString: 'promise',
  moveInpageFind: 'promise',
  showLocationBar: 'promise',
  hideLocationBar: 'promise',
  runLocationBarCmd: 'promise',
  toggleSidebarHidden: 'promise',
  showMenu: 'promise',
  toggleMenu: 'promise',
  updateMenu: 'promise',
  toggleSiteInfo: 'promise',
  focusShellWindow: 'promise',
  focusPage: 'promise',
  setPaneResizeModeEnabled: 'promise',
  openPaneMenu: 'promise',
  openAttachMenu: 'promise'
};

// NOTE
// subtle but important!!
// the menu instance needs to be kept in the global scope
// otherwise the JS GC will kick in and clean up the menu object
// which causes the context-menu to destroy prematurely
// see https://github.com/electron/electron/issues/19424
// -prf
var menuInstance;

function registerContextMenu () {
  // register the context menu on every created webContents
  electron.app.on('web-contents-created', (e, webContents) => {
    webContents.on('context-menu', async (e, props) => {
      var menuItems = [];
      const { mediaFlags, editFlags } = props;
      const isHyperdrive = props.pageURL.startsWith('hyper://');
      const hasText = props.selectionText.trim().length > 0;
      const can = type => editFlags[`can${type}`] && hasText;
      const isMisspelled = props.misspelledWord;
      const spellingSuggestions = props.dictionarySuggestions;
      // get the focused window, ignore if not available (not in focus)
      // - fromWebContents(webContents) doesnt seem to work, maybe because webContents is often a webview?
      var targetWindow = electron.BrowserWindow.getFocusedWindow();
      if (!targetWindow) { return }
      var targetTab = getActive(targetWindow);

      // handle shell UI specially
      if (props.pageURL == 'wallets://shell-window/') { return }
      if (props.pageURL.startsWith('wallets://modals')) {
        return handleContextMenu(webContents, targetWindow, can, props)
      }

      // helper to call code on the element under the cursor
      const callOnElement = js => webContents.executeJavaScript(`
        var el = document.elementFromPoint(${props.x}, ${props.y})
        new Promise(resolve => { ${js} })
      `);

      // helper to run a download prompt for media
      const downloadPrompt = (field, ext) => async (item, win) => {
        var defaultPath = path__default.join(electron.app.getPath('downloads'), path__default.basename(props[field]));
        if (ext && defaultPath.split('/').pop().indexOf('.') === -1) defaultPath += ext;
        var {filePath} = await electron.dialog.showSaveDialog({ title: `Save ${props.mediaType} as...`, defaultPath });
        if (filePath) { download(win, webContents, props[field], { saveAs: filePath }); }
      };

      // links
      if (props.linkURL) {
        menuItems.push({ label: 'Open Link in New Tab', click: (item, win) => create$2(win, props.linkURL, {setActiveBySettings: true, adjacentActive: true}) });
        menuItems.push({ label: 'Copy Link Address', click: () => electron.clipboard.writeText(props.linkURL) });
        menuItems.push({ label: 'Save Link As...', click: downloadPrompt('linkURL', '.html') });
        menuItems.push({ type: 'separator' });
        menuItems.push({
          label: 'Open in Pane Right',
          click () {
            var pane = targetTab && targetTab.findPane(webContents);
            if (targetTab && pane) {
              let lastStack = targetTab.layout.stacks[targetTab.layout.stacks.length - 1];
              if (targetTab.layout.stacks.length > 1 && !lastStack.panes.find(p => p === pane)) {
                // stack in the adjacent stack
                targetTab.createPane({url: props.linkURL, setActive: true, after: lastStack.panes[lastStack.panes.length - 1], splitDir: 'horz'});
              } else {
                // open in a new rightmost stack
                targetTab.createPane({url: props.linkURL, setActive: true, after: pane, splitDir: 'vert'});
              }
            }
          }
        });
        menuItems.push({
          label: 'Open in Pane Below',
          click () {
            var pane = targetTab && targetTab.findPane(webContents);
            if (targetTab && pane) {
              targetTab.createPane({url: props.linkURL, setActive: true, after: pane, splitDir: 'horz'});
            }
          }
        });
        menuItems.push({ type: 'separator' });
      }

      // images
      if (props.mediaType == 'image') {
        menuItems.push({ label: 'Save Image As...', click: downloadPrompt('srcURL') });
        menuItems.push({ label: 'Copy Image', click: () => webContents.copyImageAt(props.x, props.y) });
        menuItems.push({ label: 'Copy Image URL', click: () => electron.clipboard.writeText(props.srcURL) });
        menuItems.push({ label: 'Open Image in New Tab', click: (item, win) => create$2(win, props.srcURL, {adjacentActive: true}) });
        menuItems.push({ type: 'separator' });
        menuItems.push({
          label: 'Open in Pane Right',
          click () {
            var pane = targetTab && targetTab.findPane(webContents);
            if (targetTab && pane) {
              targetTab.createPane({url: props.srcURL, setActive: true, after: pane, splitDir: 'vert'});
            }
          }
        });
        menuItems.push({
          label: 'Open in Pane Below',
          click () {
            var pane = targetTab && targetTab.findPane(webContents);
            if (targetTab && pane) {
              targetTab.createPane({url: props.srcURL, setActive: true, after: pane, splitDir: 'horz'});
            }
          }
        });
        menuItems.push({ type: 'separator' });
      }

      // videos and audios
      if (props.mediaType == 'video' || props.mediaType == 'audio') {
        menuItems.push({ label: 'Loop', type: 'checkbox', checked: mediaFlags.isLooping, click: () => callOnElement('el.loop = !el.loop') });
        if (mediaFlags.hasAudio) { menuItems.push({ label: 'Muted', type: 'checkbox', checked: mediaFlags.isMuted, click: () => callOnElement('el.muted = !el.muted') }); }
        if (mediaFlags.canToggleControls) { menuItems.push({ label: 'Show Controls', type: 'checkbox', checked: mediaFlags.isControlsVisible, click: () => callOnElement('el.controls = !el.controls') }); }
        menuItems.push({ type: 'separator' });
      }

      // videos
      if (props.mediaType == 'video') {
        menuItems.push({ label: 'Save Video As...', click: downloadPrompt('srcURL') });
        menuItems.push({ label: 'Copy Video URL', click: () => electron.clipboard.writeText(props.srcURL) });
        menuItems.push({ label: 'Open Video in New Tab', click: (item, win) => create$2(win, props.srcURL, {adjacentActive: true}) });
        menuItems.push({ type: 'separator' });
      }

      // audios
      if (props.mediaType == 'audio') {
        menuItems.push({ label: 'Save Audio As...', click: downloadPrompt('srcURL') });
        menuItems.push({ label: 'Copy Audio URL', click: () => electron.clipboard.writeText(props.srcURL) });
        menuItems.push({ label: 'Open Audio in New Tab', click: (item, win) => create$2(win, props.srcURL, {adjacentActive: true}) });
        menuItems.push({ type: 'separator' });
      }

      // spell check
       if (props.isMisspelled !== '' && props.isEditable) {
         menuItems.push({label: 'Add to dictionary', click: () => webContents.session.addWordToSpellCheckerDictionary(isMisspelled)});
         if (spellingSuggestions) {
           for (let i in spellingSuggestions) {
             menuItems.push({ label: spellingSuggestions[i], click: (item, win) => webContents.replaceMisspelling(item.label, {adjacentActive: true}) });
           }
         }
         menuItems.push({ type: 'separator' });
       }

      // clipboard
      if (props.isEditable) {
        menuItems.push({ label: 'Cut', role: 'cut', enabled: can('Cut') });
        menuItems.push({ label: 'Copy', role: 'copy', enabled: can('Copy') });
        menuItems.push({ label: 'Paste', role: 'paste', enabled: editFlags.canPaste });
        menuItems.push({ type: 'separator' });
      } else if (hasText) {
        menuItems.push({ label: 'Copy', role: 'copy', enabled: can('Copy') });
        menuItems.push({ type: 'separator' });
      }

      // web search
      if (hasText) {
        var searchPreviewStr = props.selectionText.substr(0, 30); // Trim search preview to keep it reasonably sized
        searchPreviewStr = searchPreviewStr.replace(/\s/gi, ' '); // Replace whitespace chars with space
        searchPreviewStr = searchPreviewStr.replace(/[\u061c\u200E\u200f\u202A-\u202E]+/g, ''); // Remove directional text control chars
        if (searchPreviewStr.length < props.selectionText.length) { // Add ellipsis if search preview was trimmed
          searchPreviewStr += '..."';
        } else {
          searchPreviewStr += '"';
        }
        var searchEngines = await get$1('search_engines');
        var searchEngine = searchEngines.find(se => se.selected) || searchEngines[0];
        var query = searchEngine.url+ '?q=' + encodeURIComponent(props.selectionText.substr(0, 500)); // Limit query to prevent too long query error from DDG
        menuItems.push({ label: 'Search ' + searchEngine.name + ' for "' + searchPreviewStr, click: (item, win) => create$2(win, query, {adjacentActive: true}) });
        menuItems.push({ type: 'separator' });
      }

      if (!props.linkURL && props.mediaType === 'none' && !hasText) {
        menuItems.push(createMenuItem('back', {webContents, tab: targetTab}));
        menuItems.push(createMenuItem('forward', {webContents, tab: targetTab}));
        menuItems.push(createMenuItem('reload', {webContents, tab: targetTab}));
        menuItems.push({ type: 'separator' });
      }
      
      if (getAddedWindowSettings(targetWindow).isShellInterfaceHidden) {
        menuItems.push({
          label: 'Restore Browser UI',
          click: function () {
            toggleShellInterface(targetWindow);
          }
        });
        menuItems.push({ type: 'separator' });
      }

      menuItems.push(createMenuItem('split-pane-vert', {webContents, tab: targetTab}));
      menuItems.push(createMenuItem('split-pane-horz', {webContents, tab: targetTab}));
      if (shouldShowMenuItem('move-pane', {tab: targetTab})) {
        menuItems.push(createMenuItem('move-pane', {webContents, tab: targetTab}));
      }
      menuItems.push(createMenuItem('close-pane', {webContents, tab: targetTab}));
      menuItems.push({ type: 'separator' });
      menuItems.push({
        label: 'Export Page As...',
        click: downloadPrompt('pageURL', '.html')
      });
      menuItems.push({
        label: 'Print...',
        click: () => webContents.print()
      });
      menuItems.push({ type: 'separator' });

      if (isHyperdrive) {
        menuItems.push({
          label: 'Edit Page Source',
          click: async (item, win) => {
            if (targetTab) targetTab.createOrFocusPaneByOrigin({url: 'wallets://editor/', setActive: true});
          }
        });
        menuItems.push({
          label: 'Explore Files',
          click: async (item, win) => {
            if (targetTab) targetTab.createOrFocusPaneByOrigin({url: 'wallets://explorer/', setActive: true});
          }
        });
      }
      menuItems.push({ type: 'separator' });
      menuItems.push(createMenuItem('inspect-element', {webContents, tab: targetTab, x: props.x, y: props.y}));

      // show menu
      menuInstance = electron.Menu.buildFromTemplate(menuItems);
      menuInstance.popup({ window: targetWindow });
    });
  });
}

function shouldShowMenuItem (id, {tab, webContents}) {
  switch (id) {
    case 'move-pane':
      return (tab.panes.length > 1)
    default:
      return true
  }
}

function createMenuItem (id, {tab, webContents, x, y}) {
  switch (id) {
    case 'back':
      return {
        label: 'Back',
        enabled: webContents.canGoBack(),
        click: () => webContents.goBack()
      }
    case 'forward':
      return {
        label: 'Forward',
        enabled: webContents.canGoForward(),
        click: () => webContents.goForward()
      }
    case 'reload':
      return {
        label: 'Reload',
        click: () => webContents.reload()
      }
    case 'split-pane-vert':
      return {
        label: 'Split Pane Vertically',
        click () {
          var pane = tab && tab.findPane(webContents);
          if (tab && pane) tab.splitPane(pane, 'vert');
        }
      }
    case 'split-pane-horz':
      return {
        label: 'Split Pane Horizontally',
        click () {
          var pane = tab && tab.findPane(webContents);
          if (tab && pane) tab.splitPane(pane, 'horz');
        }
      }
    case 'move-pane':
      return {
        type: 'submenu',
        label: 'Move Pane',
        submenu: [{
          label: 'To a New Tab',
          click () {
            var pane = tab && tab.findPane(webContents);
            if (tab && pane) {
              tab.detachPane(pane);
              create$2(tab.browserWindow, null, {setActive: true, initialPanes: [pane]});
            }
          }
        }, {
          type: 'separator'
        }, {
          label: 'Up',
          click () {
            var pane = tab && tab.findPane(webContents);
            if (tab && pane) tab.movePane(pane, 'up');
          }
        }, {
          label: 'Down',
          click () {
            var pane = tab && tab.findPane(webContents);
            if (tab && pane) tab.movePane(pane, 'down');
          }
        }, {
          label: 'Left',
          click () {
            var pane = tab && tab.findPane(webContents);
            if (tab && pane) tab.movePane(pane, 'left');
          }
        }, {
          label: 'Right',
          click () {
            var pane = tab && tab.findPane(webContents);
            if (tab && pane) tab.movePane(pane, 'right');
          }
        }]
      }
    case 'close-pane':
      return {
        label: 'Close Pane',
        click () {
          var pane = tab && tab.findPane(webContents);
          if (tab && pane) tab.removePane(pane);
        }
      }
    case 'inspect-element':
      return {
        label: 'Inspect Element',
        click: item => {
          webContents.inspectElement(x, y);
          if (webContents.isDevToolsOpened()) { webContents.devToolsWebContents.focus(); }
        }
      }
  }
}

const X_POSITION = 0;
const Y_POSITION = 75;

// globals
// =

var tabIdCounter = 1;
var activeTabs = {}; // map of {[win.id]: Array<Tab>}
var backgroundTabs = []; // Array<Tab>
var preloadedNewTabs = {}; // map of {[win.id]: Tab}
var lastSelectedTabIndex = {}; // map of {[win.id]: Number}
var closedItems = {}; // map of {[win.id]: Array<Object>}
var windowEvents = {}; // mapof {[win.id]: EventEmitter}
var defaultUrl = 'wallets://desktop/';

// classes
// =

class Tab extends EventEmitter.EventEmitter {
  constructor (win, opts = {isPinned: false, isHidden: false, initialPanes: undefined, fromSnapshot: undefined}) {
    super();
    this.id = tabIdCounter++;
    this.browserWindow = win;
    this.panes = [];
    this.layout = new PaneLayout();
    this.layout.on('changed', this.resize.bind(this));

    definePrimaryPanePassthroughGetter(this, 'url');
    definePrimaryPanePassthroughGetter(this, 'loadingURL');
    definePrimaryPanePassthroughGetter(this, 'origin');
    definePrimaryPanePassthroughGetter(this, 'title');
    definePrimaryPanePassthroughGetter(this, 'webContents');
    definePrimaryPanePassthroughGetter(this, 'browserView');
    definePrimaryPanePassthroughFn(this, 'loadURL');
    definePrimaryPanePassthroughFn(this, 'reload');
    definePrimaryPanePassthroughFn(this, 'captureScreenshot');
    definePrimaryPanePassthroughFn(this, 'showInpageFind');
    definePrimaryPanePassthroughFn(this, 'hideInpageFind');
    definePrimaryPanePassthroughFn(this, 'setInpageFindString');
    definePrimaryPanePassthroughFn(this, 'moveInpageFind');
    definePrimaryPanePassthroughFn(this, 'toggleLiveReloading');
    definePrimaryPanePassthroughFn(this, 'stopLiveReloading');

    // browser state
    this.isHidden = opts.isHidden; // is this tab hidden from the user? used for the preloaded tab and background tabs
    this.isActive = false; // is this the active tab in the window?
    this.isPinned = Boolean(opts.isPinned); // is this tab pinned?
    
    // helper state
    this.lastActivePane = undefined;
    this.activePaneResize = undefined; // used to track pane resizing

    if (opts.fromSnapshot) {
      this.loadSnapshot(opts.fromSnapshot);
    } else if (opts.initialPanes) {
      for (let pane of opts.initialPanes) {
        this.attachPane(pane);
      }
    }
    if (this.panes.length === 0) {
      // always have one pane
      this.createPane();
    }
  }

  get state () {
    var state = this.primaryPane?.state || {};
    return Object.assign(state, {
      isActive: this.isActive,
      isPinned: this.isPinned,
      paneLayout: this.layout.state
    })
  }

  getSessionSnapshot () {
    return {
      isPinned: this.isPinned,
      stacks: this.layout.stacks.map(stack => ({
        layoutWidth: stack.layoutWidth,
        panes: stack.panes.map(pane => ({
          url: pane.url || pane.loadingURL,
          layoutHeight: pane.layoutHeight
        }))
      }))
    }
  }

  loadSnapshot (snapshot) {
    var stacks = Array.isArray(snapshot.stacks) ? snapshot.stacks : [];
    for (let stackSnapshot of stacks) {
      let panes = Array.isArray(stackSnapshot.panes) ? stackSnapshot.panes : [];
      let stack = undefined;
      for (let paneSnapshot of panes) {
        if (typeof paneSnapshot.url !== 'string') continue

        var pane = new Pane(this);
        this.panes.push(pane);
        pane.setTab(this);

        if (stack) {
          let after = stack.panes[stack.panes.length - 1];
          this.layout.addPaneToStack(stack, pane, {after, layoutHeight: paneSnapshot.layoutHeight, noRebalance: true});
        } else {
          let after = this.layout.stacks[this.layout.stacks.length - 1];
          this.layout.addPane(pane, {after, layoutWidth: stackSnapshot.layoutWidth, layoutHeight: paneSnapshot.layoutHeight, noRebalance: true});
          stack = this.layout.stacks[this.layout.stacks.length - 1];
        }

        pane.loadURL(paneSnapshot.url);
      }
    }
    if (this.panes[0]) this.setActivePane(this.panes[0]);
    this.layout.rebalanceAll();
  }

  get activePane () {
    return this.panes.find(p => p.isActive)
  }

  get primaryPane () {
    var pane = this.activePane;
    while (pane?.attachedPane) pane = pane.attachedPane;
    return pane
  }

  get tabBounds () {
    var addedWindowSettings = getAddedWindowSettings(this.browserWindow);
    var x = X_POSITION;
    var y = Y_POSITION;
    var {width, height} = this.browserWindow.getContentBounds();
    if (addedWindowSettings.isShellInterfaceHidden) {
      x = 0;
      y = 0;
    } else if (addedWindowSettings.isSidebarHidden) {
      x = 0;
    }
    return {x, y: y, width: width - x, height: height - y}
  }

  getIPCSenderInfo (event) {
    for (let pane of this.panes) {
      let info = pane.getIPCSenderInfo(event);
      if (info) return info
    }
    return {url: '', isMainFrame: false}
  }

  // management
  // =

  focus () {
    if (this.activePane) {
      this.activePane.focus();
    } else if (this.panes.length) {
      this.panes[0].focus();
    }
  }

  resize () {
    if (this.isHidden || !this.isActive) return
    this.layout.computePanesBounds(this.tabBounds);
    for (let pane of this.panes) {
      pane.setBounds(this.layout.getBoundsForPane(pane));
    }
    emitUpdatePanesState(this);
  }

  activate () {
    if (this.isHidden) return
    this.isActive = true;

    for (let pane of this.panes) {
      pane.show({noFocus: true});
    }
    this.activePane.focus();

    show$4(this);
    show$1(this);
    show$7(this);

    this.resize();
    this.emit('activated');
  }

  deactivate () {
    if (this.isHidden) return
    if (!this.browserWindow) return

    for (let pane of this.panes) {
      pane.hide();
    }

    if (this.isActive) {
      hide$2(this.browserWindow); // this will close the location menu if it's open
    }

    hide$4(this);
    hide$1(this);
    hide$7(this);
    hide(this.browserWindow);
    if (this.browserWindow) hide$5(this.browserWindow);

    var wasActive = this.isActive;
    this.isActive = false;
    if (wasActive) {
      this.emit('deactivated');
    }
  }

  destroy () {
    this.deactivate();
    for (let pane of this.panes) {
      pane.destroy();
    }
    close(this);
    close$2(this);
    this.emit('destroyed');
  }

  awaitActive () {
    return Promise.all(this.panes.map(p => p.awaitActive()))
  }

  transferWindow (targetWindow) {
    this.deactivate();
    close$1(this);
    close(this);
    close$2(this);
    this.browserWindow = targetWindow;
  }

  toggleMuted () {
    this.activePane.toggleMuted();
    this.emitTabUpdateState(this.activePane);
  }

  // panes
  // =

  setActivePane (pane) {
    if (this.activePane === pane) return
    if (this.activePane) {
      this.lastActivePane = this.activePane;
      this.activePane.isActive = false;
    }
    pane.isActive = true;
    if (this.isActive) {
      onSetCurrentLocation(this.browserWindow);
    }
    emitUpdateState(this);
  }

  createPane ({url, setActive, after, splitDir} = {url: undefined, setActive: false, after: undefined, splitDir: 'vert'}) {
    var pane = new Pane(this);
    this.attachPane(pane, {after, splitDir});
    if (url) pane.loadURL(url);
    if (setActive) {
      this.setActivePane(pane);
      pane.focus();
    }
    return pane
  }

  createOrFocusPaneByOrigin ({url}) {
    var origin = toOrigin$1(url);
    var existingPane = this.panes.find(p => p.origin === origin);
    if (existingPane) {
      setActive(existingPane);
      existingPane.focus();
    } else {
      return this.createPane({url, setActive: true})
    }
  }

  togglePaneByOrigin ({url}) {
    var origin = toOrigin$1(url);
    var existingPane = this.panes.find(p => p.origin === origin);
    if (existingPane && this.panes.length > 1) {
      return this.removePane(existingPane)
    } else {
      return this.createPane({url, setActive: true})
    }
  }

  splitPane (origPane, splitDir = 'vert') {
    var pane = this.createPane({after: origPane, splitDir});
    pane.loadURL(origPane.url);
  }

  attachPane (pane, {after, splitDir} = {after: undefined, splitDir: 'vert'}) {
    this.panes.push(pane);
    pane.setTab(this);
    if (!this.activePane) this.setActivePane(pane);
    if (this.isActive) pane.show();

    // default to vertical stacking once there are two columns
    if (!after && this.layout.stacks.length > 1) {
      let stack = this.layout.stacks[0];
      after = stack.panes[stack.panes.length - 1];
      splitDir = 'horz';
    }

    if (after) {
      if (splitDir === 'vert') {
        let stack = this.layout.findStack(after);
        this.layout.addPane(pane, {after: stack});
      } else {
        var stack = this.layout.findStack(after);
        this.layout.addPaneToStack(stack, pane, {after: after});
      }
    } else {
      this.layout.addPane(pane);
    }    
  }

  detachPane (pane) {
    if (this.panes.length === 1) {
      // this is going to close the tab
      // save, in case the user wants to restore it
      addTabToClosedItems(this);
    }

    let url = pane.url;
    pane.hide();
    pane.setTab(undefined);

    let i = this.panes.indexOf(pane);
    if (i === -1) {
      console.warn('Tried to remove pane that is not on tab', pane, this);
      return
    }
    this.panes.splice(i, 1);
    this.layout.removePane(pane);
    for (let pane2 of this.panes) {
      if (pane2.attachedPane === pane) {
        pane2.setAttachedPane(undefined);
      }
    }
    if (this.lastActivePane === pane) {
      this.lastActivePane = undefined;
    }

    if (this.panes.length === 0) {
      // always have one pane
      remove$4(this.browserWindow, this);
    } else if (!this.activePane) {
      // choose a new active pane
      addPaneToClosedItems(this, url);
      this.setActivePane(this.panes[0]);
    }
  }

  async removePane (pane) {
    if (!(await runBeforeUnload(pane.webContents))) {
      return
    }

    this.detachPane(pane);
    pane.destroy();
  }

  getPaneById (id) {
    return this.panes.find(p => p.id == id)
  }

  getLastActivePane () {
    return this.lastActivePane
  }

  findPane (webContents) {
    return this.panes.find(p => p.webContents === webContents)
  }

  findPaneByOrigin (url) {
    let origin = toOrigin$1(url);
    return this.panes.find(p => p.origin === origin)
  }

  activateAdjacentPane (dir) {
    var pane = this.layout.getAdjacentPane(this.activePane, dir);
    if (pane) this.setActivePane(pane);
  }

  movePane (pane, dir) {
    this.layout.movePane(pane, dir);
  }

  setPaneResizeModeEnabled (enabled, paneId, edge) {
    // NOTE
    // this works by tracking the mouse move by increments of 1% of the bounds
    // every time the mouse moves by the # of pixels in 1% of the bound,
    // the pane is resized by that %
    // -prf
    if (enabled) {
      if (this.activePaneResize) return
      let pane = this.getPaneById(paneId);
      if (!pane) return

      // always adjust using the bottom or right edge of panes
      if (edge === 'top') pane = this.layout.getAdjacentPane(pane, 'up');
      if (edge === 'left') pane = this.layout.getAdjacentPane(pane, 'left');
      if (!pane) return

      // track if the mouse goes outside the window
      let winBounds = this.browserWindow.getBounds();
      let isOutsideBounds = (pt) => (
        pt.x < winBounds.x
        || pt.y < winBounds.y
        || pt.x > (winBounds.x + winBounds.width)
        || pt.y > (winBounds.y + winBounds.height)
      );

      // track the mouse movement
      let tabBounds = this.tabBounds;
      let pxInPct;
      if (edge === 'top' || edge === 'bottom') {
        pxInPct = Math.round(tabBounds.height / 100);
      } else {
        pxInPct = Math.round(tabBounds.width / 100);
      }
      let startPt = electron.screen.getCursorScreenPoint();
      let lastDiff = 0;

      // hide all panes during drag
      // this is MAINLY so that we can register the mouseup, which
      // the browserviews interrupt our shell-window from receiving
      // but it also improves perf
      for (let pane of this.panes) {
        pane.hide();
      }
      this.browserWindow.webContents.focus();

      // poll the mouse cursor every 15ms
      this.activePaneResize = {
        interval: setInterval(() => {
          var pt = electron.screen.getCursorScreenPoint();
          if (isOutsideBounds(pt)) {
            // mouse went outside window
            return this.setPaneResizeModeEnabled(false)
          }

          if (edge === 'top' || edge === 'bottom') {
            let diff = Math.round((pt.y - startPt.y) / pxInPct);
            if (diff !== lastDiff) {
              this.layout.changePaneHeight(pane, diff - lastDiff);
              lastDiff = diff;
              this.resize();
            }
          } else {
            let diff = Math.round((pt.x - startPt.x) / pxInPct);
            if (diff !== 0) {
              this.layout.changePaneWidth(pane, diff - lastDiff);
              lastDiff = diff;
              this.resize();
            }
          }
        }, 15),
      };
    } else {
      if (!this.activePaneResize) return
      clearInterval(this.activePaneResize.interval);
      this.activePaneResize = undefined;

      // reshow our panes
      for (let pane of this.panes) {
        pane.show({noFocus: true});
        pane.setBounds(this.layout.getBoundsForPane(pane));
      }
      triggerSessionSnapshot(this.browserWindow);
    }
  }

  openPaneMenu (paneId) {
    let pane = this.getPaneById(paneId);
    if (!pane) return
    var webContents = pane.webContents;
    var tab = this;

    var menuItems = [];
    menuItems.push(createMenuItem('split-pane-vert', {webContents, tab}));
    menuItems.push(createMenuItem('split-pane-horz', {webContents, tab}));
    if (shouldShowMenuItem('move-pane', {tab})) {
      menuItems.push(createMenuItem('move-pane', {webContents, tab}));
    }
    menuItems.push({type: 'separator'});
    menuItems.push(createMenuItem('close-pane', {webContents, tab}));
    var menu = electron.Menu.buildFromTemplate(menuItems);
    let bounds = this.layout.getBoundsForPane(pane);
    menu.popup({
      x: bounds.x,
      y: bounds.y + bounds.height - 20
    });
  }

  openAttachMenu (paneId) {
    let pane = this.getPaneById(paneId);
    if (!pane) return

    var menuItems = [];
    if (pane.attachedPane) {
      menuItems.push({
        label: `Detach from ${pane.attachedPane.title}`,
        click: () => {
          pane.setAttachedPane(undefined);
        }
      });
    }
    if (menuItems.length === 0) {
      this.panes.forEach(pane2 => {
        if (pane2 !== pane) {
          menuItems.push({
            label: `Attach to ${pane2.title}`,
            click: () => {
              pane.setAttachedPane(pane2);
            }
          });
        }
      });
    }
    var menu = electron.Menu.buildFromTemplate(menuItems);
    menu.popup();
  }

  // state fetching
  // =

  // helper called by UIs to pull latest state if a change event has occurred
  // eg called by the bookmark systems after the bookmark state has changed
  async refreshState () {
    await Promise.all(this.panes.map(p => p.refreshState()));
  }

  // events
  // =

  emitTabUpdateState (pane) {
    if (this.isHidden || !this.browserWindow) return
    // if (!pane.isActive) return
    emitUpdateState(this);
  }

  emitPaneUpdateState () {
    if (this.isHidden || !this.browserWindow) return
    emitUpdatePanesState(this);
  }

  createTab (url, opts) {
    create$2(this.browserWindow, url, opts);
  }
}

// exported api
// =

async function setup$m () {
  defaultUrl = String(await get$1('new_tab'));
  on('set:new_tab', newValue => {
    defaultUrl = newValue;

    // reset preloaded tabs since they are now on the wrong URL
    for (let k in preloadedNewTabs) {
      preloadedNewTabs[k].destroy();
    }
    preloadedNewTabs = {};
  });

  // listen for webContents messages
  electron.ipcMain.on('WALLETS_SCRIPTCLOSE_SELF', e => {
    var tab = findTab(e.sender);
    if (tab) {
      var pane = tab.findPane(e.sender);
      if (pane) tab.removePane(pane);
    }
    e.returnValue = false;
  });
  electron.ipcMain.on('WALLETS_WC_FOCUSED', e => {
    // when a pane is focused, we want to set it as the
    // active pane of its tab
    for (let winId in activeTabs) {
      for (let tab of activeTabs[winId]) {
        var pane = tab.findPane(e.sender);
        if (pane) {
          if (tab.activePane !== pane) {
            tab.setActivePane(pane);
          }
          return
        }
      }
    }
  });

  // track daemon connectivity
  hyper.daemon.on('daemon-restored', () => emitReplaceStateAllWindows());
  hyper.daemon.on('daemon-stopped', () => emitReplaceStateAllWindows());

  // track peer-counts
  function iterateTabs (cb) {
    for (let winId in activeTabs) {
      for (let tab of activeTabs[winId]) {
        cb(tab);
      }
    }
  }
  hyper.drives.on('updated', ({details}) => {
    iterateTabs(tab => {
      if (tab.driveInfo && tab.driveInfo.url === details.url) {
        tab.refreshState();
      }
    });
  });
}

function getAll$1 (win) {
  win = getTopWindow(win);
  return activeTabs[win.id] || []
}

function getAllAcrossWindows () {
  return activeTabs
}

function getByIndex (win, index) {
  win = getTopWindow(win);
  if (index === 'active') return getActive(win)
  return getAll$1(win)[index]
}

function getIndexOfTab (win, tab) {
  win = getTopWindow(win);
  return getAll$1(win).indexOf(tab)
}

function getActive (win) {
  win = getTopWindow(win);
  return getAll$1(win).find(tab => tab.isActive)
}

function findTab (webContents) {
  for (let winId in activeTabs) {
    for (let tab of activeTabs[winId]) {
      if (tab.findPane(webContents)) {
        return tab
      }
    }
  }
  for (let tab of backgroundTabs) {
    if (tab.findPane(webContents)) {
      return tab
    }
  }
}

function findContainingWindow (webContents) {
  for (let winId in activeTabs) {
    for (let v of activeTabs[winId]) {
      if (v.findPane(webContents)) {
        return v.browserWindow
      }
    }
  }
  for (let winId in preloadedNewTabs) {
    if (preloadedNewTabs[winId].findPane(webContents)) {
      return preloadedNewTabs[winId].browserWindow
    }
  }
}

function create$2 (
    win,
    url,
    opts = {
      setActive: false,
      setActiveBySettings: false,
      isPinned: false,
      focusLocationBar: false,
      adjacentActive: false,
      tabIndex: undefined,
      initialPanes: undefined,
      fromSnapshot: undefined,
      addedPaneUrls: undefined
    }
  ) {
  url = url || defaultUrl;
  if (url.startsWith('devtools://')) {
    return // dont create tabs for this
  }
  win = getTopWindow(win);
  var tabs = activeTabs[win.id] = activeTabs[win.id] || [];

  var tab;
  var preloadedNewTab = preloadedNewTabs[win.id];
  var loadWhenReady = false;
  if (!opts.initialPanes && !opts.fromSnapshot && url === defaultUrl && !opts.isPinned && preloadedNewTab) {
    // use the preloaded tab
    tab = preloadedNewTab;
    tab.isHidden = false; // no longer hidden
    preloadedNewTab = preloadedNewTabs[win.id] = null;
  } else {
    // create a new tab
    tab = new Tab(win, {isPinned: opts.isPinned, initialPanes: opts.initialPanes, fromSnapshot: opts.fromSnapshot});
    loadWhenReady = true;
  }

  // add to active tabs
  if (opts.isPinned) {
    tabs.splice(indexOfLastPinnedTab(win), 0, tab);
  } else {
    let tabIndex = (typeof opts.tabIndex !== 'undefined' && opts.tabIndex !== -1) ? opts.tabIndex : undefined;
    if (opts.adjacentActive) {
      let active = getActive(win);
      let lastPinIndex = indexOfLastPinnedTab(win);
      tabIndex = active ? tabs.indexOf(active) : undefined;
      if (tabIndex === -1) tabIndex = undefined;
      else if (tabIndex < lastPinIndex) tabIndex = lastPinIndex;
      else tabIndex++;
    }
    if (typeof tabIndex !== 'undefined') {
      tabs.splice(tabIndex, 0, tab);
    } else {
      tabs.push(tab);
    }
  }
  if (loadWhenReady && !opts.initialPanes && !opts.fromSnapshot) {
    // NOTE
    // `loadURL()` triggers some events (eg app.on('web-contents-created'))
    // which need to be handled *after* the tab is added to the listing
    // thus this `loadWhenReady` logic
    // -prf
    tab.loadURL(url);
  }

  // make active if requested, or if none others are
  let shouldSetActive = opts.setActive;
  if (opts.setActiveBySettings) {
    shouldSetActive = Boolean(Number(getCached('new_tabs_in_foreground')));
  }
  if (shouldSetActive || !getActive(win)) {
    setActive(win, tab);
  }
  emitReplaceState(win);

  if (opts.focusLocationBar) {
    win.webContents.send('command', 'focus-location');
  }

  if (opts.addedPaneUrls) {
    for (let addedUrl of opts.addedPaneUrls) {
      tab.createPane({url: addedUrl});
    }
  }

  // create a new preloaded tab if needed
  if (!preloadedNewTab) {
    createPreloadedNewTab(win);
  }

  return tab
}

function createBg (url, opts = {fromSnapshot: undefined}) {
  var tab = new Tab(undefined, {isHidden: true, fromSnapshot: opts.fromSnapshot});
  if (url && !opts.fromSnapshot) tab.loadURL(url);
  backgroundTabs.push(tab);
  electron.app.emit('custom-background-tabs-update', backgroundTabs);
  for (let win of electron.BrowserWindow.getAllWindows()) {
    emitReplaceState(win);
  }
}

async function minimizeToBg (win, tab) {
  win = getTopWindow(win);
  var tabs = getAll$1(win);
  var i = tabs.indexOf(tab);
  if (i == -1) {
    return console.warn('tabs/manager minimize() called for missing tab', tab)
  }

  // do minimize animation
  win.webContents.send('command', 'minimize-to-bg-anim');

  // set new active if that was
  if (tab.isActive && tabs.length > 1) {
    setActive(win, tabs[i + 1] || tabs[i - 1]);
  }

  // move to background
  tabs.splice(i, 1);
  tab.deactivate();
  backgroundTabs.push(tab);
  electron.app.emit('custom-background-tabs-update', backgroundTabs);

  tab.isPinned = false;
  tab.isHidden = true;
  tab.browserWindow = undefined;

  // create a new empty tab if that was the last one
  if (tabs.length === 0) return create$2(win, undefined, {setActive: true})
  emitReplaceState(win);
}

async function restoreBgTabByIndex (win, index) {
  win = getTopWindow(win);
  var tabs = getAll$1(win);
  
  var tab = backgroundTabs[index];
  if (!tab) return
  backgroundTabs.splice(index, 1);
  electron.app.emit('custom-background-tabs-update', backgroundTabs);

  if (tab.isPinned) {
    tabs.splice(indexOfLastPinnedTab(win), 0, tab);
  } else {
    tabs.push(tab);
  }
  tab.isHidden = false;
  tab.browserWindow = win;
  setActive(win, tab);
  emitReplaceState(win);
}

async function remove$4 (win, tab) {
  win = getTopWindow(win);
  var wasActive = tab.isActive;

  var tabs = getAll$1(win);
  var i = tabs.indexOf(tab);
  if (i == -1) {
    return console.warn('tabs/manager remove() called for missing tab', tab)
  }

  for (let pane of tab.panes) {
    if (!(await runBeforeUnload(pane.webContents))) {
      return
    }
  }

  // save, in case the user wants to restore it
  if (tab.panes.length) {
    addTabToClosedItems(tab);
  }

  tabs.splice(i, 1);
  tab.destroy();

  // set new active if that was
  if (tabs.length >= 1 && wasActive) {
    setActive(win, tabs[i] || tabs[i - 1]);
  }

  // close the window if that was the last tab
  if (tabs.length === 0) return win.close()
  emitReplaceState(win);
}

async function destroyAll (win) {
  for (let t of (activeTabs[win.id] || [])) {
    t.destroy();
  }
  delete activeTabs[win.id];
}

async function removeAllExcept (win, tab) {
  win = getTopWindow(win);
  var tabs = getAll$1(win).slice(); // .slice() to duplicate the list
  for (let t of tabs) {
    if (t !== tab) {
      await remove$4(win, t);
    }
  }
}

async function removeAllToRightOf (win, tab) {
  win = getTopWindow(win);
  var toRemove = [];
  var tabs = getAll$1(win);
  let index = tabs.indexOf(tab);
  for (let i = 0; i < tabs.length; i++) {
    if (i > index) toRemove.push(tabs[i]);
  }
  for (let t of toRemove) {
    await remove$4(win, t);
  }
}

function setActive (win, tab) {
  win = getTopWindow(win);
  if (typeof tab === 'number') {
    tab = getByIndex(win, tab);
  }
  if (!tab) return

  // deactivate the old tab
  var active = getActive(win);
  if (active && active === tab) {
    return
  }

  tab.activate();
  if (active) {
    active.deactivate();
  }
  lastSelectedTabIndex[win.id] = getAll$1(win).indexOf(active);

  onSetCurrentLocation(win);
  emitReplaceState(win);
}

function resize$1 (win) {
  var active = getActive(win);
  if (active) active.resize();
}

function initializeWindowFromSnapshot (win, snapshot) {
  win = getTopWindow(win);
  for (let page of snapshot) {
    if (typeof page === 'string') {
      // legacy compat- pages were previously just url strings
      create$2(win, page);
    } else {
      create$2(win, null, {
        isPinned: page.isPinned,
        fromSnapshot: page
      });
    }
  }
}

function initializeBackgroundFromSnapshot (snapshot) {
  for (let tab of snapshot.backgroundTabs) {
    if (typeof tab === 'string') {
      // legacy compat- pages were previously just url strings
      createBg(tab);
    } else {
      createBg(null, {
        fromSnapshot: tab
      });
    }
  }
}

function takeSnapshot (win) {
  win = getTopWindow(win);
  return getAll$1(win).map(tab => tab.getSessionSnapshot())
}

function triggerSessionSnapshot (win) {
  win.emit('custom-pages-updated', takeSnapshot(win));
}

async function popOutTab (tab) {
  var newWin = createShellWindow();
  await new Promise(r => newWin.once('custom-pages-ready', r));
  transferTabToWindow(tab, newWin);
  removeAllExcept(newWin, tab);
}

function transferTabToWindow (tab, targetWindow) {
  var sourceWindow = tab.browserWindow;

  // find
  var sourceTabs = getAll$1(sourceWindow);
  var i = sourceTabs.indexOf(tab);
  if (i == -1) {
    return console.warn('tabs/manager transferTabToWindow() called for missing tab', tab)
  }

  // remove
  var shouldCloseSource = false;
  sourceTabs.splice(i, 1);
  if (sourceTabs.length === 0) {
    shouldCloseSource = true;
  } else {
    if (tab.isActive) {
      // setActive(sourceWindow, sourceTabs[i + 1] || sourceTabs[i - 1])
      changeActiveToLast(sourceWindow);
    }
    emitReplaceState(sourceWindow);
  }

  // transfer to the new window
  tab.transferWindow(targetWindow);
  var targetTabs = getAll$1(targetWindow);
  if (tab.isPinned) {
    targetTabs.splice(indexOfLastPinnedTab(targetWindow), 0, tab);
  } else {
    targetTabs.push(tab);
  }
  emitReplaceState(targetWindow);

  if (shouldCloseSource) {
    sourceWindow.close();
  }
}

function togglePinned (win, tab) {
  win = getTopWindow(win);
  // move tab to the "end" of the pinned tabs
  var tabs = getAll$1(win);
  var oldIndex = tabs.indexOf(tab);
  var newIndex = indexOfLastPinnedTab(win);
  if (oldIndex < newIndex) newIndex--;
  tabs.splice(oldIndex, 1);
  tabs.splice(newIndex, 0, tab);

  // update tab state
  tab.isPinned = !tab.isPinned;
  emitReplaceState(win);
}

async function loadPins (win) {
  // NOTE
  // this is the legacy code
  // it's here to load the old pins then remove the entry
  // pins are now stored in session state
  win = getTopWindow(win);
  var json = await get$1('pinned_tabs');
  try { JSON.parse(json).forEach(url => create$2(win, url, {isPinned: true})); }
  catch (e) {}
  await set('pinned_tabs', undefined);
}

function reopenLastRemoved (win) {
  win = getTopWindow(win);
  var snap = (closedItems[win.id] || []).pop();
  if (snap) {
    if (snap.isTab) {
      setActive(win, create$2(win, null, {fromSnapshot: snap}));
    } else if (snap.isPane) {
      snap.tab.createPane({url: snap.url});
      setActive(snap.tab.browserWindow, snap.tab);
    }
  }
}

function reorder (win, oldIndex, newIndex) {
  win = getTopWindow(win);
  if (oldIndex === newIndex) {
    return
  }
  var tabs = getAll$1(win);
  var tab = getByIndex(win, oldIndex);
  tabs.splice(oldIndex, 1);
  tabs.splice(newIndex, 0, tab);
  emitReplaceState(win);
}

function changeActiveBy (win, offset) {
  win = getTopWindow(win);
  var tabs = getAll$1(win);
  var active = getActive(win);
  if (tabs.length > 1) {
    var i = tabs.indexOf(active);
    if (i === -1) { return console.warn('Active page is not in the pages list! THIS SHOULD NOT HAPPEN!') }

    i += offset;
    if (i < 0) i = tabs.length - 1;
    if (i >= tabs.length) i = 0;

    setActive(win, tabs[i]);
  }
}

function changeActiveToLast (win) {
  win = getTopWindow(win);
  var tabs = getAll$1(win);
  setActive(win, tabs[tabs.length - 1]);
}

function getPreviousTabIndex (win) {
  var index = lastSelectedTabIndex[win.id];
  if (typeof index !== 'number') return 0
  if (index < 0 || index >= getAll$1(win).length) return 0
  return index
}

function openOrFocusDownloadsPage (win) {
  win = getTopWindow(win);
  var tabs = getAll$1(win);
  var downloadsTab = tabs.find(v => v.url.startsWith('wallets://library/downloads'));
  if (!downloadsTab) {
    downloadsTab = create$2(win, 'wallets://library/downloads');
  }
  setActive(win, downloadsTab);
}

function emitReplaceStateAllWindows () {
  for (let win of electron.BrowserWindow.getAllWindows()) {
    emitReplaceState(win);
  }
}

function emitReplaceState (win) {
  win = getTopWindow(win);
  var state = {
    tabs: getWindowTabState(win),
    isFullscreen: win.isFullScreen(),
    isShellInterfaceHidden: getAddedWindowSettings(win).isShellInterfaceHidden,
    isSidebarHidden: getAddedWindowSettings(win).isSidebarHidden,
    isDaemonActive: hyper.daemon.isActive(),
    hasBgTabs: backgroundTabs.length > 0
  };
  emit(win, 'replace-state', state);
  triggerSessionSnapshot(win);
}

// rpc api
// =

rpc.exportAPI('background-process-views', viewsRPCManifest, {
  createEventStream () {
    return emitStream(getEvents(getWindow(this.sender)))
  },

  async refreshState (tab) {
    var win = getWindow(this.sender);
    tab = getByIndex(win, tab);
    if (tab) {
      tab.refreshState();
    }
  },

  async getState () {
    var win = getWindow(this.sender);
    return getWindowTabState(win)
  },

  async getTabState (tab, opts) {
    var win = getWindow(this.sender);
    tab = getByIndex(win, tab);
    if (tab) {
      var state = Object.assign({}, tab.state);
      if (opts) {
        if (opts.driveInfo) state.driveInfo = tab.primaryPane.driveInfo;
        if (opts.sitePerms) state.sitePerms = await getPermissions(tab.url);
      }
      return state
    }
  },

  async getNetworkState (tab, opts) {
    var win = getWindow(this.sender);
    tab = getByIndex(win, tab);
    if (tab && tab.primaryPane && tab.primaryPane.driveInfo) {
      let drive = hyper.drives.getDrive(tab.primaryPane.driveInfo.key);
      if (drive) {
        return {
          peers: drive.session.drive.metadata.peers.map(p => ({type: p.type, remoteAddress: p.remoteAddress}))
        }
      }
    }
  },

  async getBackgroundTabs () {
    return backgroundTabs.map(tab => ({
      url: tab.url,
      title: tab.title
    }))
  },

  async createTab (url, opts = {focusLocationBar: false, setActive: false}) {
    var win = getWindow(this.sender);
    var tab = create$2(win, url, opts);
    return getAll$1(win).indexOf(tab)
  },

  async createPane (index, url) {
    var tab = getByIndex(getWindow(this.sender), index);
    return tab.createPane({url, setActive: true})
  },

  async togglePaneByOrigin (index, url) {
    var tab = getByIndex(getWindow(this.sender), index);
    return tab.togglePaneByOrigin({url})
  },

  async loadURL (index, url) {
    if (url === '$new_tab') {
      url = defaultUrl;
    }
    getByIndex(getWindow(this.sender), index)?.primaryPane?.loadURL(url);
  },

  async minimizeTab (index) {
    var win = getWindow(this.sender);
    minimizeToBg(win, getByIndex(win, index));
  },

  async closeTab (index) {
    var win = getWindow(this.sender);
    remove$4(win, getByIndex(win, index));
  },

  async setActiveTab (index) {
    var win = getWindow(this.sender);
    setActive(win, getByIndex(win, index));
  },

  async reorderTab (oldIndex, newIndex) {
    var win = getWindow(this.sender);
    reorder(win, oldIndex, newIndex);
  },

  restoreBgTab (index) {
    if (!backgroundTabs[index]) return
    var win = getWindow(this.sender);
    restoreBgTabByIndex(win, index);
  },

  closeBgTab (index) {
    if (!backgroundTabs[index]) return
    backgroundTabs[index].destroy();
    backgroundTabs.splice(index, 1);
  },

  async showTabContextMenu (index) {
    var win = getWindow(this.sender);
    var tab = getByIndex(win, index);
    var menu = electron.Menu.buildFromTemplate([
      { label: (tab.isPinned) ? 'Unpin Tab' : 'Pin Tab', click: () => togglePinned(win, tab) },
      { label: 'Pop Out Tab', click: () => popOutTab(tab) },
      { label: 'Duplicate Tab', click: () => create$2(win, tab.url, {adjacentActive: true}) },
      { label: (tab.isAudioMuted) ? 'Unmute Tab' : 'Mute Tab', click: () => tab.toggleMuted() },
      { label: 'Minimize to Background', click: () => minimizeToBg(win, tab) },
      { type: 'separator' },
      { label: 'Close Tab', click: () => remove$4(win, tab) },
      { label: 'Close Other Tabs', click: () => removeAllExcept(win, tab) },
      { label: 'Close Tabs to the Right', click: () => removeAllToRightOf(win, tab) },
      { type: 'separator' },
      { label: 'New Tab', click: () => create$2(win, null, {setActive: true}) },
      { label: 'Reopen Closed Tab', click: () => reopenLastRemoved(win) }
    ]);
    menu.popup();
  },

  async showLocationBarContextMenu (index) {
    var win = getWindow(this.sender);
    var tab = getByIndex(win, index);
    var clipboardContent = electron.clipboard.readText();
    var clipInfo = examineLocationInput(clipboardContent);
    var menu = electron.Menu.buildFromTemplate([
      { label: 'Cut', role: 'cut' },
      { label: 'Copy', role: 'copy' },
      { label: 'Paste', role: 'paste' },
      { label: `Paste and ${clipInfo.isProbablyUrl ? 'Go' : 'Search'}`, click: onPasteAndGo }
    ]);
    menu.popup({window: win});

    function onPasteAndGo () {
      // close the menu
      hide$2(win);
      win.webContents.send('command', 'unfocus-location');

      // load the URL
      var url = clipInfo.isProbablyUrl ? clipInfo.vWithProtocol : clipInfo.vSearch;
      tab.loadURL(url);
    }
  },

  async goBack (index) {
    getByIndex(getWindow(this.sender), index)?.primaryPane?.webContents.goBack();
  },

  async goForward (index) {
    getByIndex(getWindow(this.sender), index)?.primaryPane?.webContents.goForward();
  },

  async stop (index) {
    getByIndex(getWindow(this.sender), index)?.primaryPane?.webContents.stop();
  },

  async reload (index) {
    getByIndex(getWindow(this.sender), index)?.primaryPane?.webContents.reload();
  },

  async resetZoom (index) {
    zoomReset(getByIndex(getWindow(this.sender), index));
  },

  async toggleLiveReloading (index, enabled) {
    getByIndex(getWindow(this.sender), index).toggleLiveReloading(enabled);
  },

  async toggleDevTools (index) {
    getByIndex(getWindow(this.sender), index).webContents.toggleDevTools();
  },

  async print (index) {
    getByIndex(getWindow(this.sender), index).webContents.print();
  },

  async showInpageFind (index) {
    getByIndex(getWindow(this.sender), index).showInpageFind();
  },

  async hideInpageFind (index) {
    getByIndex(getWindow(this.sender), index).hideInpageFind();
  },

  async setInpageFindString (index, str, dir) {
    getByIndex(getWindow(this.sender), index).setInpageFindString(str, dir);
  },

  async moveInpageFind (index, dir) {
    getByIndex(getWindow(this.sender), index).moveInpageFind(dir);
  },

  async showLocationBar (opts) {
    await show$3(getWindow(this.sender), opts);
  },

  async hideLocationBar () {
    await hide$3(getWindow(this.sender));
  },

  async runLocationBarCmd (cmd, opts) {
    return runCmd(getWindow(this.sender), cmd, opts)
  },

  async toggleSidebarHidden () {
    toggleSidebarHidden(getWindow(this.sender));
  },

  async showMenu (id, opts) {
    await show$2(getWindow(this.sender), id, opts);
  },

  async toggleMenu (id, opts) {
    await toggle(getWindow(this.sender), id, opts);
  },

  async updateMenu (opts) {
    await update$1(getWindow(this.sender), opts);
  },

  async toggleSiteInfo (opts) {
    await toggle$1(getWindow(this.sender), opts);
  },

  async focusShellWindow () {
    getWindow(this.sender).webContents.focus();
  },

  async focusPage () {
    getActive(this.sender).focus();
  },
  
  async setPaneResizeModeEnabled (enabled, paneId, edge) {
    getActive(getWindow(this.sender)).setPaneResizeModeEnabled(enabled, paneId, edge);
  },

  async openPaneMenu (paneId) {
    getActive(getWindow(this.sender)).openPaneMenu(paneId);
  },

  async openAttachMenu (paneId) {
    getActive(getWindow(this.sender)).openAttachMenu(paneId);
  }
});

// internal methods
// =

function emitUpdateState (tab) {
  if (!tab.browserWindow) return
  var win = getTopWindow(tab.browserWindow);
  var index = typeof tab === 'number' ? tab : getAll$1(win).indexOf(tab);
  if (index === -1) {
    console.warn('WARNING: attempted to update state of a tab not on the window');
    return
  }
  emit(win, 'update-state', {index, state: tab.state});
  win.emit('custom-pages-updated', takeSnapshot(win));
}

function emitUpdatePanesState (tab) {
  var win = getTopWindow(tab.browserWindow);
  var index = typeof tab === 'number' ? tab : getAll$1(win).indexOf(tab);
  if (index === -1) return
  emit(win, 'update-panes-state', {index, paneLayout: tab.layout.state});
}

function getWindow (sender) {
  return findWebContentsParentWindow(sender)
}

// helper ensures that if a subwindow is called, we use the parent
function getTopWindow (win) {
  if (!(win instanceof electron.BrowserWindow)) {
    return findWebContentsParentWindow(win)
  }
  while (win.getParentWindow()) {
    win = win.getParentWindow();
  }
  return win
}

function getEvents (win) {
  if (!(win.id in windowEvents)) {
    windowEvents[win.id] = new EventEmitter.EventEmitter();
  }
  return windowEvents[win.id]
}

function emit (win, ...args) {
  getEvents(win).emit(...args);
}

function getWindowTabState (win) {
  return getAll$1(win).map(tab => tab.state)
}

function addTabToClosedItems (tab) {
  closedItems[tab.browserWindow.id] = closedItems[tab.browserWindow.id] || [];
  closedItems[tab.browserWindow.id].push(Object.assign({isTab: true}, tab.getSessionSnapshot()));
}

function addPaneToClosedItems (tab, url) {
  closedItems[tab.browserWindow.id] = closedItems[tab.browserWindow.id] || [];
  closedItems[tab.browserWindow.id].push({isPane: true, tab, url});
}

function indexOfLastPinnedTab (win) {
  var tabs = getAll$1(win);
  var index = 0;
  for (index; index < tabs.length; index++) {
    if (!tabs[index].isPinned) break
  }
  return index
}

function definePrimaryPanePassthroughGetter (obj, name) {
  Object.defineProperty(obj, name, {
    enumerable: true,
    get () {
      var pane = obj.primaryPane;
      return pane ? pane[name] : undefined
    }
  });
}

function definePrimaryPanePassthroughFn (obj, name) {
  obj[name] = (function (...args) {
    if (!this.primaryPane) {
      throw new Error('No active pane')
    }
    return this.primaryPane[name](...args)
  }).bind(obj);
}

async function fireBeforeUnloadEvent (wc) {
  try {
    if (wc.isLoading() || wc.isWaitingForResponse()) {
      return // dont bother
    }
    return await Promise.race([
      wc.executeJavaScript(`
        (function () {
          let unloadEvent = new Event('beforeunload', {bubbles: false, cancelable: true})
          window.dispatchEvent(unloadEvent)
          return unloadEvent.defaultPrevented
        })()
      `),
      new Promise(r => {
        setTimeout(r, 500); // thread may be locked, so abort after 500ms
      })
    ])
  } catch (e) {
    // ignore
  }
}

async function runBeforeUnload (wc) {
  var onBeforeUnloadReturnValue = await fireBeforeUnloadEvent(wc);
  if (onBeforeUnloadReturnValue) {
    var choice = electron.dialog.showMessageBoxSync({
      type: 'question',
      buttons: ['Leave', 'Stay'],
      title: 'Do you want to leave this site?',
      message: 'Changes you made may not be saved.',
      defaultId: 0,
      cancelId: 1
    });
    var leave = (choice === 0);
    if (!leave) return false
  }
  return true
}

/**
 * NOTE
 * preloading a tab generates a slight performance cost which was interrupting the UI
 * (it manifested as a noticeable delay in the location bar)
 * by delaying before creating the preloaded tab, we avoid overloading any threads
 * and disguise the performance overhead
 * -prf
 */
var _createPreloadedNewTabTOs = {}; // map of {[win.id] => timeout}
function createPreloadedNewTab (win) {
  var id = win.id;
  if (_createPreloadedNewTabTOs[id]) {
    clearTimeout(_createPreloadedNewTabTOs[id]);
  }
  _createPreloadedNewTabTOs[id] = setTimeout(() => {
    _createPreloadedNewTabTOs[id] = null;
    preloadedNewTabs[id] = new Tab(win, {isHidden: true});
    preloadedNewTabs[id].loadURL(defaultUrl);
  }, 1e3);
}

function toOrigin$1 (str) {
  try {
    var u = new URL(str);
    return u.protocol + '//' + u.hostname + (u.port ? `:${u.port}` : '') + '/'
  } catch (e) { return '' }
}

var modalsRPCManifest = {
  createTab: 'promise',
  resizeSelf: 'promise'
};

/**
 * Modal
 *
 * NOTES
 * - Modal views are created as-needed, and desroyed when not in use
 * - Modal views are attached to individual BrowserView instances
 * - Modal views are shown and hidden based on whether its owning BrowserView is visible
 */

// globals
// =

const MARGIN_SIZE$5 = 10;
var views$7 = {}; // map of {[tab.id] => BrowserView}

// exported api
// =

function setup$n (parentWindow) {
  // listen for the basic auth login event
  electron.app.on('login', async function (e, webContents, request, authInfo, cb) {
    e.preventDefault(); // default is to cancel the auth; prevent that
    var res = await create$3(webContents, 'basic-auth', authInfo);
    cb(res.username, res.password);
  });
}

function destroy$7 (parentWindow) {
  // destroy all under this window
  for (let tab of getAll$1(parentWindow)) {
    if (tab.id in views$7) {
      views$7[tab.id].webContents.destroy();
      delete views$7[tab.id];
    }
  }
}

function reposition$7 (parentWindow) {
  // reposition all under this window
  for (let tab of getAll$1(parentWindow)) {
    if (tab.id in views$7) {
      setBounds$2(views$7[tab.id], parentWindow);
    }
  }
}

async function create$3 (webContents, modalName, params = {}) {
  // find parent window
  var parentWindow = electron.BrowserWindow.fromWebContents(webContents);
  var tab;
  if (!parentWindow) {
    // if there's no window, then a web page or "sub-window" created the prompt
    // use its containing window
    tab = findTab(webContents);
    parentWindow = findWebContentsParentWindow(webContents);
    if (!tab) {
      // this can happen when the passed `webContents` is a shell-menu or similar sub-window
      tab = getActive(parentWindow);
    }
  } else {
    // shell window created the prompt
    tab = getActive(parentWindow);
    parentWindow = tab.browserWindow;
  }

  // make sure a prompt window doesnt already exist
  if (tab.id in views$7) {
    throw new beakerErrorConstants.ModalActiveError()
  }

  // wait for tab to be actives
  if (!tab.isActive) {
    await tab.awaitActive();
  }

  // create the view
  var view = views$7[tab.id] = new electron.BrowserView({
    webPreferences: {
      defaultEncoding: 'utf-8',
      preload: path__default.join(__dirname, 'fg', 'modals', 'index.build.js')
    }
  });
  view.modalName = modalName;
  parentWindow.addBrowserView(view);
  setBounds$2(view, parentWindow);
  view.webContents.on('console-message', (e, level, message) => {
    console.log('Modals window says:', message);
  });
  view.webContents.loadURL('wallets://modals/');
  view.webContents.focus();

  // run the modal flow
  var result;
  var err;
  try {
    result = await view.webContents.executeJavaScript(`runModal("${modalName}", ${JSON.stringify(params)})`);
  } catch (e) {
    err = e;
  }

  // destroy the window
  parentWindow.removeBrowserView(view);
  view.webContents.destroy();
  delete views$7[tab.id];

  // return/throw
  if (err) throw err
  return result
}

function get$d (tab) {
  return views$7[tab.id]
}

function show$7 (tab) {
  if (tab.id in views$7) {
    if (tab.browserWindow) {
      tab.browserWindow.addBrowserView(views$7[tab.id]);
    }
  }
}

function hide$7 (tab) {
  if (tab.id in views$7) {
    if (tab.browserWindow) {
      tab.browserWindow.removeBrowserView(views$7[tab.id]);
    }
  }
}

function close$2 (tab) {
  if (tab.id in views$7) {
    var view = views$7[tab.id];
    if (tab.browserWindow) tab.browserWindow.removeBrowserView(view);
    view.webContents.destroy();
    delete views$7[tab.id];
  }
}

function handleContextMenu (webContents, targetWindow, can, props) {
  var menuItems = [];
  if (props.linkURL) {
    menuItems.push({ label: 'Open Link in New Tab', click: (item, win) => create$2(win, props.linkURL, {setActive: true, adjacentActive: true}) });
    menuItems.push({ label: 'Copy Link Address', click: () => electron.clipboard.writeText(props.linkURL) });
  }
  if (props.mediaType == 'image') {
    menuItems.push({ label: 'Copy Image', click: () => webContents.copyImageAt(props.x, props.y) });
    menuItems.push({ label: 'Copy Image URL', click: () => electron.clipboard.writeText(props.srcURL) });
    menuItems.push({ label: 'Open Image in New Tab', click: (item, win) => create$2(win, props.srcURL, {adjacentActive: true}) });
  }
  if (props.isEditable) {
    menuItems.push({ label: 'Cut', role: 'cut', enabled: can('Cut') });
    menuItems.push({ label: 'Copy', role: 'copy', enabled: can('Copy') });
    menuItems.push({ label: 'Paste', role: 'paste', enabled: props.editFlags.canPaste });
  } else if (props.selectionText.trim().length > 0) {
    menuItems.push({ label: 'Copy', role: 'copy', enabled: can('Copy') });
  }
  if (menuItems.length === 0) return

  var menuInstance = electron.Menu.buildFromTemplate(menuItems);
  menuInstance.popup({ window: targetWindow });
}

// rpc api
// =

rpc.exportAPI('background-process-modals', modalsRPCManifest, {
  async createTab (url) {
    var win = findWebContentsParentWindow(this.sender);
    create$2(win, url, {setActive: true, adjacentActive: true});
  },

  async resizeSelf (dimensions) {
    var view = Object.values(views$7).find(view => view.webContents === this.sender);
    if (!view) return
    var parentWindow = findWebContentsParentWindow(this.sender);
    setBounds$2(view, parentWindow, dimensions);
  }
});

// internal methods
// =

function getDefaultWidth$1 (view) {
  if (view.modalName === 'select-drive') return 600
  if (view.modalName === 'select-file') return 800
  if (view.modalName === 'select-contact') return 700
  if (view.modalName === 'folder-sync') return 700
  return 500
}

function getDefaultHeight$1 (view) {
  if (view.modalName === 'select-file') return 460
  if (view.modalName === 'select-contact') return 460
  return 300
}

function setBounds$2 (view, parentWindow, {width, height} = {}) {
  var parentBounds = parentWindow.getContentBounds();
  // HACK workaround the lack of view.getBounds() -prf
  view.currentBounds = view.currentBounds || {width: undefined, height: undefined};
  view.currentBounds.width = Math.min(width || view.currentBounds.width || getDefaultWidth$1(view), parentBounds.width - 20);
  view.currentBounds.height = Math.min(height || view.currentBounds.height || getDefaultHeight$1(view), parentBounds.height - 20);
  view.setBounds({
    x: Math.round(parentBounds.width / 2) - Math.round(view.currentBounds.width / 2) - MARGIN_SIZE$5, // centered
    y: 70,
    width: view.currentBounds.width + (MARGIN_SIZE$5 * 2),
    height: view.currentBounds.height + MARGIN_SIZE$5
  });
}

const logger$6 = get().child({category: 'hyper', subcategory: 'filesystem'});

// typedefs
// =

/**
 * @typedef {import('../hyper/daemon').DaemonHyperdrive} DaemonHyperdrive
 * @typedef {import('../dbs/archives').LibraryArchiveMeta} LibraryArchiveMeta
 * 
 * @typedef {Object} DriveConfig
 * @property {string} key
 * @property {string[]} tags
 * @property {Object} [forkOf]
 * @property {string} [forkOf.key]
 * @property {string} [forkOf.label]
 * 
 * @typedef {Object} DriveIdent
 * @property {boolean} internal
 * @property {boolean} system
 */

// globals
// =

var browsingProfile;
var rootDrive;
var drives = [];

// exported api
// =

/**
 * @returns {DaemonHyperdrive}
 */
function get$e () {
  return rootDrive
}

/**
 * @param {string} url
 * @returns {boolean}
 */
function isRootUrl (url) {
  return isSameOrigin(url, browsingProfile.url) || isSameOrigin(url, 'hyper://private/')
}

/**
 * @returns {Promise<void>}
 */
async function setup$o () {
  setup$7();

  // create the root drive as needed
  var isInitialCreation = false;
  browsingProfile = await get$2(`SELECT * FROM profiles WHERE id = 0`);
  if (!browsingProfile.url || (typeof browsingProfile.url === 'string' && browsingProfile.url.startsWith('dat:'))) {
    let drive = await hyper.drives.createNewRootDrive();
    logger$6.info('Root drive created', {url: drive.url});
    await run(`UPDATE profiles SET url = ? WHERE id = 0`, [drive.url]);
    browsingProfile.url = drive.url;
    isInitialCreation = true;
  }
  if (!browsingProfile.url.endsWith('/')) browsingProfile.url += '/';

  // load root drive
  logger$6.info('Loading root drive', {url: browsingProfile.url});
  hyper.dns.setLocal('private', browsingProfile.url);
  rootDrive = await hyper.drives.getOrLoadDrive(browsingProfile.url, {persistSession: true});

  // default pinned bookmarks
  if (isInitialCreation) {
    await rootDrive.pda.mkdir('/bookmarks');
    await rootDrive.pda.writeFile(`/bookmarks/patreon-com-paul_maf_and_andrew.goto`, '', {metadata: {href: 'https://patreon.com/paul_maf_and_andrew', title: 'Support Beaker'}});
    await rootDrive.pda.writeFile(`/bookmarks/beaker-dev-docs-templates.goto`, '', {metadata: {href: 'https://beaker.dev/docs/templates/', title: 'Hyperdrive Templates'}});
    await rootDrive.pda.writeFile(`/bookmarks/twitter.goto`, '', {metadata: {href: 'https://twitter.com/', title: 'Twitter'}});
    await rootDrive.pda.writeFile(`/bookmarks/reddit.goto`, '', {metadata: {href: 'https://reddit.com/', title: 'Reddit'}});
    await rootDrive.pda.writeFile(`/bookmarks/youtube.goto`, '', {metadata: {href: 'https://youtube.com/', title: 'YouTube'}});
    await rootDrive.pda.mkdir('/beaker');
    await rootDrive.pda.writeFile(`/beaker/pins.json`, JSON.stringify([
      'https://patreon.com/paul_maf_and_andrew',
      'https://beaker.dev/docs/templates/',
      'https://twitter.com/',
      'https://reddit.com/',
      'https://youtube.com/'
    ], null, 2));
  }
  
  // load drive config
  let hostKeys = [];
  try {
    drives = JSON.parse(await rootDrive.pda.readFile('/drives.json')).drives;
    hostKeys = hostKeys.concat(drives.map(drive => drive.key));
  } catch (e) {
    if (e.name !== 'NotFoundError') {
      logger$6.info('Error while reading the drive configuration at /drives.json', {error: e.toString()});
    }
  }
  hyper.drives.ensureHosting(hostKeys);
  await migrateAddressBook();
}

/**
 * @param {string} url 
 * @returns {DriveIdent | Promise<DriveIdent>}
 */
function getDriveIdent (url) {
  var system = isRootUrl(url);
  return {system, internal: system}
}

/**
 * @param {Object} [opts]
 * @param {boolean} [opts.includeSystem]
 * @returns {Array<DriveConfig>}
 */
function listDrives$1 ({includeSystem} = {includeSystem: false}) {
  var d = drives.slice();
  if (includeSystem) {
    d.unshift({key: 'private'});
  }
  return d
}

/**
 * @param {string} key
 * @returns {DriveConfig}
 */
function getDriveConfig (key) {
  return listDrives$1().find(d => d.key === key)
}

/**
 * @param {string} url
 * @param {Object} [opts]
 * @param {Object} [opts.forkOf]
 * @param {string[]} [opts.tags]
 * @returns {Promise<void>}
 */
async function configDrive (url, {forkOf, tags} = {forkOf: undefined, tags: undefined}) {
  var release = await lock('filesystem:drives');
  try {
    var key = await hyper.drives.fromURLToKey(url, true);
    var driveCfg = drives.find(d => d.key === key);
    if (!driveCfg) {
      let drive = await hyper.drives.getOrLoadDrive(url);
      let manifest = await drive.pda.readManifest().catch(_ => ({}));

      driveCfg = /** @type DriveConfig */({key});
      if (tags && Array.isArray(tags) && tags.every(t => typeof t === 'string')) {
        driveCfg.tags = tags.filter(Boolean);
      }
      if (forkOf && typeof forkOf === 'object') {
        driveCfg.forkOf = forkOf;
      }

      if (!drive.writable) {
        // announce the drive
        drive.session.drive.configureNetwork({
          announce: true,
          lookup: true
        });
      }

      // for forks, we need to ensure:
      // 1. the drives.json forkOf.key is the same as index.json forkOf value
      // 2. there's a local forkOf.label
      // 3. the parent is saved
      if (manifest.forkOf && typeof manifest.forkOf === 'string') {
        if (!driveCfg.forkOf) driveCfg.forkOf = {key: undefined, label: undefined};
        driveCfg.forkOf.key = await hyper.drives.fromURLToKey(manifest.forkOf, true);
        if (!driveCfg.forkOf.label) {
          let message = 'Choose a label to save this fork under (e.g. "dev" or "bobs-changes")';
          let promptRes = await create$3(electron.BrowserWindow.getFocusedWindow().webContents, 'prompt', {message}).catch(e => false);
          if (!promptRes || !promptRes.value) return
          driveCfg.forkOf.label = promptRes.value;
        }

        let parentDriveCfg = drives.find(d => d.key === driveCfg.forkOf.key);
        if (!parentDriveCfg) {
          drives.push({key: driveCfg.forkOf.key});
        }
      }

      drives.push(driveCfg);
    } else {
      if (typeof tags !== 'undefined') {
        if (tags && Array.isArray(tags) && tags.every(t => typeof t === 'string')) {
          driveCfg.tags = tags.filter(Boolean);
        } else {
          delete driveCfg.tags;
        }
      }
      if (typeof forkOf !== 'undefined') {
        if (forkOf && typeof forkOf === 'object') {
          driveCfg.forkOf = forkOf;
        } else {
          delete driveCfg.forkOf;
        }
      }
    }
    await rootDrive.pda.writeFile('/drives.json', JSON.stringify({drives}, null, 2));
  } finally {
    release();
  }
}

/**
 * @param {string} url
 * @returns {Promise<void>}
 */
async function removeDrive (url) {
  var release = await lock('filesystem:drives');
  try {
    var key = await hyper.drives.fromURLToKey(url, true);
    var driveIndex = drives.findIndex(drive => drive.key === key);
    if (driveIndex === -1) return
    let drive = await hyper.drives.getOrLoadDrive(url);
    if (!drive.writable) {
      // unannounce the drive
      drive.session.drive.configureNetwork({
        announce: false,
        lookup: true
      });
    }
    drives.splice(driveIndex, 1);
    await rootDrive.pda.writeFile('/drives.json', JSON.stringify({drives}, null, 2));
  } finally {
    release();
  }
}

/**
 * @param {string} containingPath
 * @param {string} basename
 * @param {string} [ext]
 * @param {string} [joiningChar]
 * @param {DaemonHyperdrive} [drive]
 * @returns {Promise<string>}
 */
async function getAvailableName (containingPath, basename, ext = undefined, joiningChar = '-', drive = rootDrive) {
  for (let i = 1; i < 1e9; i++) {
    let name = ((i === 1) ? basename : `${basename}${joiningChar}${i}`) + (ext ? `.${ext}` : '');
    let st = await stat(path.join(containingPath, name), drive);
    if (!st) return name
  }
  // yikes if this happens
  throw new Error('Unable to find an available name for ' + basename)
}

async function ensureDir (path, drive = rootDrive) {
  try {
    let st = await stat(path, drive);
    if (!st) {
      logger$6.info(`Creating directory ${path}`);
      await drive.pda.mkdir(path);
    } else if (!st.isDirectory()) {
      logger$6.error('Warning! Filesystem expects a folder but an unexpected file exists at this location.', {path});
    }
  } catch (e) {
    logger$6.error('Filesystem failed to make directory', {path: '' + path, error: e.toString()});
  }
}

async function migrateAddressBook () {
  var addressBook;
  try { addressBook = await rootDrive.pda.readFile('/address-book.json').then(JSON.parse); }
  catch (e) {
    return
  }
  addressBook.profiles = addressBook.profiles && Array.isArray(addressBook.profiles) ? addressBook.profiles : [];
  addressBook.contacts = addressBook.contacts && Array.isArray(addressBook.contacts) ? addressBook.contacts : [];
  var profiles = addressBook.profiles.concat(addressBook.contacts);
  for (let profile of profiles) {
    let existing = drives.find(d => d.key === profile.key);
    if (!existing) {
      drives.push({key: profile.key, tags: ['contact']});
    } else {
      existing.tags = (existing.tags || []).concat(['contact']);
    }
  }
  await rootDrive.pda.writeFile('/drives.json', JSON.stringify({drives}, null, 2));
  await rootDrive.pda.unlink('/address-book.json');
}

// internal methods
// =

async function stat (path, drive = rootDrive) {
  try { return await drive.pda.stat(path) }
  catch (e) { return null }
}

const baseLogger$1 = get();
const logger$7 = baseLogger$1.child({category: 'hyper', subcategory: 'drives'});

// typedefs
// =

/**
 * @typedef {import('./daemon').DaemonHyperdrive} DaemonHyperdrive
 */

// globals
// =

var driveLoadPromises = {}; // key -> promise
var drivesEvents = new EventEmitter__default();

// exported API
// =

const on$5 = drivesEvents.on.bind(drivesEvents);
const addListener$2 = drivesEvents.addListener.bind(drivesEvents);
const removeListener$3 = drivesEvents.removeListener.bind(drivesEvents);

/**
 * @return {Promise<void>}
 */
async function setup$p () {
  // connect to the daemon
  await setup$5();

  // TODO
  // hyperDnsDb.on('updated', ({key, name}) => {
  //   var drive = getDrive(key)
  //   if (drive) {
  //     drive.domain = name
  //   }
  // })

  logger$7.info('Initialized dat daemon');
}

/**
 * @param {String[]} keys 
 * @returns {Promise<void>}
 */
async function ensureHosting (keys) {
  var configs = await getClient().drive.allNetworkConfigurations();
  for (let key of keys) {
    let cfg = configs.get(key);
    if (!cfg || !cfg.announce || !cfg.lookup) {
      try {
        let drive = await getOrLoadDrive(key);
        logger$7.silly(`Reconfiguring network behavior for drive ${key}`);
        await drive.session.drive.configureNetwork({
          announce: true,
          lookup: true
        });
      } catch (e) {
        logger$7.debug(`Failed to configure behavior for drive ${key}`, {error: e});
      }
    }
  }
}

/**
 * @returns {NodeJS.ReadableStream}
 */
function createEventStream () {
  return emitStream.toStream(drivesEvents)
}
/**
 * @param {string} key
 * @returns {Promise<string>}
 */
function getDebugLog (key) {
  return '' // TODO needed? daemon.getDebugLog(key)
}
/**
 * @returns {NodeJS.ReadableStream}
 */
function createDebugStream () {
  // TODO needed?
  // return daemon.createDebugStream()
}
// read metadata for the drive, and store it in the meta db
async function pullLatestDriveMeta (drive, {updateMTime} = {}) {
  try {
    var key = drive.key.toString('hex');

    // trigger DNS update
    // confirmDomain(key) DISABLED

    var version = await drive.session.drive.version();
    if (version === drive.lastMetaPullVersion) {
      return
    }
    var lastMetaPullVersion = drive.lastMetaPullVersion;
    drive.lastMetaPullVersion = version;

    if (lastMetaPullVersion) {
      hasUpdates(drive, lastMetaPullVersion).then(hasAssetUpdates => {
        if (hasAssetUpdates) {
          update(drive);
        }
      });
    } else {
      update(drive);
    }

    // read the drive meta and size on disk
    var [manifest, oldMeta, size] = await Promise.all([
      drive.pda.readManifest().catch(() => {}),
      getMeta(key),
      0//drive.pda.readSize('/')
    ]);
    var {title, description, type, author, forkOf} = (manifest || {});
    var writable = drive.writable;
    var mtime = updateMTime ? Date.now() : oldMeta.mtime;
    var details = {title, description, type, forkOf, mtime, size, author, writable};

    // check for changes
    if (!hasMetaChanged(details, oldMeta)) {
      return
    }

    // write the record
    await setMeta(key, details);

    // emit the updated event
    details.url = 'hyper://' + key + '/';
    drivesEvents.emit('updated', {key, details, oldMeta});
    logger$7.info('Updated recorded metadata for hyperdrive', {key, details});
    return details
  } catch (e) {
    console.error('Error pulling meta', e);
  }
}

// drive creation
// =

/**
 * @returns {Promise<DaemonHyperdrive>}
 */
async function createNewRootDrive () {
  var drive = await loadDrive(null, {visibility: 'private'});
  await pullLatestDriveMeta(drive);
  return drive
}
/**
 * @param {Object} [manifest]
 * @returns {Promise<DaemonHyperdrive>}
 */
async function createNewDrive (manifest = {}) {
  // create the drive
  var drive = await loadDrive(null);

  // announce the drive
  drive.session.drive.configureNetwork({
    announce: true,
    lookup: true
  });

  // write the manifest and default datignore
  await Promise.all([
    drive.pda.writeManifest(manifest)
    // DISABLED drive.pda.writeFile('/.datignore', await settingsDb.get('default_dat_ignore'), 'utf8')
  ]);

  // save the metadata
  await pullLatestDriveMeta(drive);

  return drive
}

/**
 * @param {string} srcDriveUrl
 * @param {Object} [opts]
 * @returns {Promise<DaemonHyperdrive>}
 */
async function forkDrive (srcDriveUrl, opts = {}) {
  srcDriveUrl = fromKeyToURL(srcDriveUrl);

  // get the source drive
  var srcDrive;
  var downloadRes = await Promise.race([
    (async function () {
      srcDrive = await getOrLoadDrive(srcDriveUrl);
      if (!srcDrive) {
        throw new Error('Invalid drive key')
      }
      // return srcDrive.session.drive.download('/') TODO needed?
    })(),
    new Promise(r => setTimeout(() => r('timeout'), 60e3))
  ]);
  if (downloadRes === 'timeout') {
    throw new beakerErrorConstants.TimeoutError('Timed out while downloading source drive')
  }

  // fetch source drive meta
  var srcManifest = await srcDrive.pda.readManifest().catch(_ => {});
  srcManifest = srcManifest || {};

  // override any opts data
  var dstManifest = {
    title: (opts.title) ? opts.title : srcManifest.title,
    description: (opts.description) ? opts.description : srcManifest.description,
    forkOf: opts.detached ? undefined : fromKeyToURL(srcDriveUrl)
    // author: manifest.author
  };
  for (let k in srcManifest) {
    if (k === 'author') continue
    if (!dstManifest[k]) {
      dstManifest[k] = srcManifest[k];
    }
  }

  // create the new drive
  var dstDrive = await createNewDrive(dstManifest);

  // copy files
  var ignore = ['/.dat', '/.git', '/index.json'];
  await pda__default.exportArchiveToArchive({
    srcArchive: srcDrive.session.drive,
    dstArchive: dstDrive.session.drive,
    skipUndownloadedFiles: false,
    ignore
  });

  return dstDrive
}
// drive management
// =

async function loadDrive (key, opts) {
  // validate key
  if (key) {
    if (!Buffer.isBuffer(key)) {
      // existing dat
      key = await fromURLToKey(key, true);
      if (!HYPERDRIVE_HASH_REGEX.test(key)) {
        throw new beakerErrorConstants.InvalidURLError()
      }
      key = datEncoding.toBuf(key);
    }
  }

  // fallback to the promise, if possible
  var keyStr = key ? datEncoding.toStr(key) : null;
  if (keyStr && keyStr in driveLoadPromises) {
    return driveLoadPromises[keyStr]
  }

  // run and cache the promise
  var p = loadDriveInner(key, opts);
  if (key) driveLoadPromises[keyStr] = p;
  p.catch(err => {
    console.error('Failed to load drive', keyStr, err.toString());
  });

  // when done, clear the promise
  if (key) {
    const clear = () => delete driveLoadPromises[keyStr];
    p.then(clear, clear);
  }

  return p
}

// main logic, separated out so we can capture the promise
async function loadDriveInner (key, opts) {
  try {
    // fetch dns name if known
    var domain = await reverseResolve(key);
    // let dnsRecord = await hyperDnsDb.getCurrentByKey(datEncoding.toStr(key)) TODO
    // drive.domain = dnsRecord ? dnsRecord.name : undefined
    
    // create the drive session with the daemon
    var drive = await createHyperdriveSession({key, domain});
    drive.pullLatestDriveMeta = opts => pullLatestDriveMeta(drive, opts);
    key = drive.key;

    if (opts && opts.persistSession) {
      drive.persistSession = true;
    }

    // update db
    touch(drive.key).catch(err => console.error('Failed to update lastAccessTime for drive', drive.key, err));
    if (!drive.writable) {
      await downloadHack(drive, DRIVE_MANIFEST_FILENAME);
    }
    await drive.pullLatestDriveMeta();
    update(drive);

    return drive
  } catch (e) {
    if (e.toString().includes('daemon has shut down') || e.toString().includes('RPC stream destroyed')) ; else {
      throw e
    }
  }
}

/**
 * HACK to work around the incomplete daemon-client download() method -prf
 */
async function downloadHack (drive, path) {
  if (!(await drive.pda.stat(path).catch(err => undefined))) return
  let fileStats = (await drive.session.drive.fileStats(path)).get(path);
  if (fileStats.downloadedBlocks >= fileStats.blocks) return
  await drive.session.drive.download(path);
  for (let i = 0; i < 10; i++) {
    await wait(500);
    fileStats = (await drive.session.drive.fileStats(path)).get(path);
    if (fileStats.downloadedBlocks >= fileStats.blocks) {
      return
    }
  }
}

function getDrive (key) {
  key = fromURLToKey(key);
  return getHyperdriveSession({key})
}

async function getDriveCheckout (drive, version) {
  var isHistoric = false;
  var checkoutFS = drive;
  if (typeof version !== 'undefined' && version !== null) {
    let seq = parseInt(version);
    if (Number.isNaN(seq)) {
      if (version === 'latest') ; else {
        throw new Error('Invalid version identifier:' + version)
      }
    } else {
      let latestVersion = await drive.session.drive.version();
      if (version <= latestVersion) {
        checkoutFS = await createHyperdriveSession({
          key: drive.key,
          version,
          writable: false,
          domain: drive.domain
        });
        isHistoric = true;
      }
    }
  }
  return {isHistoric, checkoutFS}
}
async function getOrLoadDrive (key, opts) {
  key = await fromURLToKey(key, true);
  var drive = getDrive(key);
  if (drive) return drive
  return loadDrive(key, opts)
}

async function unloadDrive (key) {
  key =  fromURLToKey(key, false);
  closeHyperdriveSession({key});
}
function isDriveLoaded (key) {
  key = fromURLToKey(key);
  return !!getHyperdriveSession({key})
}

// drive fetch/query
// =

async function getDriveInfo (key, {ignoreCache, onlyCache} = {ignoreCache: false, onlyCache: false}) {
  var meta;
  try {
    // get the drive
    key = await fromURLToKey(key, true);
    var drive;
    if (!onlyCache) {
      drive = getDrive(key);
      if (!drive && ignoreCache) {
        drive = await loadDrive(key);
      }
    }

    var domain = drive ? drive.domain : await reverseResolve(key);
    var url = `hyper://${domain || key}/`;

    // fetch drive data
    var manifest, driveInfo;
    if (drive) {
      await drive.pullLatestDriveMeta()
      ;[meta, manifest, driveInfo] = await Promise.all([
        getMeta(key),
        drive.pda.readManifest().catch(_ => {}),
        drive.getInfo()
      ]);
    } else {
      meta = await getMeta(key);
      driveInfo = {version: undefined};
    }
    manifest = manifest || {};
    if (isRootUrl(url) && !meta.title) {
      meta.title = 'My Private Drive';
    }
    meta.key = key;
    meta.discoveryKey = drive ? drive.discoveryKey : undefined;
    meta.url = url;
    // meta.domain = drive.domain TODO
    meta.links = manifest.links || {};
    meta.manifest = manifest;
    meta.version = driveInfo.version;
    meta.peers = drive?.session?.drive?.metadata?.peers?.length || 0;
  } catch (e) {
    meta = {
      key,
      url: `hyper://${key}/`,
      writable: false,
      version: 0,
      title: '',
      description: ''
    };
  }
  meta.title = meta.title || '';
  meta.description = meta.description || '';
  return meta
}

async function clearFileCache (key) {
  return {} // TODO daemon.clearFileCache(key, userSettings)
}

/**
 * @desc
 * Get the primary URL for a given dat URL
 *
 * @param {string} url
 * @returns {Promise<string>}
 */
async function getPrimaryUrl (url) {
  var key = await fromURLToKey(url, true);
  var datDnsRecord = await getCurrentByKey(key);
  if (!datDnsRecord) return `hyper://${key}/`
  return `hyper://${datDnsRecord.name}/`
}

/**
 * @desc
 * Check that the drive's index.json `domain` matches the current DNS
 * If yes, write the confirmed entry to the dat_dns table
 *
 * @param {string} key
 * @returns {Promise<boolean>}
 */
async function confirmDomain (key) {
  // DISABLED
  // hyper: does not currently use DNS
  // -prf

  // // fetch the current domain from the manifest
  // try {
  //   var drive = await getOrLoadDrive(key)
  //   var datJson = await drive.pda.readManifest()
  // } catch (e) {
  //   return false
  // }
  // if (!datJson.domain) {
  //   await hyperDnsDb.unset(key)
  //   return false
  // }

  // // confirm match with current DNS
  // var dnsKey = await hyperDns.resolveName(datJson.domain)
  // if (key !== dnsKey) {
  //   await hyperDnsDb.unset(key)
  //   return false
  // }

  // // update mapping
  // await hyperDnsDb.update({name: datJson.domain, key})
  // return true
}

// helpers
// =

function fromURLToKey (url, lookupDns = false) {
  if (Buffer.isBuffer(url)) {
    return url
  }
  if (HYPERDRIVE_HASH_REGEX.test(url)) {
    // simple case: given the key
    return url
  }

  var urlp = parseDriveUrl(url);
  if (urlp.protocol !== 'hyper:' && urlp.protocol !== 'dat:') {
    throw new beakerErrorConstants.InvalidURLError('URL must be a hyper: or dat: scheme')
  }
  if (!HYPERDRIVE_HASH_REGEX.test(urlp.host)) {
    if (!lookupDns) {
      throw new beakerErrorConstants.InvalidURLError('Hostname is not a valid hash')
    }
    return resolveName(urlp.host)
  }

  return urlp.host
}

function fromKeyToURL (key) {
  if (typeof key !== 'string') {
    key = datEncoding.toStr(key);
  }
  if (!key.startsWith('hyper://')) {
    return `hyper://${key}/`
  }
  return key
}

function hasMetaChanged (m1, m2) {
  for (let k of ['title', 'description', 'forkOf', 'size', 'author', 'writable', 'mtime']) {
    if (!m1[k]) m1[k] = undefined;
    if (!m2[k]) m2[k] = undefined;
    if (k === 'forkOf') {
      if (!isUrlsEq(m1[k], m2[k])) {
        return true
      }
    } else {
      if (m1[k] !== m2[k]) {
        return true
      }
    }
  }
  return false
}

var isUrlsEqRe = /([0-9a-f]{64})/i;
function isUrlsEq (a, b) {
  if (!a && !b) return true
  if (typeof a !== typeof b) return false
  var ma = isUrlsEqRe.exec(a);
  var mb = isUrlsEqRe.exec(b);
  return ma && mb && ma[1] === mb[1]
}

var drives$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  on: on$5,
  addListener: addListener$2,
  removeListener: removeListener$3,
  setup: setup$p,
  ensureHosting: ensureHosting,
  createEventStream: createEventStream,
  getDebugLog: getDebugLog,
  createDebugStream: createDebugStream,
  pullLatestDriveMeta: pullLatestDriveMeta,
  createNewRootDrive: createNewRootDrive,
  createNewDrive: createNewDrive,
  forkDrive: forkDrive,
  loadDrive: loadDrive,
  getDrive: getDrive,
  getDriveCheckout: getDriveCheckout,
  getOrLoadDrive: getOrLoadDrive,
  unloadDrive: unloadDrive,
  isDriveLoaded: isDriveLoaded,
  getDriveInfo: getDriveInfo,
  clearFileCache: clearFileCache,
  getPrimaryUrl: getPrimaryUrl,
  confirmDomain: confirmDomain,
  fromURLToKey: fromURLToKey,
  fromKeyToURL: fromKeyToURL
});

/**
 * @returns {string}
 */
const drivesDebugPage = function () {
  var drives = []; // TODO getActiveDrives()
  return `<html>
    <body>
      ${Object.keys(drives).map(key => {
    var a = drives[key];
    return `<div style="font-family: monospace">
          <h3>${a.key.toString('hex')}</h3>
          <table>
            <tr><td>Meta DKey</td><td>${a.discoveryKey.toString('hex')}</td></tr>
            <tr><td>Content DKey</td><td>${a.content.discoveryKey.toString('hex')}</td></tr>
            <tr><td>Meta Key</td><td>${a.key.toString('hex')}</td></tr>
            <tr><td>Content Key</td><td>${a.content.key.toString('hex')}</td></tr>
          </table>
        </div>`
  }).join('')}
    </body>
  </html>`
};

/**
 * @returns {string}
 */
const datDnsCachePage = function () {
  var cache = undefined();
  return `<html>
    <body>
      <h1>Dat DNS cache</h1>
      <p><button>Clear cache</button></p>
      <table style="font-family: monospace">
        ${Object.keys(cache).map(name => {
    var key = cache[name];
    return `<tr><td><strong>${name}</strong></td><td>${key}</td></tr>`
  }).join('')}
      </table>
      <script src="wallets://dat-dns-cache/main.js"></script>
    </body>
  </html>`
};

/**
 * @returns {string}
 */
const datDnsCacheJS = function () {
  return `
    document.querySelector('button').addEventListener('click', clear)
    async function clear () {
      await beaker.drives.clearDnsCache()
      location.reload()
    }
  `
};

var debug = /*#__PURE__*/Object.freeze({
  __proto__: null,
  drivesDebugPage: drivesDebugPage,
  datDnsCachePage: datDnsCachePage,
  datDnsCacheJS: datDnsCacheJS
});

// typedefs
// =

/**
 * @typedef {Object} WatchedSite
 * @prop {number} profileId
 * @prop {string} url
 * @prop {string} description
 * @prop {boolean} seedWhenResolved
 * @prop {boolean} resolved
 * @prop {number} updatedAt
 * @prop {number} createdAt
 */

// exported methods
// =

/**
 * @param {number} profileId
 * @param {string} url
 * @param {Object} opts
 * @param {string} opts.description
 * @param {number} opts.seedWhenResolved
 * @return {Promise<void>}
 */
async function addSite (profileId, url, opts) {
  var release = await lock('watchlist-db');
  try {
    // get date for timestamp in seconds floored
    var ts = (Date.now() / 1000 | 0);

    // check if site already being watched
    var site = await get$2('SELECT rowid, * from watchlist WHERE profileId = ? AND url = ?', [profileId, url]);
    if (!site) {
      // add site to watch list
      await run('INSERT INTO watchlist (profileId, url, description, seedWhenResolved, createdAt) VALUES (?, ?, ?, ?, ?);', [profileId, url, opts.description, opts.seedWhenResolved, ts]);
    }
  } finally {
    release();
  }
  return get$2('SELECT rowid, * from watchlist WHERE profileId = ? AND url = ?', [profileId, url])
}

/**
 * @param {number} profileId
 * @returns {Promise<Array<WatchedSite>>}
 */
async function getSites (profileId) {
  return all(`SELECT * FROM watchlist WHERE profileId = ?`, [profileId])
}

/**
 * @param {number} profileId
 * @param {WatchedSite} site
 * @returns {Promise<void>}
 */
async function updateWatchlist (profileId, site) {
  var updatedAt = (Date.now() / 1000 | 0);

  var release = await lock('watchlist-db');
  try {
    await run(`UPDATE watchlist SET seedWhenResolved = ?, resolved = ?, updatedAt = ?
    WHERE profileId = ? AND url = ?`, [site.seedWhenResolved, site.resolved, updatedAt, profileId, site.url]);
  } finally {
    release();
  }
}

/**
 * @param {number} profileId
 * @param {string} url
 * @return {Promise<void>}
 */
async function removeSite (profileId, url) {
  return run(`DELETE FROM watchlist WHERE profileId = ? AND url = ?`, [profileId, url])
}

var watchlist = /*#__PURE__*/Object.freeze({
  __proto__: null,
  addSite: addSite,
  getSites: getSites,
  updateWatchlist: updateWatchlist,
  removeSite: removeSite
});

const logger$8 = child({category: 'hyper', subcategory: 'watchlist'});

// globals
// =

var watchlistEvents = new EventEmitter__default();

// exported methods
// =

async function setup$q () {
  try {
    var watchedSites = await getSites(0);
    for (let site of watchedSites) {
      watch(site);
    }
  } catch (err) {
    logger$8.error('Error while loading watchlist', {err});
    throw new Error('Failed to load the watchlist')
  }
}

async function addSite$1 (profileId, url, opts) {
    // validate parameters
  if (!url || typeof url !== 'string') {
    throw new Error('url must be a string')
  }
  if (!opts.description || typeof opts.description !== 'string') {
    throw new Error('description must be a string')
  }
  if (typeof opts.seedWhenResolved !== 'boolean') {
    throw new Error('seedWhenResolved must be a boolean')
  }
  if (!url.startsWith('hyper://')) {
    url = 'hyper://' + url + '/';
  }

  try {
    var site = await addSite(profileId, url, opts);
    watch(site);
  } catch (err) {
    throw new Error('Failed to add to watchlist')
  }
}

async function getSites$1 (profileId) {
  return getSites(profileId)
}

async function updateWatchlist$1 (profileId, site, opts) {
  try {
    await updateWatchlist(profileId, site, opts);
  } catch (err) {
    throw new Error('Failed to update the watchlist')
  }
}

async function removeSite$1 (profileId, url) {
  // validate parameters
  if (!url || typeof url !== 'string') {
    throw new Error('url must be a string')
  }
  return removeSite(profileId, url)
}

// events

function createEventsStream$1 () {
  return emitStream(watchlistEvents)
}

// internal methods
// =

async function watch (site) {
  // resolve DNS
  var key;
  try {
    key = await resolveName(site.url);
  } catch (e) {}
  if (!key) {
    // try again in 30s
    setTimeout(watch, 30e3);
    return
  }

  // load drive
  var drive = await loadDrive(key);
  if (site.resolved === 0) {
    watchlistEvents.emit('resolved', site);
  }
  await updateWatchlist$1(0, site, {resolved: 1});
}

var watchlist$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  setup: setup$q,
  addSite: addSite$1,
  getSites: getSites$1,
  updateWatchlist: updateWatchlist$1,
  removeSite: removeSite$1,
  createEventsStream: createEventsStream$1
});

var hyper = {
  drives: drives$1,
  assets,
  debug,
  dns: hyperDns,
  watchlist: watchlist$1,
  daemon,
  async setup (opts) {
    await this.drives.setup(opts);
    await this.watchlist.setup();
  }
};

var tmpdirs = {};
function getStoragePathFor (key) {
  if (tmpdirs[key]) return tmpdirs[key]
  tmpdirs[key] = path.join(os.tmpdir(), 'dat', key);
  return tmpdirs[key]
}

var downloadPromises = {};
async function downloadDat (key) {
  if (downloadPromises[key]) {
    return downloadPromises[key]
  }

  var storagePath = getStoragePathFor(key);
  rimraf.sync(storagePath);
  mkdirp.sync(storagePath);

  downloadPromises[key] = runConvertProcess(
    electron.app.getPath('userData'),
    key,
    storagePath
  );

  return downloadPromises[key]
}

async function convertDatArchive (win, key) {
  await downloadDat(key);

  var storagePath = getStoragePathFor(key);
  var drive = await hyper.drives.createNewDrive();

  // calculate size of import for progress
  var numFilesToImport = 0;
  let stats = await pda__default.exportFilesystemToArchive({
    srcPath: storagePath,
    dstArchive: drive.session.drive,
    dstPath: '/',
    inplaceImport: true,
    dryRun: true
  });
  numFilesToImport += stats.fileCount;

  var prompt = await create$1(win.webContents, 'progress', {label: 'Converting dat...'});
  try {
    await pda__default.exportFilesystemToArchive({
      srcPath: storagePath,
      dstArchive: drive.session.drive,
      dstPath: '/',
      inplaceImport: true,
      progress (stats) {
        prompt.webContents.executeJavaScript(`updateProgress(${stats.fileCount / numFilesToImport}); undefined`);
      }
    });
  } finally {
    close$1(prompt.tab);
  }

  await drive.pda.rename('/dat.json', drive.session.drive, '/index.json').catch(e => undefined);
  await configDrive(drive.url);
  return drive.url
}

async function runConvertProcess (...args) {
  var fullModulePath = path.join(__dirname, 'bg', 'dat', 'converter', 'index.js');
  const opts = {
    stdio: 'inherit',
    env: Object.assign({}, process.env, {
      ELECTRON_RUN_AS_NODE: 1,
      ELECTRON_NO_ASAR: 1
    })
  };
  var proc = childProcess.fork(fullModulePath, args, opts);

  return new Promise((resolve, reject) => {
    proc.on('error', reject);
    proc.on('close', resolve);
  })
}

const logger$9 = child({category: 'dat', subcategory: 'dns'});

const DNS_PROVIDERS = [['cloudflare-dns.com', '/dns-query'], ['dns.google.com', '/resolve']];
const DNS_PROVIDER = DNS_PROVIDERS[Math.random() > 0.5 ? 1 : 0];

const datDns = datDnsFactory({
  dnsHost: DNS_PROVIDER[0],
  dnsPath: DNS_PROVIDER[1]
});

// hook up log events
datDns.on('resolved', details => logger$9.debug('Resolved', {details}));
datDns.on('failed', details => logger$9.debug('Failed lookup', {details}));
datDns.on('cache-flushed', details => logger$9.debug('Cache flushed'));

// wrap resolveName() with a better error
const resolveName$1 = datDns.resolveName;
datDns.resolveName = async function (name, opts, cb) {
  return resolveName$1.apply(datDns, arguments)
    .catch(_ => {
      throw new beakerErrorConstants.InvalidDomainName()
    })
};

const exec = require('util').promisify(require('child_process').exec);
const logger$a = child({category: 'browser'});

// constants
// =

const IS_FROM_SOURCE = (process.defaultApp || /node_modules[\\/]electron[\\/]/.test(process.execPath));
const IS_LINUX$1 = !(/^win/.test(process.platform)) && process.platform !== 'darwin';
const DOT_DESKTOP_FILENAME = 'appimagekit-beaker-browser.desktop';
const isBrowserUpdatesSupported = !(IS_LINUX$1 || IS_FROM_SOURCE); // linux is temporarily not supported

// how long between scheduled auto updates?
const SCHEDULED_AUTO_UPDATE_DELAY = 24 * 60 * 60 * 1e3; // once a day

// possible updater states
const UPDATER_STATUS_IDLE = 'idle';
const UPDATER_STATUS_CHECKING = 'checking';
const UPDATER_STATUS_DOWNLOADING = 'downloading';
const UPDATER_STATUS_DOWNLOADED = 'downloaded';

// globals
// =

// dont automatically check for updates (need to respect user preference)
electronUpdater.autoUpdater.autoDownload = false;

// what's the updater doing?
var updaterState = UPDATER_STATUS_IDLE;
var updaterError = undefined; // has there been an error?

// content-type tracker
var resourceContentTypes = new LRU(100); // URL -> Content-Type

// certificate tracker
var originCerts = new LRU(100); // hostname -> {issuerName, subjectName, validExpiry}

// events emitted to rpc clients
var browserEvents = new EventEmitter__default();

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at: Promise', p, 'reason:', reason, reason.stack);
  logger$a.error(`Unhandled Rejection at: Promise ${p.toString()} reason: ${reason.toString()} ${reason.stack}`);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  logger$a.error(`Uncaught exception: ${err.toString()}`);
});

// exported methods
// =

async function setup$r () {
  setup$b();

  // setup auto-updater
  if (isBrowserUpdatesSupported) {
    try {
      electronUpdater.autoUpdater.setFeedURL(getAutoUpdaterFeedSettings());
      electronUpdater.autoUpdater.on('update-available', onUpdateAvailable);
      electronUpdater.autoUpdater.on('update-not-available', onUpdateNotAvailable);
      electronUpdater.autoUpdater.on('update-downloaded', onUpdateDownloaded);
      electronUpdater.autoUpdater.on('error', onUpdateError);
    } catch (e) {
      logger$a.error(`Auto-updater error: ${e.toString()}`);
    }
    setTimeout(scheduledAutoUpdate, 15e3); // wait 15s for first run
  }

  // wire up events
  electron.app.on('web-contents-created', onWebContentsCreated);

  // window.prompt handling
  //  - we have use ipc directly instead of using rpc, because we need custom
  //    response-lifecycle management in the main thread
  electron.ipcMain.on('page-prompt-dialog', async (e, message, def) => {
    var wc = e.sender;
    var res = await create$3(e.sender, 'prompt', {message, default: def}).catch(e => false);
    wc.focus();
    e.returnValue = res && res.value ? res.value : false;
  });

  // HACK
  // Electron has an issue where browserviews fail to calculate click regions after a resize
  // https://github.com/electron/electron/issues/14038
  // we can solve this by forcing a recalculation after every resize
  // -prf
  electron.ipcMain.on('resize-hackfix', (e, message) => {
    var win = findWebContentsParentWindow(e.sender);
    if (win) {
      win.webContents.executeJavaScript(`if (window.forceUpdateDragRegions) { window.forceUpdateDragRegions() }; undefined`);
    }
  });

  // request blocking for security purposes
  electron.session.defaultSession.webRequest.onBeforeRequest((details, cb) => {
    if (details.url.startsWith('asset:') || details.url.startsWith('wallets:')) {
      if (details.resourceType === 'mainFrame') {
        // allow toplevel navigation
        return cb({cancel: false})
      } else if (details.webContentsId && isWcTrusted(details.webContentsId)) {
        // allow trusted WCs
        return cb({cancel: false})
      } else {
        // disallow all other requesters
        return cb({cancel: true})
      }
    } else if (details.url.startsWith('hyper://private')) {
      if (!details.webContentsId) {
        if (details.resourceType === 'mainFrame') {
          // allow toplevel navigation
          return cb({cancel: false})
        } else {
          // not enough info, cancel
          return cb({cancel: true})
        }
      }
      let wc = electron.webContents.fromId(details.webContentsId);
      if (/^(wallets:\/\/|hyper:\/\/private\/)/.test(wc.getURL())) {
        // allow access from self and from beaker
        cb({cancel: false});
      } else {
        cb({cancel: true});
      }
    } else {
      onBeforeRequest(details, cb);
    }
  });

  // HACK
  // Electron doesn't give us a convenient way to check the content-types of responses
  // or to fetch the certs of a hostname
  // so we track the last 100 responses' headers to accomplish this
  // -prf
  electron.session.defaultSession.webRequest.onCompleted(onCompleted);
  electron.session.defaultSession.setCertificateVerifyProc((request, cb) => {
    originCerts.set('https://' + request.hostname + '/', {
      issuerName: request.certificate.issuerName,
      subjectName: request.certificate.subjectName,
      validExpiry: request.certificate.validExpiry
    });
    cb(request.errorCode);
  });
}

const WEBAPI$4 = {
  createEventsStream: createEventsStream$2,
  getInfo,
  getDaemonStatus: getDaemonStatus$1,
  getDaemonNetworkStatus,
  checkForUpdates,
  restartBrowser,

  getSetting,
  getSettings,
  setSetting,
  updateAdblocker,
  updateSetupState,
  migrate08to09,
  setStartPageBackgroundImage,

  getDefaultProtocolSettings,
  setAsDefaultProtocolClient,
  removeAsDefaultProtocolClient,

  fetchBody,
  downloadURL,

  convertDat,

  getResourceContentType,
  getCertificate,

  listBuiltinFavicons,
  getBuiltinFavicon,
  uploadFavicon,
  imageToIco,

  reconnectHyperdriveDaemon () {
    return setup$5()
  },

  executeShellWindowCommand,
  toggleSiteInfo,
  toggleLiveReloading,
  setWindowDimensions,
  setWindowDragModeEnabled,
  moveWindow,
  maximizeWindow,
  toggleWindowMaximized,
  minimizeWindow,
  closeWindow,
  resizeSiteInfo,
  refreshTabState,

  spawnAndExecuteJs,

  showOpenDialog,
  showContextMenu,
  async showModal (name, opts) {
    return create$3(this.sender, name, opts)
  },
  newWindow,
  newPane,
  gotoUrl,
  getPageUrl,
  refreshPage,
  focusPage,
  executeJavaScriptInPage,
  injectCssInPage,
  uninjectCssInPage,
  openUrl: (url, opts) => { open(url, opts); }, // dont return anything
  openFolder,
  doWebcontentsCmd,
  doTest,
  closeModal: () => {}, // DEPRECATED, probably safe to remove soon
};

function fetchBody (url) {
  return new Promise((resolve) => {
    var http = url.startsWith('https') ? require('https') : require('http');

    http.get(url, (res) => {
      var body = '';
      res.setEncoding('utf8');
      res.on('data', (data) => { body += data; });
      res.on('end', () => resolve(body));
    });
  })
}

async function downloadURL (url) {
  this.sender.downloadURL(url);
}

async function convertDat (url) {
  var win = findWebContentsParentWindow(this.sender);
  var key = await datDns.resolveName(url);
  var driveUrl = await convertDatArchive(win, key);
  create$2(win, driveUrl, {setActive: true});
}

function getResourceContentType (url) {
  let i = url.indexOf('#');
  if (i !== -1) url = url.slice(0, i); // strip the fragment
  return resourceContentTypes.get(url)
}

async function getCertificate (url) {
  try {
    let urlp = new URL(url);
    url = urlp.protocol + '//' + urlp.hostname + '/';
  } catch (e) {}
  var cert = originCerts.get(url);
  if (cert) {
    return Object.assign({type: 'tls'}, cert)
  } else if (url.startsWith('wallets:')) {
    return {type: 'beaker'}
  } else if (url.startsWith('hyper://')) {
    let ident = await getDriveIdent(url);
    return {type: 'hyperdrive', ident}
  }
}

async function listBuiltinFavicons ({filter, offset, limit} = {}) {
  if (filter) {
    filter = new RegExp(filter, 'i');
  }

  // list files in assets/favicons and filter on the name
  var dir = jetpack.cwd(__dirname).cwd('assets/favicons');
  var items = (await dir.listAsync())
    .filter(filename => {
      if (filter && !filter.test(filename)) {
        return false
      }
      return filename.endsWith('.ico')
    });
  return items.slice(offset || 0, limit || Number.POSITIVE_INFINITY)
}

async function getBuiltinFavicon (name) {
  var dir = jetpack.cwd(__dirname).cwd('assets/favicons');
  return dir.readAsync(name, 'buffer')
}

async function uploadFavicon () {
  let favicon = electron.dialog.showOpenDialogSync({
    title: 'Upload Favicon...',
    defaultPath: electron.app.getPath('home'),
    buttonLabel: 'Upload Favicon',
    filters: [
      { name: 'Images', extensions: ['png', 'ico', 'jpg'] }
    ],
    properties: ['openFile']
  });

  if (!favicon) return

  let faviconBuffer = await jetpack.readAsync(favicon[0], 'buffer');
  let extension = path__default.extname(favicon[0]);

  if (extension === '.png') {
    return toIco(faviconBuffer, {resize: true})
  }
  if (extension === '.jpg') {
    let imageToPng = electron.nativeImage.createFromBuffer(faviconBuffer).toPNG();
    return toIco(imageToPng, {resize: true})
  }
  if (extension === '.ico' && ICO.isICO(faviconBuffer)) {
    return faviconBuffer
  }
}

async function imageToIco (image) {
  // TODO expand on this function to be png/jpg to ico
  let imageToPng = electron.nativeImage.createFromDataURL(image).toPNG();
  return toIco(imageToPng, {resize: true})
}

async function executeShellWindowCommand (...args) {
  var win = findWebContentsParentWindow(this.sender);
  if (!win) return
  win.webContents.send('command', ...args);
}

async function toggleSiteInfo (override) {
  var win = findWebContentsParentWindow(this.sender);
  if (override === true) {
    show$5(win);
  } else if (override === false) {
    hide$5(win);
  } else {
    toggle$1(win);
  }
}

async function toggleLiveReloading (enabled) {
  var win = findWebContentsParentWindow(this.sender);
  getActive(win).toggleLiveReloading(enabled);
}

async function setWindowDimensions ({width, height} = {}) {
  var win = findWebContentsParentWindow(this.sender);
  var [currentWidth, currentHeight] = win.getSize();
  width = width || currentWidth;
  height = height || currentHeight;
  win.setSize(width, height);
}

var _windowDragInterval = undefined;
async function setWindowDragModeEnabled (enabled) {
  var win = findWebContentsParentWindow(this.sender);
  if (enabled) {
    if (_windowDragInterval) return

    // poll the mouse cursor every 15ms
    var lastPt = electron.screen.getCursorScreenPoint();
    _windowDragInterval = setInterval(() => {
      var newPt = electron.screen.getCursorScreenPoint();

      // if the mouse has moved, move the window accordingly
      var delta = {x: newPt.x - lastPt.x, y: newPt.y - lastPt.y};
      if (delta.x || delta.y) {
        var pos = win.getPosition();
        win.setPosition(pos[0] + delta.x, pos[1] + delta.y);
        lastPt = newPt;
      }

      // if the mouse has moved out of the window, stop
      var bounds = win.getBounds();
      if (newPt.x < bounds.x || newPt.y < bounds.y || newPt.x > (bounds.x + bounds.width) || newPt.y > (bounds.y + bounds.height)) {
        clearInterval(_windowDragInterval);
        _windowDragInterval = undefined;
      }
    }, 15);
  } else {
    // stop the poll
    if (!_windowDragInterval) return
    clearInterval(_windowDragInterval);
    _windowDragInterval = undefined;
  }
}

async function moveWindow (x, y) {
  var win = findWebContentsParentWindow(this.sender);
  var pos = win.getPosition();
  win.setPosition(pos[0] + x, pos[1] + y);
}

async function maximizeWindow () {
  var win = findWebContentsParentWindow(this.sender);
  win.maximize();
}

async function toggleWindowMaximized () {
  var win = findWebContentsParentWindow(this.sender);
  if (win.isMaximized()) {
    win.unmaximize();
  } else {
    win.maximize();
  }
}

async function minimizeWindow () {
  var win = findWebContentsParentWindow(this.sender);
  win.minimize();
}

async function closeWindow () {
  var win = findWebContentsParentWindow(this.sender);
  win.close();
}

function resizeSiteInfo (bounds) {
  var win = findWebContentsParentWindow(this.sender);
  if (!win) return
  resize(win, bounds);
}

async function refreshTabState () {
  var win = findWebContentsParentWindow(this.sender);
  if (!win) return
  var tab = getActive(win);
  if (!tab) return
  await tab.refreshState();
}

function setStartPageBackgroundImage (srcPath, appendCurrentDir) {
  if (appendCurrentDir) {
    srcPath = path__default.join(__dirname, `/${srcPath}`);
  }

  var destPath = path__default.join(electron.app.getPath('userData'), 'start-background-image');

  return new Promise((resolve) => {
    if (srcPath) {
      fs__default.readFile(srcPath, (_, data) => {
        fs__default.writeFile(destPath, data, () => resolve());
      });
    } else {
      fs__default.unlink(destPath, () => resolve());
    }
  })
}

async function getDefaultProtocolSettings () {
  if (IS_LINUX$1) {
    // HACK
    // xdb-settings doesnt currently handle apps that you can't `which`
    // we can just use xdg-mime directly instead
    // see https://github.com/beakerbrowser/beaker/issues/915
    // -prf
    let [httpHandler, hyperHandler, datHandler] = await Promise.all([
      // If there is no default specified, be sure to catch any error
      // from exec and return '' otherwise Promise.all errors out.
      exec('xdg-mime query default "x-scheme-handler/http"').catch(err => ''),
      exec('xdg-mime query default "x-scheme-handler/hyper"').catch(err => ''),
      exec('xdg-mime query default "x-scheme-handler/dat"').catch(err => '')
    ]);
    if (httpHandler && httpHandler.stdout) httpHandler = httpHandler.stdout;
    if (hyperHandler && hyperHandler.stdout) hyperHandler = hyperHandler.stdout;
    if (datHandler && datHandler.stdout) datHandler = datHandler.stdout;
    return {
      http: (httpHandler || '').toString().trim() === DOT_DESKTOP_FILENAME,
      hyper: (hyperHandler || '').toString().trim() === DOT_DESKTOP_FILENAME,
      dat: (datHandler || '').toString().trim() === DOT_DESKTOP_FILENAME
    }
  }

  return Promise.resolve(['http', 'hyper', 'dat'].reduce((res, x) => {
    res[x] = electron.app.isDefaultProtocolClient(x);
    return res
  }, {}))
}

async function setAsDefaultProtocolClient (protocol) {
  if (IS_LINUX$1) {
    // HACK
    // xdb-settings doesnt currently handle apps that you can't `which`
    // we can just use xdg-mime directly instead
    // see https://github.com/beakerbrowser/beaker/issues/915
    // -prf
    await exec(`xdg-mime default ${DOT_DESKTOP_FILENAME} "x-scheme-handler/${protocol}"`);
    return true
  }
  return Promise.resolve(electron.app.setAsDefaultProtocolClient(protocol))
}

function removeAsDefaultProtocolClient (protocol) {
  return Promise.resolve(electron.app.removeAsDefaultProtocolClient(protocol))
}

function getInfo () {
  return {
    version: electron.app.getVersion(),
    electronVersion: process.versions.electron,
    chromiumVersion: process.versions.chrome,
    nodeVersion: process.versions.node,
    platform: os__default.platform(),
    updater: {
      isBrowserUpdatesSupported,
      error: updaterError,
      state: updaterState
    },
    paths: {
      userData: electron.app.getPath('userData')
    },
    isDaemonActive: isActive()
  }
}

async function getDaemonStatus$1 () {
  return getDaemonStatus()
}

async function getDaemonNetworkStatus () {
  // bit of a hack, this
  return Array.from(getClient().drive._drives, drive => {
    var key = drive.drive.key.toString('hex');
    return {
      key,
      peers: listPeerAddresses(key)
    }
  })
}

function checkForUpdates (opts = {}) {
  // dont overlap
  if (updaterState != UPDATER_STATUS_IDLE) { return }

  // update global state
  logger$a.info('[AUTO-UPDATE] Checking for a new version.');
  updaterError = undefined;
  setUpdaterState(UPDATER_STATUS_CHECKING);
  if (opts.prerelease) {
    logger$a.info('[AUTO-UPDATE] Jumping to pre-releases.');
    electronUpdater.autoUpdater.allowPrerelease = true;
  }
  electronUpdater.autoUpdater.checkForUpdates();

  // just return a resolve; results will be emitted
  return Promise.resolve()
}

function restartBrowser () {
  if (updaterState == UPDATER_STATUS_DOWNLOADED) {
    // run the update installer
    electronUpdater.autoUpdater.quitAndInstall();
    logger$a.info('[AUTO-UPDATE] Quitting and installing.');
  } else {
    logger$a.info('Restarting Wallets by restartBrowser()');
    // do a simple restart
    electron.app.relaunch();
    setTimeout(() => electron.app.exit(0), 1e3);
  }
}

function getSetting (key) {
  return get$1(key)
}

function getSettings () {
  return getAll()
}

function setSetting (key, value) {
  return set(key, value)
}

function updateAdblocker () {
  return setup$2()
}

async function migrate08to09 () {
  await migrateBookmarksFromSqlite();
}

const SCROLLBAR_WIDTH = 16;
async function capturePage (url, opts = {}) {
  var width = opts.width || 1024;
  var height = opts.height || 768;

  var win = new electron.BrowserWindow({
    width: width + SCROLLBAR_WIDTH,
    height,
    show: false,
    webPreferences: {
      preload: 'file://' + path__default.join(electron.app.getAppPath(), 'fg', 'webview-preload', 'index.build.js'),
      contextIsolation: true,
      webviewTag: false,
      sandbox: true,
      defaultEncoding: 'utf-8',
      nativeWindowOpen: true,
      nodeIntegration: false,
      navigateOnDragDrop: true,
      enableRemoteModule: false
    }
  });
  win.loadURL(url);

  // wait for load
  await new Promise((resolve, reject) => {
    win.webContents.on('did-finish-load', resolve);
  });
  await new Promise(r => setTimeout(r, 200)); // give an extra 200ms for rendering

  // capture the page
  var image = await win.webContents.capturePage({x: 0, y: 0, width, height});

  // resize if asked
  if (opts.resizeTo) {
    image = image.resize(opts.resizeTo);
  }

  return image
}

// rpc methods
// =

function createEventsStream$2 () {
  return emitStream(browserEvents)
}

async function showOpenDialog (opts = {}) {
  var wc = this.sender;
  var res = await electron.dialog.showOpenDialog({
    title: opts.title,
    buttonLabel: opts.buttonLabel,
    filters: opts.filters,
    properties: opts.properties,
    defaultPath: opts.defaultPath
  });
  wc.focus(); // return focus back to the the page
  return res.filePaths
}

function showContextMenu (menuDefinition) {
  var webContents = this.sender;
  var tab = findTab(webContents);
  return new Promise(resolve => {
    var cursorPos = electron.screen.getCursorScreenPoint();

    // add a click item to all menu items
    menuDefinition = massageItems(menuDefinition);
    function massageItems (items) {
      return items.map(item => {
        if (item.id && item.id.startsWith('builtin:')) {
          let id = item.id.slice('builtin:'.length);
          let opts = {webContents, tab, x: cursorPos.x, y: cursorPos.y};
          if (shouldShowMenuItem(id, opts)) {
            return createMenuItem(id, opts)
          }
          return false
        } else if (item.type === 'submenu' && Array.isArray(item.submenu)) {
          item.submenu = massageItems(item.submenu);
        } else if (item.type !== 'separator' && item.id) {
          item.click = clickHandler;
        }
        return item
      }).filter(Boolean)
    }

    // track the selection
    var selection;
    function clickHandler (item) {
      selection = item.id;
    }

    // show the menu
    var win = findWebContentsParentWindow(this.sender);
    var menu = electron.Menu.buildFromTemplate(menuDefinition);
    menu.popup({window: win, callback () {
      resolve(selection);
    }});
  })
}

async function newWindow (state = {}) {
  createShellWindow(state);
}

async function newPane (url, opts = {}) {
  var tab = findTab(this.sender);
  var pane = tab && tab.findPane(this.sender);
  if (tab && pane) {
    if (opts.replaceSameOrigin) {
      let existingPane = tab.findPaneByOrigin(url);
      if (existingPane) {
        existingPane.loadURL(url);
        return
      }
    }
    tab.createPane({url, setActive: true, after: pane, splitDir: opts.splitDir || 'vert'});
  }
}

async function gotoUrl (url) {
  getSenderTab(this.sender).loadURL(url);
}

async function getPageUrl () {
  return getSenderTab(this.sender).url
}

async function refreshPage () {
  getSenderTab(this.sender).webContents.reload();
}

async function focusPage () {
  getSenderTab(this.sender).focus();
}

async function executeJavaScriptInPage (js) {
  return getSenderTab(this.sender).webContents.executeJavaScript(js, true)
    .catch(err => { 
      if (err.toString().includes('Script failed to execute')) {
        throw "Injected script failed to execute"
      }
      throw err
    })
}

async function injectCssInPage (css) {
  return getSenderTab(this.sender).webContents.insertCSS(css)
}

async function uninjectCssInPage (key) {
  return getSenderTab(this.sender).webContents.removeInsertedCSS(key)
}

function openFolder (folderPath) {
  electron.shell.openExternal('file://' + folderPath);
}

async function doWebcontentsCmd (method, wcId, ...args) {
  var wc = electron.webContents.fromId(+wcId);
  if (!wc) throw new Error(`WebContents not found (${wcId})`)
  return wc[method](...args)
}

async function doTest (test) {
}

// internal methods
// =

function getSenderTab (sender) {
  let tab = findTab(sender);
  if (tab) return tab
  var win = findWebContentsParentWindow(sender);
  return getActive(win)
}

function setUpdaterState (state) {
  updaterState = state;
  browserEvents.emit('updater-state-changed', {state});
}

function getAutoUpdaterFeedSettings () {
  return {
    provider: 'github',
    repo: 'beaker',
    owner: 'beakerbrowser',
    vPrefixedTagName: false
  }
}

// run a daily check for new updates
function scheduledAutoUpdate () {
  get$1('auto_update_enabled').then(v => {
    // if auto updates are enabled, run the check
    if (+v === 1) { checkForUpdates(); }

    // schedule next check
    setTimeout(scheduledAutoUpdate, SCHEDULED_AUTO_UPDATE_DELAY);
  });
}

// event handlers
// =

function onUpdateAvailable () {
  logger$a.info('[AUTO-UPDATE] New version available. Downloading...');
  electronUpdater.autoUpdater.downloadUpdate();
  setUpdaterState(UPDATER_STATUS_DOWNLOADING);
}

function onUpdateNotAvailable () {
  logger$a.info('[AUTO-UPDATE] No browser update available.');
  setUpdaterState(UPDATER_STATUS_IDLE);
}

function onUpdateDownloaded () {
  logger$a.info('[AUTO-UPDATE] New browser version downloaded. Ready to install.');
  setUpdaterState(UPDATER_STATUS_DOWNLOADED);
}

function onUpdateError (e) {
  console.error(e);
  logger$a.error(`[AUTO-UPDATE] error: ${e.toString()}`);
  setUpdaterState(UPDATER_STATUS_IDLE);

  var message = (e.toString() || '').split('\n')[0];
  if (message.includes('[object Object]')) {
    message = typeof e.message === 'string' ? e.message : 'Updater failed to contact the server';
  }
  updaterError = {message};
  browserEvents.emit('updater-error', updaterError);
}

function onWebContentsCreated (e, webContents) {
  webContents.on('will-prevent-unload', onWillPreventUnload);
  webContents.on('remote-require', e => {
    // do not allow
    e.preventDefault();
  });
  webContents.on('remote-get-global', e => {
    // do not allow
    e.preventDefault();
  });
}

function onWillPreventUnload (e) {
  var choice = electron.dialog.showMessageBoxSync({
    type: 'question',
    buttons: ['Leave', 'Stay'],
    title: 'Do you want to leave this site?',
    message: 'Changes you made may not be saved.',
    defaultId: 0,
    cancelId: 1
  });
  var leave = (choice === 0);
  if (leave) {
    e.preventDefault();
  }
}

function onCompleted (details) {
  onWebRequestCompleted(details);
  function set (v) {
    resourceContentTypes.set(details.url, Array.isArray(v) ? v[0] : v);
  }
  if (!details.responseHeaders) return
  if ('Content-Type' in details.responseHeaders) {
    set(details.responseHeaders['Content-Type']);
  } else if ('content-type' in details.responseHeaders) {
    set(details.responseHeaders['content-type']);
  }
}

const logger$b = child({category: 'analytics'});

// exported methods
// =

function setup$s () {
  setTimeout(checkin, ms('3s'));
}

// internal methods
// =

async function checkin () {
  // enabled?
  var isEnabled = await get$1('analytics_enabled');
  if (isEnabled == 1) {
    try {
      var pingData = await readPingData();
      if ((Date.now() - (pingData.lastPingTime || 0)) > ANALYTICS_CHECKIN_INTERVAL) {
        await sendPing(pingData);
        pingData.lastPingTime = Date.now();
        await writePingData(pingData);
      }
    } catch (e) {
      // failed, we'll reschedule another ping in 24 hours
    }
  }

  // schedule another ping check in 3 hours
  var to = setTimeout(checkin, ms('3h'));
  to.unref();
}

function sendPing (pingData) {
  return new Promise((resolve, reject) => {
    var qs = querystring.stringify({userId: pingData.id, os: osName(), beakerVersion: electron.app.getVersion()});
    logger$b.info(`Sending ping to ${ANALYTICS_SERVER}: ${qs}`);

    var req = https.request({
      method: 'POST',
      hostname: ANALYTICS_SERVER,
      path: '/ping?' + qs
    }, (res) => {
      if (res.statusCode === 204) {
        logger$b.info('Ping succeeded');
        resolve();
      } else {
        res.setEncoding('utf8');
        res.pipe(concat(body => logger$b.info(`Ping failed: ${res.statusCode} ${JSON.stringify(body)}`)));
        reject();
      }
    });
    req.on('error', err => {
      logger$b.info(`Ping failed: ${err.toString()}`);
      reject();
    });
    req.end();
  })
}

async function readPingData () {
  var data = await jetpack.readAsync(path__default.join(electron.app.getPath('userData'), ANALYTICS_DATA_FILE), 'json');
  return data || {lastPingTime: 0, id: crypto__default.randomBytes(32).toString('hex')}
}

async function writePingData (data) {
  return jetpack.writeAsync(path__default.join(electron.app.getPath('userData'), ANALYTICS_DATA_FILE), data)
}

// exported methods
// =

function setup$t () {
  setTimeout(openPort, ms('3s'));
}

function closePort () {
  var client = natUpnp.createClient();
  client.portUnmapping({public: DAT_SWARM_PORT});
}

// internal methods
// =

async function openPort () {
  var opts = {
    public: DAT_SWARM_PORT,
    private: DAT_SWARM_PORT,
    ttl: 1800  // 30 min
  };

  var client = natUpnp.createClient();
  client.portMapping(opts, async (err) => {
    if (!err) {
      // schedule reopening the port every 30 minutes
      var to = setTimeout(openPort, ms('30m'));
      to.unref();
    } else {
      // assuming errorCode 725 OnlyPermanentLeasesSupported and retry without a TTL
      opts.ttl = '0';  // string not int
      client.portMapping(opts);
    }
  });
}

var dbs = {
  archives,
  auditLog,
  history,
  profileData,
  settings,
  sitedata,
  watchlist
};

var loggerManifest = {
  stream: 'readable',
  query: 'promise',
  listDaemonLog: 'promise',
  listAuditLog: 'promise',
  streamAuditLog: 'readable',
  getAuditLogStats: 'promise',
};

var drivesManifest = {
  get: 'promise',
  list: 'promise',
  getForks: 'promise',
  configure: 'promise',
  remove: 'promise',
  listTrash: 'promise',
  collectTrash: 'promise',
  delete: 'promise',
  touch: 'promise',
  clearFileCache: 'promise',
  clearDnsCache: 'promise',
  createEventStream: 'readable',
  getDebugLog: 'promise',
  createDebugStream: 'readable'
};

var beakerBrowserManifest = {
  createEventsStream: 'readable',
  getInfo: 'promise',
  getDaemonStatus: 'promise',
  getDaemonNetworkStatus: 'promise',
  checkForUpdates: 'promise',
  restartBrowser: 'sync',

  getSettings: 'promise',
  getSetting: 'promise',
  setSetting: 'promise',
  updateAdblocker: 'promise',
  updateSetupState: 'promise',
  migrate08to09: 'promise',
  setStartPageBackgroundImage: 'promise',
  
  getDefaultProtocolSettings: 'promise',
  setAsDefaultProtocolClient: 'promise',
  removeAsDefaultProtocolClient: 'promise',

  listBuiltinFavicons: 'promise',
  getBuiltinFavicon: 'promise',
  uploadFavicon: 'promise',
  imageToIco: 'promise',

  reconnectHyperdriveDaemon: 'promise',

  fetchBody: 'promise',
  downloadURL: 'promise',

  convertDat: 'promise',

  getResourceContentType: 'sync',
  getCertificate: 'promise',

  executeShellWindowCommand: 'promise',
  toggleSiteInfo: 'promise',
  toggleLiveReloading: 'promise',
  setWindowDimensions: 'promise',
  setWindowDragModeEnabled: 'promise',
  moveWindow: 'promise',
  maximizeWindow: 'promise',
  toggleWindowMaximized: 'promise',
  minimizeWindow: 'promise',
  closeWindow: 'promise',
  resizeSiteInfo: 'promise',
  refreshTabState: 'promise',

  spawnAndExecuteJs: 'promise',

  showOpenDialog: 'promise',
  showContextMenu: 'promise',
  showModal: 'promise',
  newWindow: 'promise',
  newPane: 'promise',
  openUrl: 'promise',
  gotoUrl: 'promise',
  getPageUrl: 'promise',
  refreshPage: 'promise',
  focusPage: 'promise',
  executeJavaScriptInPage: 'promise',
  injectCssInPage: 'promise',
  uninjectCssInPage: 'promise',
  openFolder: 'promise',
  doWebcontentsCmd: 'promise',
  doTest: 'promise',
  closeModal: 'sync'
};

var beakerFilesystemManifest = {
  get: 'sync'
};

var bookmarksManifest = {
  list: 'promise',
  get: 'promise',
  add: 'promise',
  remove: 'promise'
};

var datLegacyManifest = {
  list: 'promise',
  remove: 'promise'
};

var downloadsManifest = {
  getDownloads: 'promise',
  pause: 'promise',
  resume: 'promise',
  cancel: 'promise',
  remove: 'promise',
  open: 'promise',
  showInFolder: 'promise',
  createEventsStream: 'readable'
};

var folderSyncManifest = {
  chooseFolderDialog: 'promise',
  syncDialog: 'promise',
  get: 'promise',
  set: 'promise',
  updateIgnoredFiles: 'promise',
  remove: 'promise',
  compare: 'promise',
  restoreFile: 'promise',
  sync: 'readable',
  enableAutoSync: 'promise',
  disableAutoSync: 'promise',
};

var historyManifest = {
  addVisit: 'promise',
  getVisitHistory: 'promise',
  getMostVisited: 'promise',
  search: 'promise',
  removeVisit: 'promise',
  removeAllVisits: 'promise',
  removeVisitsAfter: 'promise'
};

var hyperdebugManifest = {
  listCores: 'promise',
  hasCoreBlocks: 'promise',
  createCoreEventStream: 'readable'
};

var sitedataManifest = {
  get: 'promise',
  set: 'promise',
  getPermissions: 'promise',
  getPermission: 'promise',
  setPermission: 'promise',
  clearPermission: 'promise',
  clearPermissionAllOrigins: 'promise'
};

var watchlistManifest = {
  add: 'promise',
  list: 'promise',
  update: 'promise',
  remove: 'promise',

  // events
  createEventsStream: 'readable'
};

// typedefs
// =

/**
 * @typedef {Object} BeakerFilesystemPublicAPIRootRecord
 * @prop {string} url
 */

// exported api
// =

var beakerFilesystemAPI = {
  /**
   * @returns {BeakerFilesystemPublicAPIRootRecord}
   */
  get () {
    if (!this.sender.getURL().startsWith('wallets:')) {
      throw new beakerErrorConstants.PermissionsError()
    }
    return {
      url: get$e().url
    }
  }
};

// exported api
// =

var datLegacyAPI = {
  async list () {
    return listLegacyArchives()
  },

  async remove (key) {
    return removeLegacyArchive(key)
  }
};

const DEFAULT_IGNORED_FILES = '/index.json\n/.git\n/node_modules\n.DS_Store';
const COMPARE_SIZE_LIMIT = {maxSize: bytes('5mb'), assumeEq: false};

// globals
// =

var activeAutoSyncs = {}; // {[key]: {stopwatch, ignoredFiles}

// exported api
// =

var folderSyncAPI = {
  async chooseFolderDialog (url) {
    var drive = await getDrive$1(url);
    var key = drive.key.toString('hex');
    var current = await get$b(key);
    var res = await electron.dialog.showOpenDialog({
      title: 'Select folder to sync',
      buttonLabel: 'Select Folder',
      defaultPath: current ? current.localPath : undefined,
      properties: ['openDirectory', 'createDirectory']
    });
    if (res.filePaths.length !== 1) return current ? current.localPath : undefined
    if (current) {
      await update$2(key, {
        localPath: res.filePaths[0]
      });
    } else {
      await insert$1(key, {
        localPath: res.filePaths[0],
        ignoredFiles: DEFAULT_IGNORED_FILES
      });
    }
    return res.filePaths[0]
  },

  async syncDialog (url) {
    var drive = await getDrive$1(url);
    var res;
    try {
      res = await create$3(this.sender, 'folder-sync', {url: drive.url});
    } catch (e) {
      if (e.name !== 'Error') {
        throw e // only rethrow if a specific error
      }
    }
    if (!res) throw new beakerErrorConstants.UserDeniedError()
    return res && res.contacts ? res.contacts[0] : undefined
  },

  async get (url) {
    var drive = await getDrive$1(url);
    var key = drive.key.toString('hex');
    var current = await get$b(key);
    if (!current) return
    return {
      localPath: current.localPath,
      ignoredFiles: (current.ignoredFiles || '').split('\n').filter(Boolean),
      isAutoSyncing: (key in activeAutoSyncs)
    }
  },

  async set (url, values) {
    var drive = await getDrive$1(url);
    var key = drive.key.toString('hex');
    var current = await get$b(key);
    if (current) {
      await update$2(key, values);
    } else {
      values.ignoredFiles = values.ignoredFiles || DEFAULT_IGNORED_FILES;
      await insert$1(key, values);
    }
    stopAutosync(key);
  },

  async updateIgnoredFiles (url, files) {
    var drive = await getDrive$1(url);
    var key = drive.key.toString('hex');
    await update$2(key, {
      ignoredFiles: files.join('\n')
    });
    if (activeAutoSyncs[key]) {
      activeAutoSyncs[key].ignoredFiles = files;
    }
  },

  async remove (url) {
    var drive = await getDrive$1(url);
    var key = drive.key.toString('hex');
    await del(key);
    stopAutosync(key);
  },

  async compare (url) {
    var drive = await getDrive$1(url);
    var current = await get$b(drive.key.toString('hex'));
    if (!current || !current.localPath) return []
    return normalizeCompare(await dft.diff(
      current.localPath,
      {fs: drive.session.drive, path: '/'},
      {compareContent: true, sizeLimit: COMPARE_SIZE_LIMIT}
    ))
  },

  async restoreFile (url, filepath) {
    var drive = await getDrive$1(url);
    var current = await get$b(drive.key.toString('hex'));
    if (!current || !current.localPath) throw new Error('No local path set')
    var diff = await dft.diff(
      current.localPath,
      {fs: drive.session.drive, path: '/'},
      {
        compareContent: true,
        sizeLimit: COMPARE_SIZE_LIMIT,
        filter: p => {
          p = normalizePath(p);
          if (filepath === p) return false // direct match
          if (filepath.startsWith(p) && filepath.charAt(p.length) === '/') return false // parent folder
          if (p.startsWith(filepath) && p.charAt(filepath.length) === '/') return false // child file
          return true
        }
      }
    );
    return dft.applyLeft(current.localPath, {fs: drive.session.drive, path: '/'}, diff)
  },

  sync,

  async enableAutoSync (url) {
    var drive = await getDrive$1(url);
    var key = drive.key.toString('hex');
    var current = await get$b(drive.key.toString('hex'));
    if (!current || !current.localPath) return
    stopAutosync(key);
    startAutosync(key, current);
  },

  async disableAutoSync (url) {
    var drive = await getDrive$1(url);
    stopAutosync(drive.key.toString('hex'));
  }
};

// internal methods
// =

async function getDrive$1 (url) {
  var drive = await hyper.drives.getOrLoadDrive(url);
  if (!drive) throw new Error('Unable to load drive')
  if (!drive.writable) throw new Error('Must be a writable drive')
  return drive
}

async function sync (url) {
  var drive = await getDrive$1(url);
  var current = await get$b(drive.key.toString('hex'));
  if (!current || !current.localPath) return
  var diff = await dft.diff(
    current.localPath,
    {fs: drive.session.drive, path: '/'},
    {
      compareContent: true,
      sizeLimit: COMPARE_SIZE_LIMIT,
      filter: createIgnoreFilter(current.ignoredFiles)
    }
  );
  return dft.applyRightStream(current.localPath, {fs: drive.session.drive, path: '/'}, diff)
}

function startAutosync (key, current) {
  var syncDebounced = debounce(sync, 500);
  var ctx = {
    ignoredFiles: current.ignoredFiles.split('\n'),
    stopwatch: watch$1(current.localPath, filename => {
      filename = filename.slice(current.localPath.length);
      if (ctx.ignoredFiles.includes(filename)) return
      syncDebounced(key);
    })
  };
  activeAutoSyncs[key] = ctx;
}

function stopAutosync (key) {
  if (activeAutoSyncs[key]) {
    activeAutoSyncs[key].stopwatch();
    delete activeAutoSyncs[key];
  }
}

function createIgnoreFilter (ignoredFiles) {
  var ignoreRegexes = (ignoredFiles || '').split('\n').filter(Boolean).map(globToRegex);
  if (ignoreRegexes.length === 0) return
  return (filepath) => {
    filepath = normalizePath(filepath);
    for (let re of ignoreRegexes) {
      if (re.test(filepath)) return true
    }
    return false
  }
}

const slashRe = /\\/g;
function normalizePath (path = '') {
  return path.replace(slashRe, '/')
}

function normalizeCompare (compare) {
  for (let c of compare) {
    c.path = normalizePath(c.path);
  }
  return compare
}

// exported api
// =

var historyAPI = {
  async addVisit (...args) {
    return addVisit(0, ...args)
  },

  async getVisitHistory (...args) {
    return getVisitHistory(0, ...args)
  },

  async getMostVisited (...args) {
    return getMostVisited(0, ...args)
  },

  async search (...args) {
    return search(...args)
  },

  async removeVisit (...args) {
    return removeVisit(...args)
  },

  async removeAllVisits (...args) {
    return removeAllVisits()
  },

  async removeVisitsAfter (...args) {
    return removeVisitsAfter(...args)
  }
};

// exported api
// =

var hyperdebugAPI = {  
  async listCores (url) {
    var drive = await hyper.drives.getOrLoadDrive(url);
    return (await drive.session.drive.stats()).stats
  },

  async hasCoreBlocks (key, from, to) {
    var client = hyper.daemon.getHyperspaceClient();
    var core = client.corestore().get({key: typeof key === 'string' ? Buffer.from(key, 'hex') : key});
    var bits = [];
    for (let i = from; i < to; i++) {
      bits.push(await core.has(i));
    }
    return bits
  },

  async createCoreEventStream (url, corename) {
    corename = ['metadata', 'content'].includes('corename') || 'metadata';
    var drive = await hyper.drives.getOrLoadDrive(url);
    var core = drive.session.drive[corename];
    return emitStream(core)
  }
};

// exported api
// =

var watchlistAPI = {
  async add (url, opts) {
    return addSite$1(0, url, opts)
  },

  async list () {
    return getSites$1(0)
  },

  async update (site) {
    return updateWatchlist$1(0, site)
  },

  async remove (url) {
    return removeSite$1(0, url)
  },

  // events
  // =

  createEventsStream () {
    return createEventsStream$1()
  }
};

var capabilitiesManifest = {
  create: 'promise',
  modify: 'promise',
  delete: 'promise'
};

var contactsManifest = {
  requestProfile: 'promise',
  requestContact: 'promise',
  requestContacts: 'promise',
  requestAddContact: 'promise',
  list: 'promise',
  remove: 'promise'
};

var hyperdriveManifest = {
  loadDrive: 'promise',
  createDrive: 'promise',
  forkDrive: 'promise',

  getInfo: 'promise',
  configure: 'promise',
  diff: 'promise',

  stat: 'promise',
  readFile: 'promise',
  writeFile: 'promise',
  unlink: 'promise',
  copy: 'promise',
  rename: 'promise',
  updateMetadata: 'promise',
  deleteMetadata: 'promise',

  readdir: 'promise',
  mkdir: 'promise',
  rmdir: 'promise',

  symlink: 'promise',

  mount: 'promise',
  unmount: 'promise',

  query: 'promise',

  watch: 'readable',
  createNetworkActivityStream: 'readable',

  resolveName: 'promise',

  beakerDiff: 'promise',
  beakerMerge: 'promise',
  importFromFilesystem: 'promise',
  exportToFilesystem: 'promise',
  exportToDrive: 'promise'
};

var markdownManifest = {
  toHTML: 'sync'
};

var panesManifest = {
  createEventStream: 'readable',
  setAttachable: 'sync',
  getAttachedPane: 'sync',
  attachToLastActivePane: 'promise',
  create: 'promise',
  navigate: 'promise',
  focus: 'promise',
  executeJavaScript: 'promise',
  injectCss: 'promise',
  uninjectCss: 'promise'
};

var peersocketsManifest = {
  join: 'duplex',
  watch: 'readable'
};

var shellManifest = {
  drivePropertiesDialog: 'promise',
  selectFileDialog: 'promise',
  saveFileDialog: 'promise',
  selectDriveDialog: 'promise',
  saveDriveDialog: 'promise',
  listDrives: 'promise',
  unsaveDrive: 'promise',
  tagDrive: 'promise',

  // internal
  importFilesAndFolders: 'promise',
  importFilesDialog: 'promise',
  importFoldersDialog: 'promise',
  exportFilesDialog: 'promise'
};

// exported api
// =

var capabilitiesAPI = {
  /**
   * @param {String} target
   * @returns {Promise<String>}
   */
  async create (target) {
    var origin = parseDriveUrl(this.sender.getURL()).origin;
    return createCap(origin, target)
  },

  /**
   * @param {String} capUrl
   * @param {String} target
   * @returns {Promise<Void>}
   */
  async modify (capUrl, target) {
    var origin = parseDriveUrl(this.sender.getURL()).origin;    
    return modifyCap(origin, capUrl, target)
  },

  /**
   * @param {String} capUrl
   * @returns {Promise<Void>}
   */
  async delete (capUrl) {
    var origin = parseDriveUrl(this.sender.getURL()).origin;    
    return deleteCap(origin, capUrl)
  }
};

// typedefs
// =

/**
 * @typedef {Object} BeakerContactPublicAPIContactRecord
 * @prop {string} url
 * @prop {string} title
 * @prop {string} description
 */

// exported api
// =

var contactsAPI = {
  /**
   * @returns {Promise<BeakerContactPublicAPIContactRecord>}
   */
  async requestProfile () {
    var url = await selectDriveDialog.call(this, {tag: 'contact', writable: true});
    let info = await getDriveInfo(url, {ignoreCache: false, onlyCache: true}).catch(e => ({}));
    return {
      url,
      title: info.title || '',
      description: info.description || ''
    }
  },

  /**
   * @returns {Promise<BeakerContactPublicAPIContactRecord>}
   */
  async requestContact () {
    var url = await selectDriveDialog.call(this, {tag: 'contact', writable: false});
    let info = await getDriveInfo(url, {ignoreCache: false, onlyCache: true}).catch(e => ({}));
    return {
      url,
      title: info.title || '',
      description: info.description || ''
    }
  },

  /**
   * @returns {Promise<Array<BeakerContactPublicAPIContactRecord>>}
   */
  async requestContacts () {
    var urls = await selectDriveDialog.call(this, {tag: 'contact', allowMultiple: true, writable: false});
    let infos = await Promise.all(urls.map(url => (
      getDriveInfo(url, {ignoreCache: false, onlyCache: true}).catch(e => ({}))
    )));
    return infos.map(info => ({
      url: info.url,
      title: info.title || '',
      description: info.description || ''
    }))
  },

  /**
   * @param {string} url 
   * @returns {Promise<void>}
   */
  async requestAddContact (url) {
    return saveDriveDialog.call(this, url, {tags: 'contact'})
  },

  /**
   * @returns {Promise<Array<BeakerContactPublicAPIContactRecord>>}
   */
  async list () {
    return listDrives.call(this, {tag: 'contact', writable: false})
  },

  async remove (url) {
    return unsaveDrive.call(this, url)
  }
};

/**
https://github.com/thlorenz/anchor-markdown-header

Copyright 2013 Thorsten Lorenz.
All rights reserved.

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
 */

function basicGithubId (text) {
  return text.replace(/ /g, '-')
    // escape codes
    .replace(/%([abcdef]|\d){2,2}/ig, '')
    // single chars that are removed
    .replace(/[\/?!:\[\]`.,()*"';{}+=<>~\$|#@&–—]/g, '')
    // CJK punctuations that are removed
    .replace(/[。？！，、；：“”【】（）〔〕［］﹃﹄“ ”‘’﹁﹂—…－～《》〈〉「」]/g, '')
}

function getGithubId (text, repetition) {
  text = basicGithubId(text);

  // If no repetition, or if the repetition is 0 then ignore. Otherwise append '-' and the number.
  if (repetition) {
    text += '-' + repetition;
  }

  // Strip emojis
  text = text.replace(emojiRegex(), '');

  return text
}

/**
 * Generates an anchor for the given header and mode.
 *
 * @name anchorMarkdownHeader
 * @function
 * @param header      {String} The header to be anchored.
 * @param repetition  {Number} The nth occurrence of this header text, starting with 0. Not required for the 0th instance.
 * @return            {String} The header anchor id
 */
function anchorMarkdownHeader (header, repetition) {
  var replace;
  var customEncodeURI = encodeURI;

  replace = getGithubId;
  customEncodeURI = function (uri) {
    var newURI = encodeURI(uri);

    // encodeURI replaces the zero width joiner character
    // (used to generate emoji sequences, e.g.Female Construction Worker 👷🏼‍♀️)
    // github doesn't URL encode them, so we replace them after url encoding to preserve the zwj character.
    return newURI.replace(/%E2%80%8D/g, '\u200D')
  };

  function asciiOnlyToLowerCase (input) {
    var result = '';
    for (var i = 0; i < input.length; ++i) {
      if (input[i] >= 'A' && input[i] <= 'Z') {
        result += input[i].toLowerCase();
      } else {
        result += input[i];
      }
    }
    return result
  }

  var href = replace(asciiOnlyToLowerCase(header.trim()), repetition);

  return customEncodeURI(href)
}

function create$4 ({allowHTML, useHeadingIds, useHeadingAnchors, hrefMassager, highlight} = {}) {
  var md = MarkdownIt({
    html: allowHTML, // Enable HTML tags in source
    xhtmlOut: false, // Use '/' to close single tags (<br />)
    breaks: false, // Convert '\n' in paragraphs into <br>
    langPrefix: 'language-', // CSS language prefix for fenced blocks
    linkify: false, // Autoconvert URL-like text to links

    // Enable some language-neutral replacement + quotes beautification
    typographer: true,

    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Set doubles to '«»' for Russian, '„“' for German.
    quotes: '“”‘’',

    // Highlighter function. Should return escaped HTML,
    // or '' if the source string is not changed
    highlight
  });

  if (useHeadingAnchors || useHeadingIds) {
    var numRepetitions = {};
    // heading anchor rendering
    md.renderer.rules.heading_open = function (tokens, idx /*, options, env */) {
      var txt = tokens[idx + 1].content || '';
      numRepetitions[txt] = (numRepetitions[txt]) ? numRepetitions[txt] + 1 : 0;
      return '<' + tokens[idx].tag + ' id="' + anchorMarkdownHeader(txt, numRepetitions[txt]) + '">'
    };
    if (useHeadingAnchors) {
      md.renderer.rules.heading_close = function (tokens, idx /*, options, env */) {
        var txt = tokens[idx - 1].content || '';
        return '<a class="anchor-link" href="#' + anchorMarkdownHeader(txt, numRepetitions[txt]) + '">#</a></' + tokens[idx].tag + '>\n'
      };
    }
  }

  if (hrefMassager) {
    // link modifier
    let orgLinkOpen = md.renderer.rules.link_open;
    md.renderer.rules.link_open = function (tokens, idx, options /* env */) {
      var i = tokens[idx].attrs.findIndex(attr => attr[0] === 'href');
      let href = hrefMassager(tokens[idx].attrs[i][1], 'a');
      if (!href) return ''
      tokens[idx].attrs[i][1] = href;
      if (orgLinkOpen) return orgLinkOpen.apply(null, arguments)
      return md.renderer.renderToken.apply(md.renderer, arguments)
    };
    let orgImage = md.renderer.rules.image;
    md.renderer.rules.image = function (tokens, idx, options /* env */) {
      var i = tokens[idx].attrs.findIndex(attr => attr[0] === 'src');
      let src = hrefMassager(tokens[idx].attrs[i][1], 'img');
      if (!src) return ''
      tokens[idx].attrs[i][1] = src;
      if (orgImage) return orgImage.apply(null, arguments)
      return md.renderer.renderToken.apply(md.renderer, arguments)
    };
  }

  return md
}

const mdNoHTML = create$4({
  allowHTML: false,
  useHeadingIds: false,
  useHeadingAnchors: false,
  hrefMassager: undefined,
  highlight: undefined
});
const mdWithHTML = create$4({
  allowHTML: true,
  useHeadingIds: false,
  useHeadingAnchors: false,
  hrefMassager: undefined,
  highlight: undefined
});

var markdownAPI = {
  toHTML (str, {allowHTML} = {}) {
    if (allowHTML) return mdWithHTML.render(str)
    return mdNoHTML.render(str)
  }
};

var panesAPI = {
  createEventStream () {
    var {tab, senderPane} = getPaneObjects(this.sender);
    return emitStream(senderPane.attachedPaneEvents)
  },

  setAttachable () {
    var {tab, senderPane} = getPaneObjects(this.sender);
    senderPane.wantsAttachedPane = true;
  },
  
  getAttachedPane () {
    var {tab, senderPane} = getPaneObjects(this.sender);
    var attachedPane = senderPane.attachedPane;
    if (!attachedPane) return undefined
    return toPaneResponse(attachedPane)
  },

  async attachToLastActivePane () {
    if (!(await requestPermission('panesAttach', this.sender))) {
      throw new beakerErrorConstants.UserDeniedError()
    }

    var {tab, senderPane} = getPaneObjects(this.sender);

    var attachedPane = senderPane.attachedPane;
    if (attachedPane) {
      return toPaneResponse(attachedPane)
    }

    // try to find a pane that's not our builtin tools or already attached to anything, if possible
    // if not, stick with the candidate
    var candidatePane = tab.getLastActivePane();
    const isUndesirable = pane => /^wallets:\/\/(webterm|editor|explorer)/.test(pane.url) || pane.attachedPane || pane === senderPane;
    if (!candidatePane || isUndesirable(candidatePane)) {
      candidatePane = tab.panes.find(p => !isUndesirable(p));
    }
    if (!candidatePane || candidatePane === senderPane) {
      return undefined
    }

    senderPane.setAttachedPane(candidatePane);
    return toPaneResponse(candidatePane)
  },

  async create (url, opts) {
    if (!(await requestPermission('panesCreate', this.sender))) {
      throw new beakerErrorConstants.UserDeniedError()
    }

    opts = opts && typeof opts === 'object' ? opts : {};
    var {tab, senderPane} = getPaneObjects(this.sender);
    var newPane = tab.createPane({url, setActive: true, splitDir: 'vert', after: tab.activePane});
    if (opts.attach) {
      if (!(await requestPermission('panesAttach', this.sender))) {
        throw new beakerErrorConstants.UserDeniedError()
      }
      senderPane.setAttachedPane(newPane);
      return toPaneResponse(newPane)
    }
  },

  async navigate (paneId, url) {
    var {attachedPane} = getAttachedPaneById(this.sender, paneId);
    if (!url || typeof url !== 'string') throw new Error('Invalid URL')
    await attachedPane.loadURL(url);
  },

  async focus (paneId) {
    var {tab, attachedPane} = getAttachedPaneById(this.sender, paneId);
    tab.setActivePane(attachedPane);
    attachedPane.focus();
  },

  async executeJavaScript (paneId, script) {
    if (!(await requestPermission('panesInject', this.sender))) {
      throw new beakerErrorConstants.UserDeniedError()
    }
    var {attachedPane} = getAttachedPaneById(this.sender, paneId);
    return attachedPane.webContents.executeJavaScript(script)
  },

  async injectCss (paneId, css) {
    if (!(await requestPermission('panesInject', this.sender))) {
      throw new beakerErrorConstants.UserDeniedError()
    }
    var {attachedPane} = getAttachedPaneById(this.sender, paneId);
    return attachedPane.webContents.insertCSS(css)
  },

  async uninjectCss (paneId, cssId) {
    if (!(await requestPermission('panesInject', this.sender))) {
      throw new beakerErrorConstants.UserDeniedError()
    }
    var {attachedPane} = getAttachedPaneById(this.sender, paneId);
    await attachedPane.webContents.removeInsertedCSS(cssId);
  }
};

function getPaneObjects (sender) {
  var tab = findTab(sender);
  if (!tab) throw new Error('Requesting pane not active')
  var senderPane = tab.findPane(sender);
  if (!senderPane) throw new Error('Requesting pane not active')
  return {tab, senderPane}
}

function getAttachedPaneById (sender, paneId) {
  var {tab, senderPane} = getPaneObjects(sender);
  if (!senderPane.attachedPane || senderPane.attachedPane.id !== paneId) {
    throw new beakerErrorConstants.PermissionsError('Can only managed the attached pane')
  }
  var attachedPane = senderPane.attachedPane;
  return {tab, senderPane, attachedPane}
}

function toPaneResponse (pane) {
  return {
    id: pane.id,
    url: pane.url || pane.loadingURL
  }
}

const sessionAliases = new Map();

// exported api
// =

var peersocketsAPI = {
  async join (topic) {
    var drive = await getSenderDrive(this.sender);
    topic = massageTopic(topic, drive.discoveryKey);
    const aliases = getAliases(this.sender);

    var stream = new streamx.Duplex({
      write (data, cb) {
        if (!Array.isArray(data) || typeof data[0] === 'undefined' || typeof data[1] === 'undefined') {
          console.debug('Incorrectly formed message from peersockets send API', data);
          return cb(null)
        }
        const peer = getPeerForAlias(aliases, data[0]);
        if (!peer) return
        topicHandle.send(data[1], peer);
        cb(null);
      }
    });
    stream.objectMode = true;
    var topicHandle = getClient().peersockets.join(topic, {
      onmessage (message, peer) {
        stream.push(['message', {peerId: createAliasForPeer(aliases, peer), message}]);
      }
    });
    drive.pda.numActiveStreams++;
    stream.on('close', () => {
      drive.pda.numActiveStreams--;
      releaseAliases(this.sender, aliases);
      topicHandle.close();
    });

    return stream
  },

  async watch () {
    var drive = await getSenderDrive(this.sender);
    const aliases = getAliases(this.sender);
    var stream = new streamx.Readable();
    var stopwatch = getClient().peers.watchPeers(drive.key, {
      onjoin: async (peer) => stream.push(['join', {peerId: createAliasForPeer(aliases, peer)}]),
      onleave: (peer) => stream.push(['leave', {peerId: createAliasForPeer(aliases, peer) }])
    });
    stream.on('close', () => {
      releaseAliases(this.sender, aliases);
      stopwatch();
    });
    return stream
  }
};

// internal methods
// =

async function getSenderDrive (sender) {
  var url = sender.getURL();
  if (!url.startsWith('hyper://')) {
    throw new beakerErrorConstants.PermissionsError('PeerSockets are only available on hyper:// origins')
  }
  return getOrLoadDrive(url)
}

function massageTopic (topic, discoveryKey) {
  return `webapp/${discoveryKey.toString('hex')}/${topic}`
}

function getAliases (sender) {
  let aliases = sessionAliases.get(sender);
  if (!aliases) {
    aliases = {refs: 0, byPeer: new Map(), byAlias: []};
    sessionAliases.set(sender, aliases);
  }
  aliases.refs++;
  return aliases
}

function releaseAliases (sender, aliases) {
  if (!--aliases.refs) sessionAliases.delete(sender);
}

function createAliasForPeer (aliases, peer) {
  let alias = aliases.byPeer.get(peer);
  if (alias) return alias
  alias = aliases.byPeer.size + 1;
  aliases.byPeer.set(peer, alias);
  aliases.byAlias[alias] = peer;
  return alias
}

function getPeerForAlias (aliases, alias) {
  return aliases.byAlias[alias]
}

var experimentalCapturePageManifest = {
  capturePage: 'promise'
};

var experimentalDatPeersManifest = {
  list: 'promise',
  get: 'promise',
  broadcast: 'promise',
  send: 'promise',
  getSessionData: 'promise',
  setSessionData: 'promise',
  getOwnPeerId: 'promise',
  createEventStream: 'readable'
};

var experimentalGlobalFetchManifest = {
  fetch: 'promise'
};

// constants
// =

const API_DOCS_URL = 'https://beakerbrowser.com/docs/apis/experimental-capturepage.html';
const API_PERM_ID = 'experimentalCapturePage';
const LAB_API_ID = 'capturePage';

// exported api
// =

var experimentalCapturePageAPI = {
  async capturePage (url$1, opts = {}) {
    // validate inputs
    if (!url$1 && typeof url$1 !== 'string') {
      throw new Error('The first argument must be a URL string')
    }
    if (opts && typeof opts !== 'object') {
      throw new Error('The second argument must be an options object')
    }
    if (opts) {
      if ('width' in opts) {
        if (typeof opts.width !== 'number') throw new Error('The width option must be a number')
        if (opts.width <= 0 || opts.width > 1600) throw new Error('The width option must between 1 and 1600')
      }
      if ('height' in opts) {
        if (typeof opts.height !== 'number') throw new Error('The height option must be a number')
        if (opts.height <= 0 || opts.height > 1200) throw new Error('The height option must between 1 and 1200')
      }
      if ('resizeTo' in opts) {
        if (typeof opts.resizeTo !== 'object') throw new Error('The resizeTo option must be an object')
        if ('width' in opts.resizeTo) {
          if (typeof opts.resizeTo.width !== 'number') throw new Error('The resizeTo.width option must be a number')
          if (opts.resizeTo.width <= 0 || opts.resizeTo.width > 1600) throw new Error('The resizeTo.width option must between 1 and 1600')
        }
        if ('height' in opts.resizeTo) {
          if (typeof opts.resizeTo.height !== 'number') throw new Error('The resizeTo.height option must be a number')
          if (opts.resizeTo.height <= 0 || opts.resizeTo.height > 1200) throw new Error('The resizeTo.height option must between 1 and 1200')
        }
      }
    }

    // parse url
    var urlp;
    try { urlp = new url.URL(url$1); }
    catch (e) { throw new Error('The first argument must be a URL string') }

    if (['http:', 'https:', 'hyper:'].indexOf(urlp.protocol) === -1) {
      throw new Error('Can only capture pages served over http, https, or hyper')
    }

    // check perms
    await checkLabsPerm({
      perm: API_PERM_ID + ':' + url$1,
      labApi: LAB_API_ID,
      apiDocsUrl: API_DOCS_URL,
      sender: this.sender
    });

    // run method
    var img = await capturePage(url$1, opts);
    return img.toPNG()
  }
};

// constants
// =

const API_DOCS_URL$1 = 'https://beakerbrowser.com/docs/apis/experimental-datpeers.html';
const API_PERM_ID$1 = 'experimentalDatPeers';
const LAB_API_ID$1 = 'datPeers';
const LAB_PERMS_OBJ = {perm: API_PERM_ID$1, labApi: LAB_API_ID$1, apiDocsUrl: API_DOCS_URL$1};

// exported api
// =

var experimentalDatPeersAPI = {
  async list () {
    await checkLabsPerm(Object.assign({sender: this.sender}, LAB_PERMS_OBJ));
    var drive = await getSenderDrive$1(this.sender);
    // TODO return drives.getDaemon().ext_listPeers(drive.key.toString('hex'))
  },

  async get (peerId) {
    await checkLabsPerm(Object.assign({sender: this.sender}, LAB_PERMS_OBJ));
    var drive = await getSenderDrive$1(this.sender);
    // TODO return drives.getDaemon().ext_getPeer(drive.key.toString('hex'), peerId)
  },

  async broadcast (data) {
    await checkLabsPerm(Object.assign({sender: this.sender}, LAB_PERMS_OBJ));
    var drive = await getSenderDrive$1(this.sender);
    // TODO return drives.getDaemon().ext_broadcastEphemeralMessage(drive.key.toString('hex'), data)
  },

  async send (peerId, data) {
    await checkLabsPerm(Object.assign({sender: this.sender}, LAB_PERMS_OBJ));
    var drive = await getSenderDrive$1(this.sender);
    // TODO return drives.getDaemon().ext_sendEphemeralMessage(drive.key.toString('hex'), peerId, data)
  },

  async getSessionData () {
    await checkLabsPerm(Object.assign({sender: this.sender}, LAB_PERMS_OBJ));
    var drive = await getSenderDrive$1(this.sender);
    // TODO return drives.getDaemon().ext_getSessionData(drive.key.toString('hex'))
  },

  async setSessionData (sessionData) {
    await checkLabsPerm(Object.assign({sender: this.sender}, LAB_PERMS_OBJ));
    var drive = await getSenderDrive$1(this.sender);
    // TODO return drives.getDaemon().ext_setSessionData(drive.key.toString('hex'), sessionData)
  },

  async createEventStream () {
    await checkLabsPerm(Object.assign({sender: this.sender}, LAB_PERMS_OBJ));
    var drive = await getSenderDrive$1(this.sender);
    // TODO return drives.getDaemon().ext_createDatPeersStream(drive.key.toString('hex'))
  },

  async getOwnPeerId () {
    await checkLabsPerm(Object.assign({sender: this.sender}, LAB_PERMS_OBJ));
    // TODO return drives.getDaemon().ext_getOwnPeerId()
  }
};

// internal methods
// =

async function getSenderDrive$1 (sender) {
  var url = sender.getURL();
  if (!url.startsWith('hyper:')) {
    throw new beakerErrorConstants.PermissionsError('Only hyper:// sites can use the datPeers API')
  }
  var urlp = parseDriveUrl(url);
  if (!HYPERDRIVE_HASH_REGEX.test(urlp.host)) {
    urlp.host = await resolveName(url);
  }
  return getDrive(urlp.host)
}

// constants
// =

const API_DOCS_URL$2 = 'https://beakerbrowser.com/docs/apis/experimental-globalfetch.html';
const API_PERM_ID$2 = 'experimentalGlobalFetch';
const LAB_API_ID$2 = 'globalFetch';

// exported api
// =

var experimentalGlobalFetchAPI = {
  async fetch (reqOptions, reqBody) {
    // parse url
    var urlp = new url.URL(reqOptions.url);
    reqOptions.protocol = urlp.protocol;
    reqOptions.host = urlp.host;
    reqOptions.path = urlp.pathname + urlp.search + urlp.hash;

    // check perms
    await checkLabsPerm({
      perm: API_PERM_ID$2 + ':' + reqOptions.protocol + '//' + reqOptions.host,
      labApi: LAB_API_ID$2,
      apiDocsUrl: API_DOCS_URL$2,
      sender: this.sender
    });

    if (reqOptions.protocol !== 'https:' && reqOptions.protocol !== 'http:') {
      throw new Error('Can only send requests to http or https URLs')
    }

    return new Promise((resolve, reject) => {
      // start request
      var proto = urlp.protocol === 'https:' ? https : http$1;
      var reqStream = proto.request(reqOptions, resStream => {
        resStream.pipe(concat(resStream, resBody => {
          // resolve with response
          resolve({
            status: resStream.statusCode,
            statusText: resStream.statusMessage,
            headers: resStream.headers,
            body: resBody
          });
        }));

        // handle errors
        resStream.on('error', err => {
          reject(new Error('Network request failed'));
        });
        resStream.on('abort', err => {
          reject(new Error('Aborted'));
        });
      });

      // send data
      if (reqBody) {
        reqStream.send(reqBody);
      }

      reqStream.end();
    })
  }
};

const INTERNAL_ORIGIN_REGEX = /^(wallets:)/i;
const SITE_ORIGIN_REGEX = /^(wallets:|hyper:|https?:|data:)/i;
const IFRAME_WHITELIST = [
  'hyperdrive.loadDrive',
  'hyperdrive.getInfo',
  'hyperdrive.diff',
  'hyperdrive.stat',
  'hyperdrive.readFile',
  'hyperdrive.readdir',
  'hyperdrive.query',
  'hyperdrive.watch',
  'hyperdrive.resolveName'
];

// exported api
// =

const setup$u = function () {
  // internal apis
  rpc.exportAPI('logger', loggerManifest, Object.assign({}, WEBAPI$3, WEBAPI), internalOnly);
  rpc.exportAPI('beaker-browser', beakerBrowserManifest, WEBAPI$4, internalOnly);
  rpc.exportAPI('beaker-filesystem', beakerFilesystemManifest, beakerFilesystemAPI, internalOnly);
  rpc.exportAPI('bookmarks', bookmarksManifest, bookmarksAPI, internalOnly);
  rpc.exportAPI('dat-legacy', datLegacyManifest, datLegacyAPI, internalOnly);
  rpc.exportAPI('downloads', downloadsManifest, WEBAPI$2, internalOnly);
  rpc.exportAPI('drives', drivesManifest, drivesAPI, internalOnly);
  rpc.exportAPI('folder-sync', folderSyncManifest, folderSyncAPI, internalOnly);
  rpc.exportAPI('history', historyManifest, historyAPI, internalOnly);
  rpc.exportAPI('hyperdebug', hyperdebugManifest, hyperdebugAPI, internalOnly);
  rpc.exportAPI('sitedata', sitedataManifest, WEBAPI$1, internalOnly);
  rpc.exportAPI('watchlist', watchlistManifest, watchlistAPI, internalOnly);

  // external apis
  rpc.exportAPI('capabilities', capabilitiesManifest, capabilitiesAPI, secureOnly('capabilities'));
  rpc.exportAPI('contacts', contactsManifest, contactsAPI, secureOnly('contacts'));
  rpc.exportAPI('hyperdrive', hyperdriveManifest, hyperdriveAPI, secureOnly('hyperdrive'));
  rpc.exportAPI('markdown', markdownManifest, markdownAPI);
  rpc.exportAPI('panes', panesManifest, panesAPI, secureOnly('panes'));
  rpc.exportAPI('peersockets', peersocketsManifest, peersocketsAPI, secureOnly('peersockets'));
  rpc.exportAPI('shell', shellManifest, shellAPI, secureOnly('shell'));

  // experimental apis
  rpc.exportAPI('experimental-capture-page', experimentalCapturePageManifest, experimentalCapturePageAPI, secureOnly);
  rpc.exportAPI('experimental-dat-peers', experimentalDatPeersManifest, experimentalDatPeersAPI, secureOnly);
  rpc.exportAPI('experimental-global-fetch', experimentalGlobalFetchManifest, experimentalGlobalFetchAPI, secureOnly);
};

function internalOnly (event, methodName, args) {
  if (!(event && event.sender)) {
    return false
  }
  var senderInfo = getSenderInfo(event);
  return senderInfo.isMainFrame && INTERNAL_ORIGIN_REGEX.test(senderInfo.url)
}

const secureOnly = apiName => (event, methodName, args) => {
  if (!(event && event.sender)) {
    return false
  }
  var senderInfo = getSenderInfo(event);
  if (!SITE_ORIGIN_REGEX.test(senderInfo.url)) {
    return false
  }
  if (!senderInfo.isMainFrame) {
    return IFRAME_WHITELIST.includes(`${apiName}.${methodName}`)
  }
  return true
};

function getSenderInfo (event) {
  var tab = findTab(event.sender);
  if (tab) return tab.getIPCSenderInfo(event)
  return {isMainFrame: true, url: event.sender.getURL()}
}

// globals
// =

var initWindow;

// exported api
// =

function open$2 ({isShutdown} = {isShutdown: false}) {
  initWindow = new electron.BrowserWindow({
    autoHideMenuBar: true,
    fullscreenable: false,
    resizable: false,
    fullscreenWindowTitle: true,
    frame: false,
    width: 400,
    height: 300,
    backgroundColor: '#fff',
    webPreferences: {
      preload: path.join(__dirname, 'fg', 'webview-preload', 'index.build.js'),
      defaultEncoding: 'utf-8',
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: false,
      sandbox: true,
      webSecurity: true,
      enableRemoteModule: false,
      allowRunningInsecureContent: false
    },
    icon: ICON_PATH,
    show: true
  });
  initWindow.loadURL(`wallets://init/${isShutdown ? 'shutdown.html' : ''}`);
}

function close$3 () {
  if (initWindow) {
    initWindow.close();
    initWindow = undefined;
  }
}

const IS_MAC = process.platform === 'darwin';

// globals
// =

var tray;

// exported api
// =

function setup$v () {
  tray = new electron.Tray(path__default.join(__dirname, getIcon()));
  tray.setToolTip('Wallets Browser');
  tray.on('click', e => tray.popupContextMenu());
  on('set:run_background', buildMenu);
  electron.nativeTheme.on('updated', updateIcon);
  buildMenu();
}

// internal
// =

function getIcon () {
  if (IS_MAC) {
    return electron.nativeTheme.shouldUseDarkColors ? 'assets/img/tray-icon-white.png' : 'assets/img/tray-icon-black.png'
  }
  return 'assets/img/tray-icon-white@2x.png'
}

function updateIcon () {
  tray.setImage(path__default.join(__dirname, getIcon()));
}

async function buildMenu () {
  var runBackground = !!(await get$1('run_background'));
  const contextMenu = electron.Menu.buildFromTemplate([
    {label: 'Open new tab', click: onClickOpen},
    {label: 'Restore last window', click: onClickRestore},
    {type: 'separator'},
    {type: 'checkbox', label: 'Let Wallets run in the background', checked: runBackground, click: () => onTogglePersist(!runBackground)},
    {label: 'Quit Wallets', click: () => electron.app.quit()}
  ]);
  tray.setContextMenu(contextMenu);
}

function onClickOpen () {
  var win = electron.BrowserWindow.getAllWindows()[0];
  if (win) {
    win.show();
    create$2(win, undefined, {setActive: true});
  } else {
    createShellWindow();
  }
}

function onClickRestore () {
  restoreLastShellWindow();
}

function onTogglePersist (v) {
  set('run_background', v ? 1 : 0);
}

// config default mimetype
mime.default_type = 'text/plain';
const TEXT_TYPE_RE = /^text\/|^application\/(javascript|json)/;

// typedefs
// =

/**
 * @typedef {import('stream').Transform} Transform
 */

// exported api
// =

/**
 * @param {string} name
 * @param {Buffer} [chunk]
 * @returns {string}
 */
function identify (name, chunk) {
  // try to identify the type by the chunk contents
  var mimeType;
  var identifiedExt = (chunk) ? identifyFiletype(chunk) : false;
  if (identifiedExt === 'html') identifiedExt = false; // HACK- never let HTML be determined by file content -prf
  if (identifiedExt) { mimeType = mime.lookup(identifiedExt, 'text/plain'); }
  if (!mimeType) {
    // fallback to using the entry name
    if (name.endsWith('.goto')) {
      mimeType = 'application/goto'; // this one's a little new
    } else {
      mimeType = mime.lookup(name, 'text/plain');
    }
  }
  mimeType = correctSomeMimeTypes(mimeType, name);

  // hackish fix
  // the svg test can be a bit aggressive: html pages with
  // inline svgs can be falsely interpretted as svgs
  // double check that
  if (identifiedExt === 'svg' && mime.lookup(name) === 'text/html') {
    return 'text/html; charset=utf8'
  }

  // assume utf-8 for text types
  if (TEXT_TYPE_RE.test(mimeType)) {
    mimeType += '; charset=utf8';
  }

  return mimeType
}

/**
 * For a given HTTP accept header, is HTML wanted?
 * @param {string | undefined} accept
 * @returns {boolean}
 */
function acceptHeaderWantsHTML (accept) {
  var parts = (accept || '').split(',');
  return parts.includes('text/html')
}

/**
 * @param {string} mimeType 
 * @param {string} name 
 * @returns {string}
 */
function correctSomeMimeTypes (mimeType, name) {
  if (mimeType === 'video/quicktime' && name.endsWith('.mov')) {
    return 'video/mp4'
  }
  return mimeType
}

// constants
// =

// content security policies
const WALLETS_CSP = `
  default-src 'self' wallets:;
  img-src wallets: asset: data: blob: hyper: http: https;
  script-src 'self' wallets: 'unsafe-eval';
  media-src 'self' wallets: hyper:;
  style-src 'self' 'unsafe-inline' wallets:;
  child-src 'self';
`.replace(/\n/g, '');
const WALLETS_APP_CSP = `
  default-src 'self' wallets:;
  img-src wallets: asset: data: blob: hyper: http: https;
  script-src 'self' wallets: hyper: 'unsafe-eval';
  media-src 'self' wallets: hyper:;
  style-src 'self' 'unsafe-inline' wallets:;
  child-src 'self' hyper:;
`.replace(/\n/g, '');
const SIDEBAR_CSP = `
default-src 'self' wallets:;
img-src wallets: asset: data: blob: hyper: http: https;
script-src 'self' wallets: hyper: blob: 'unsafe-eval';
media-src 'self' wallets: hyper:;
style-src 'self' 'unsafe-inline' wallets:;
child-src 'self' wallets:;
`.replace(/\n/g, '');

// exported api
// =

function register (protocol) {
  // setup the protocol handler
  protocol.registerStreamProtocol('wallets', walletsProtocol);
}

// internal methods
// =

async function walletsProtocol (request, respond) {
  var cb = once$2((statusCode, status, contentType, path, CSP) => {
    const headers = {
      'Cache-Control': 'no-cache',
      'Content-Type': (contentType || 'text/html; charset=utf-8'),
      'Content-Security-Policy': CSP || WALLETS_CSP,
      'Access-Control-Allow-Origin': '*'
    };
    if (typeof path === 'string') {
      respond({statusCode, headers, data: fs__default.createReadStream(path)});
    } else if (typeof path === 'function') {
      respond({statusCode, headers, data: intoStream$2(path())});
    } else {
      respond({statusCode, headers, data: intoStream$2(errorPage(statusCode + ' ' + status))});
    }
  });
  async function serveICO (path, size = 16) {
    // read the file
    const data = await jetpack.readAsync(path, 'buffer');

    // parse the ICO to get the 16x16
    const images = await ICO.parse(data, 'image/png');
    let image = images[0];
    for (let i = 1; i < images.length; i++) {
      if (Math.abs(images[i].width - size) < Math.abs(image.width - size)) {
        image = images[i];
      }
    }

    // serve
    cb(200, 'OK', 'image/png', () => Buffer.from(image.buffer));
  }

  var requestUrl = request.url;
  var queryParams;
  {
    // strip off the hash
    let i = requestUrl.indexOf('#');
    if (i !== -1) requestUrl = requestUrl.slice(0, i);
  }
  {
    // get the query params
    queryParams = url__default.parse(requestUrl, true).query;

    // strip off the query
    let i = requestUrl.indexOf('?');
    if (i !== -1) requestUrl = requestUrl.slice(0, i);
  }

  // redirects from old pages
  if (requestUrl.startsWith('wallets://start/')) {
    return cb(200, 'OK', 'text/html', () => `<!doctype html><meta http-equiv="refresh" content="0; url=wallets://desktop/">`)
  }

  // browser ui
  if (requestUrl === 'wallets://shell-window/') {
    return cb(200, 'OK', 'text/html; charset=utf-8', path__default.join(__dirname, 'fg', 'shell-window', 'index.html'))
  }
  if (requestUrl === 'wallets://shell-window/main.js') {
    return cb(200, 'OK', 'application/javascript; charset=utf-8', path__default.join(__dirname, 'fg', 'shell-window', 'index.build.js'))
  }
  if (requestUrl === 'wallets://location-bar/') {
    return cb(200, 'OK', 'text/html; charset=utf-8', path__default.join(__dirname, 'fg', 'location-bar', 'index.html'))
  }
  if (requestUrl === 'wallets://shell-menus/') {
    return cb(200, 'OK', 'text/html; charset=utf-8', path__default.join(__dirname, 'fg', 'shell-menus', 'index.html'))
  }
  if (requestUrl === 'wallets://prompts/') {
    return cb(200, 'OK', 'text/html; charset=utf-8', path__default.join(__dirname, 'fg', 'prompts', 'index.html'))
  }
  if (requestUrl === 'wallets://perm-prompt/') {
    return cb(200, 'OK', 'text/html; charset=utf-8', path__default.join(__dirname, 'fg', 'perm-prompt', 'index.html'))
  }
  if (requestUrl === 'wallets://modals/') {
    return cb(200, 'OK', 'text/html; charset=utf-8', path__default.join(__dirname, 'fg', 'modals', 'index.html'))
  }
  if (requestUrl === 'wallets://assets/syntax-highlight.js') {
    return cb(200, 'OK', 'application/javascript; charset=utf-8', path__default.join(__dirname, 'assets/js/syntax-highlight.js'))
  }
  if (requestUrl === 'wallets://assets/syntax-highlight.css') {
    return cb(200, 'OK', 'text/css; charset=utf-8', path__default.join(__dirname, 'assets/css/syntax-highlight.css'))
  }
  if (requestUrl === 'wallets://assets/font-awesome.css') {
    return cb(200, 'OK', 'text/css; charset=utf-8', path__default.join(__dirname, 'assets/css/fa-all.min.css'))
  }
  if (requestUrl === 'wallets://assets/webfonts/fa-regular-400.woff2') {
    return cb(200, 'OK', 'text/css; charset=utf-8', path__default.join(__dirname, 'assets/fonts/fa-regular-400.woff2'))
  }
  if (requestUrl === 'wallets://assets/webfonts/fa-regular-400.woff') {
    return cb(200, 'OK', 'text/css; charset=utf-8', path__default.join(__dirname, 'assets/fonts/fa-regular-400.woff'))
  }
  if (requestUrl === 'wallets://assets/webfonts/fa-regular-400.svg') {
    return cb(200, 'OK', 'text/css; charset=utf-8', path__default.join(__dirname, 'assets/fonts/fa-regular-400.svg'))
  }
  if (requestUrl === 'wallets://assets/webfonts/fa-solid-900.woff2') {
    return cb(200, 'OK', 'text/css; charset=utf-8', path__default.join(__dirname, 'assets/fonts/fa-solid-900.woff2'))
  }
  if (requestUrl === 'wallets://assets/webfonts/fa-solid-900.woff') {
    return cb(200, 'OK', 'text/css; charset=utf-8', path__default.join(__dirname, 'assets/fonts/fa-solid-900.woff'))
  }
  if (requestUrl === 'wallets://assets/webfonts/fa-solid-900.svg') {
    return cb(200, 'OK', 'text/css; charset=utf-8', path__default.join(__dirname, 'assets/fonts/fa-solid-900.svg'))
  }
  if (requestUrl === 'wallets://assets/webfonts/fa-brands-400.woff2') {
    return cb(200, 'OK', 'text/css; charset=utf-8', path__default.join(__dirname, 'assets/fonts/fa-brands-400.woff2'))
  }
  if (requestUrl === 'wallets://assets/webfonts/fa-brands-400.woff') {
    return cb(200, 'OK', 'text/css; charset=utf-8', path__default.join(__dirname, 'assets/fonts/fa-brands-400.woff'))
  }
  if (requestUrl === 'wallets://assets/webfonts/fa-brands-400.svg') {
    return cb(200, 'OK', 'text/css; charset=utf-8', path__default.join(__dirname, 'assets/fonts/fa-brands-400.svg'))
  }
  if (requestUrl === 'wallets://assets/font-photon-entypo') {
    return cb(200, 'OK', 'application/font-woff', path__default.join(__dirname, 'assets/fonts/photon-entypo.woff'))
  }
  if (requestUrl === 'wallets://assets/font-source-sans-pro') {
    return cb(200, 'OK', 'application/font-woff2', path__default.join(__dirname, 'assets/fonts/source-sans-pro.woff2'))
  }
  if (requestUrl === 'wallets://assets/font-source-sans-pro-le') {
    return cb(200, 'OK', 'application/font-woff2', path__default.join(__dirname, 'assets/fonts/source-sans-pro-le.woff2'))
  }
  if (requestUrl === 'wallets://assets/logo-black.svg') {
    return cb(200, 'OK', 'image/svg+xml', path__default.join(__dirname, 'assets/img/logo-black.svg'))
  }
  if (requestUrl === 'wallets://assets/spinner.gif') {
    return cb(200, 'OK', 'image/gif', path__default.join(__dirname, 'assets/img/spinner.gif'))
  }
  if (requestUrl.startsWith('wallets://assets/logo2')) {
    return cb(200, 'OK', 'image/png', path__default.join(__dirname, 'assets/img/logo2.png'))
  }
  if (requestUrl.startsWith('wallets://assets/logo')) {
    return cb(200, 'OK', 'image/png', path__default.join(__dirname, 'assets/img/logo.png'))
  }
  if (requestUrl.startsWith('wallets://assets/default-user-thumb')) {
    return cb(200, 'OK', 'image/jpeg', path__default.join(__dirname, 'assets/img/default-user-thumb.jpg'))
  }
  if (requestUrl.startsWith('wallets://assets/default-thumb')) {
    return cb(200, 'OK', 'image/jpeg', path__default.join(__dirname, 'assets/img/default-thumb.jpg'))
  }
  if (requestUrl.startsWith('wallets://assets/default-frontend-thumb')) {
    return cb(200, 'OK', 'image/jpeg', path__default.join(__dirname, 'assets/img/default-frontend-thumb.jpg'))
  }
  if (requestUrl.startsWith('wallets://assets/search-icon-large')) {
    return cb(200, 'OK', 'image/jpeg', path__default.join(__dirname, 'assets/img/search-icon-large.png'))
  }
  if (requestUrl.startsWith('wallets://assets/favicons/')) {
    return serveICO(path__default.join(__dirname, 'assets/favicons', requestUrl.slice('wallets://assets/favicons/'.length)))
  }
  if (requestUrl.startsWith('wallets://assets/search-engines/')) {
    return cb(200, 'OK', 'image/png', path__default.join(__dirname, 'assets/img/search-engines', requestUrl.slice('wallets://assets/search-engines/'.length)))
  }
  if (requestUrl.startsWith('wallets://assets/img/templates/')) {
    let imgPath = requestUrl.slice('wallets://assets/img/templates/'.length);
    return cb(200, 'OK', 'image/png', path__default.join(__dirname, `assets/img/templates/${imgPath}`))
  }
  if (requestUrl.startsWith('wallets://assets/img/frontends/')) {
    let imgPath = requestUrl.slice('wallets://assets/img/frontends/'.length);
    return cb(200, 'OK', 'image/png', path__default.join(__dirname, `assets/img/frontends/${imgPath}`))
  }
  if (requestUrl.startsWith('wallets://assets/img/drive-types/')) {
    let imgPath = requestUrl.slice('wallets://assets/img/drive-types/'.length);
    return cb(200, 'OK', 'image/png', path__default.join(__dirname, `assets/img/drive-types/${imgPath}`))
  }

  // userland
  if (requestUrl === 'wallets://app-stdlib' || requestUrl.startsWith('wallets://app-stdlib/')) {
    return serveAppAsset(requestUrl, path__default.join(__dirname, 'userland', 'app-stdlib'), cb)
  }
  if (requestUrl === 'wallets://diff' || requestUrl.startsWith('wallets://diff/')) {
    return serveAppAsset(requestUrl, path__default.join(__dirname, 'userland', 'diff'), cb)
  }
  if (requestUrl === 'wallets://library' || requestUrl.startsWith('wallets://library/')) {
    return serveAppAsset(requestUrl, path__default.join(__dirname, 'userland', 'library'), cb, {fallbackToIndexHTML: true})
  }
  if (requestUrl === 'wallets://drive-view' || requestUrl.startsWith('wallets://drive-view/')) {
    return serveAppAsset(requestUrl, path__default.join(__dirname, 'userland', 'drive-view'), cb)
  }
  if (requestUrl === 'wallets://cmd-pkg' || requestUrl.startsWith('wallets://cmd-pkg/')) {
    return serveAppAsset(requestUrl, path__default.join(__dirname, 'userland', 'cmd-pkg'), cb)
  }
  if (requestUrl === 'wallets://site-info' || requestUrl.startsWith('wallets://site-info/')) {
    return serveAppAsset(requestUrl, path__default.join(__dirname, 'userland', 'site-info'), cb, {fallbackToIndexHTML: true})
  }
  if (requestUrl === 'wallets://setup' || requestUrl.startsWith('wallets://setup/')) {
    return serveAppAsset(requestUrl, path__default.join(__dirname, 'userland', 'setup'), cb, {fallbackToIndexHTML: true})
  }
  if (requestUrl === 'wallets://init' || requestUrl.startsWith('wallets://init/')) {
    return serveAppAsset(requestUrl, path__default.join(__dirname, 'userland', 'init'), cb, {fallbackToIndexHTML: true})
  }
  if (requestUrl === 'wallets://editor' || requestUrl.startsWith('wallets://editor/')) {
    return serveAppAsset(requestUrl, path__default.join(__dirname, 'userland', 'editor'), cb)
  }
  if (requestUrl === 'wallets://explorer' || requestUrl.startsWith('wallets://explorer/')) {
    return serveAppAsset(requestUrl, path__default.join(__dirname, 'userland', 'explorer'), cb, {fallbackToIndexHTML: true})
  }
  if (requestUrl === 'wallets://hypercore-tools' || requestUrl.startsWith('wallets://hypercore-tools/')) {
    return serveAppAsset(requestUrl, path__default.join(__dirname, 'userland', 'hypercore-tools'), cb, {fallbackToIndexHTML: true})
  }
  if (requestUrl === 'wallets://webterm' || requestUrl.startsWith('wallets://webterm/')) {
    return serveAppAsset(requestUrl, path__default.join(__dirname, 'userland', 'webterm'), cb, {
      fallbackToIndexHTML: true,
      CSP: SIDEBAR_CSP
    })
  }
  if (requestUrl === 'wallets://desktop' || requestUrl.startsWith('wallets://desktop/')) {
    return serveAppAsset(requestUrl, path__default.join(__dirname, 'userland', 'desktop'), cb, {
      CSP: WALLETS_APP_CSP,
      fallbackToIndexHTML: true,
    })
  }
  if (requestUrl === 'wallets://history' || requestUrl.startsWith('wallets://history/')) {
    return serveAppAsset(requestUrl, path__default.join(__dirname, 'userland', 'history'), cb)
  }
  if (requestUrl === 'wallets://settings' || requestUrl.startsWith('wallets://settings/')) {
    return serveAppAsset(requestUrl, path__default.join(__dirname, 'userland', 'settings'), cb)
  }
  if (requestUrl.startsWith('wallets://assets/img/onboarding/')) {
    let imgPath = requestUrl.slice('wallets://assets/img/onboarding/'.length);
    return cb(200, 'OK', 'image/png', path__default.join(__dirname, `assets/img/onboarding/${imgPath}`))
  }
  if (requestUrl === 'wallets://assets/monaco.js') {
    return cb(200, 'OK', 'application/javascript; charset=utf-8', path__default.join(__dirname, 'assets/js/editor/monaco.js'))
  }
  if (requestUrl.startsWith('wallets://assets/vs/') && requestUrl.endsWith('.js')) {
    let filePath = requestUrl.slice('wallets://assets/vs/'.length);
    return cb(200, 'OK', 'application/javascript', path__default.join(__dirname, `assets/js/editor/vs/${filePath}`))
  }
  if (requestUrl.startsWith('wallets://assets/vs/') && requestUrl.endsWith('.css')) {
    let filePath = requestUrl.slice('wallets://assets/vs/'.length);
    return cb(200, 'OK', 'text/css; charset=utf-8', path__default.join(__dirname, `assets/js/editor/vs/${filePath}`))
  }
  if (requestUrl.startsWith('wallets://assets/vs/') && requestUrl.endsWith('.ttf')) {
    let filePath = requestUrl.slice('wallets://assets/vs/'.length);
    return cb(200, 'OK', 'font/ttf', path__default.join(__dirname, `assets/js/editor/vs/${filePath}`))
  }

  // debugging
  if (requestUrl === 'wallets://active-drives/') {
    return cb(200, 'OK', 'text/html; charset=utf-8', drivesDebugPage)
  }
  if (requestUrl === 'wallets://dat-dns-cache/') {
    return cb(200, 'OK', 'text/html; charset=utf-8', datDnsCachePage)
  }
  if (requestUrl === 'wallets://dat-dns-cache/main.js') {
    return cb(200, 'OK', 'application/javascript; charset=utf-8', datDnsCacheJS)
  }
  // TODO replace?
  // if (requestUrl.startsWith('wallets://debug-log/')) {
  //   const PAGE_SIZE = 1e6
  //   var start = queryParams.start ? (+queryParams.start) : 0
  //   let content = await walletsCore.getLogFileContent(start, start + PAGE_SIZE)
  //   var pagination = `<h2>Showing bytes ${start} - ${start + PAGE_SIZE}. <a href="wallets://debug-log/?start=${start + PAGE_SIZE}">Next page</a></h2>`
  //   return respond({
  //     statusCode: 200,
  //     headers: {
  //       'Content-Type': 'text/html; charset=utf-8',
  //       'Content-Security-Policy': WALLETS_CSP,
  //       'Access-Control-Allow-Origin': '*'
  //     },
  //     data: intoStream(`
  //       ${pagination}
  //       <pre>${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
  //       ${pagination}
  //     `)
  //   })
  // }

  return cb(404, 'Not Found')
}

// helper to serve requests to app packages
async function serveAppAsset (requestUrl, dirPath, cb, {CSP, fallbackToIndexHTML} = {CSP: undefined, fallbackToIndexHTML: false}) {
  // resolve the file path
  const urlp = new URL(requestUrl);
  var pathname = urlp.pathname;
  if (pathname === '' || pathname === '/') {
    pathname = '/index.html';
  }
  var filepath = path__default.join(dirPath, pathname);

  // make sure the file exists
  try {
    await fs__default.promises.stat(filepath);
  } catch (e) {
    if (fallbackToIndexHTML) {
      filepath = path__default.join(dirPath, '/index.html');
    } else {
      return cb(404, 'Not Found')
    }
  }

  // identify the mime type
  var contentType = identify(filepath);

  // serve
  cb(200, 'OK', contentType, filepath, CSP);
}

/**
 * asset:{type}{-dimension?}:{url}
 *
 * Helper protocol to serve site favicons and avatars from the cache.
 * Examples:
 *
 *  - asset:favicon:hyper://wallets.app
 *  - asset:favicon-32:hyper://wallets.app
 *  - asset:thumb:hyper://wallets.app
 *  - asset:cover:hyper://wallets.app
 **/

const NOT_FOUND = -6; // TODO I dont think this is the right code -prf

var handler;

function setup$w () {
  var DEFAULTS = {
    favicon: {type: 'image/png', data: NOT_FOUND, headers: {'Content-Type': 'image/jpeg', 'Cache-Control': 'no-cache'}},
    thumb: {type: 'image/jpeg', data: NOT_FOUND, headers: {'Content-Type': 'image/jpeg', 'Cache-Control': 'no-cache'}},
    cover: {type: 'image/jpeg', data: NOT_FOUND, headers: {'Content-Type': 'image/jpeg', 'Cache-Control': 'no-cache'}},
    screenshot: {type: 'image/png', data: NOT_FOUND, headers: {'Content-Type': 'image/jpeg', 'Cache-Control': 'no-cache'}}
  };

  // load defaults
  fs__default.readFile(path__default.join(__dirname, './assets/img/favicons/default.png'), (err, buf) => {
    if (err) { console.error('Failed to load default favicon', path__default.join(__dirname, './assets/img/default-favicon.png'), err); }
    if (buf) { DEFAULTS.favicon.data = buf; }
  });
  fs__default.readFile(path__default.join(__dirname, './assets/img/default-thumb.jpg'), (err, buf) => {
    if (err) { console.error('Failed to load default thumb', path__default.join(__dirname, './assets/img/default-thumb.jpg'), err); }
    if (buf) {
      DEFAULTS.thumb.data = buf;
      DEFAULTS.screenshot.data = buf;
    }
  });
  fs__default.readFile(path__default.join(__dirname, './assets/img/default-cover.jpg'), (err, buf) => {
    if (err) { console.error('Failed to load default cover', path__default.join(__dirname, './assets/img/default-cover.jpg'), err); }
    if (buf) { DEFAULTS.cover.data = buf; }
  });

  // detect if is retina
  let display = electron.screen.getPrimaryDisplay();
  const isRetina = display.scaleFactor >= 2;

  // register favicon protocol
  handler = async (request, cb) => {
    // parse the URL
    let {asset, url, size} = parseAssetUrl(request.url);
    if (isRetina) {
      size *= 2;
    }

    // validate
    if (asset !== 'favicon' && asset !== 'thumb' && asset !== 'cover' && asset !== 'screenshot') {
      return cb({data: NOT_FOUND})
    }

    // hardcoded assets
    if (asset !== 'screenshot' && url.startsWith('wallets://')) {
      let name = /wallets:\/\/([^\/]+)/.exec(url)[1];
      return servePng(path__default.join(__dirname, `./assets/img/favicons/${name}.png`), DEFAULTS[asset], cb)
    }

    try {
      // look up in db
      let data;
      if (asset === 'screenshot') {
        data = await get$3(url, 'screenshot', {dontExtractOrigin: true, normalizeUrl: true});

        // DISABLED- seems to generate some pretty bad error behaviors on win7
        // see https://github.com/beakerbrowser/beaker/issues/1872#issuecomment-739463243
        // -prf
        // if (!data && !url.startsWith('dat:')) {
        //   // try to fetch the screenshot
        //   let p = activeCaptures[url]
        //   if (!p) {
        //     p = activeCaptures[url] = capturePage(url)
        //   }
        //   let nativeImg = await p
        //   delete activeCaptures[url]
        //   if (nativeImg) {
        //     data = nativeImg.toDataURL()
        //     await sitedata.set(url, 'screenshot', data, {dontExtractOrigin: true, normalizeUrl: true})
        //   } else {
        //     return serveJpg(path.join(__dirname, `./assets/img/default-screenshot.jpg`), DEFAULTS[asset], cb)
        //   }
        // }
        if (!data) {
          return serveJpg(path__default.join(__dirname, `./assets/img/default-screenshot.jpg`), DEFAULTS[asset], cb)
        }
      } else {
        data = await get$3(url, asset);
        if (!data && asset === 'thumb') {
          if (url.startsWith('hyper://private')) {
            return serveJpg(path__default.join(__dirname, `./assets/img/default-private-screenshot.jpg`), DEFAULTS[asset], cb)
          }
          // try fallback to screenshot
          data = await get$3(url, 'screenshot', {dontExtractOrigin: true, normalizeUrl: true});
          if (!data) {
            // try fallback to favicon
            data = await get$3(url, 'favicon');
          }
        }
        if (!data && asset === 'favicon') {
          // try fallback to thumb
          data = await get$3(url, 'thumb');
        }
      }
      if (data) {
        if (size) {
          let img = electron.nativeImage.createFromDataURL(data);
          data = img.resize({width: size}).toDataURL();
        }
        
        // `data` is a data url ('data:image/png;base64,...')
        // so, skip the beginning and pull out the data
        let parts = data.split(',');
        if (parts[1]) {
          let mimeType = /data:([^;]+);base64/.exec(parts[0])[1];
          data = parts[1];
          if (data) {
            return cb({mimeType, data: Buffer.from(data, 'base64'), headers: {'Cache-Control': 'no-cache'}})
          }
        }
      }
    } catch (e) {
      // ignore
      console.log(e);
    }

    cb(DEFAULTS[asset]);
  };
}

function register$1 (protocol) {
  protocol.registerBufferProtocol('asset', handler);
}

const ASSET_URL_RE = /^asset:([a-z]+)(-\d+)?:(.*)/;
function parseAssetUrl (str) {
  const match = ASSET_URL_RE.exec(str);
  var url;
  try {
    let urlp = new URL(match[3]);
    url = urlp.protocol + '//' + urlp.hostname + urlp.pathname;
  } catch (e) {
    url = match[3];
  }
  return {
    asset: match[1],
    size: Math.abs(Number(match[2])),
    url
  }
}

function servePng (p, fallback, cb) {
  return fs__default.readFile(p, (err, buf) => {
    if (buf) cb({mimeType: 'image/png', data: buf, headers: {'Cache-Control': 'no-cache'}});
    else cb(fallback);
  })
}

function serveJpg (p, fallback, cb) {
  return fs__default.readFile(p, (err, buf) => {
    if (buf) cb({mimeType: 'image/jpeg', data: buf, headers: {'Cache-Control': 'no-cache'}});
    else cb(fallback);
  })
}

const logger$c = child({category: 'hyper', subcategory: 'hyper-scheme'});

const md = create$4({
  allowHTML: true,
  useHeadingIds: true,
  useHeadingAnchors: false,
  hrefMassager: undefined,
  highlight: undefined
});

class WhackAMoleStream {
  constructor (stream) {
    this.onreadable = noop$2;
    this.ended = false;
    this.stream = stream;
    this.needsDeferredReadable = false;
    this.readableOnce = false;

    stream.on('end', () => {
      this.ended = true;
    });

    stream.on('readable', () => {
      this.readableOnce = true;

      if (this.needsDeferredReadable) {
        setImmediate(this.onreadable);
        this.needsDeferredReadable = false;
        return
      }

      this.onreadable();
    });
  }

  read (...args) {
    const buf = this.stream.read(...args);
    this.needsDeferredReadable = buf === null;
    return buf
  }

  on (name, fn) {
    if (name === 'readable') {
      this.onreadable = fn;
      if (this.readableOnce) fn();
      return this.stream.on('readable', noop$2) // readable has sideeffects
    }

    return this.stream.on(name, fn)
  }

  destroy () {
    this.stream.on('error', noop$2);
    this.stream.destroy();
  }

  removeListener (name, fn) {
    this.stream.removeListener(name, fn);

    if (name === 'readable') {
      this.onreadable = noop$2;
      this.stream.removeListener('readable', noop$2);
    }

    if (name === 'end' && !this.ended) {
      this.destroy();
    }
  }
}

function noop$2 () {}

// exported api
// =

function register$2 (protocol) {
  protocol.registerStreamProtocol('hyper', protocolHandler);
}

const protocolHandler = async function (request, respond) {
  var drive;
  var cspHeader = undefined;
  var corsHeader = '*';
  var customFrontend = false;
  var wantsHTML = acceptHeaderWantsHTML(request.headers.Accept);
  const logUrl = toNiceUrl(request.url);

  respond = once$2(respond);
  const respondBuiltinFrontend = async () => {
    return respond({
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': corsHeader,
        'Allow-CSP-From': '*',
        'Cache-Control': 'no-cache',
        'Content-Security-Policy': `default-src wallets:; img-src * data: asset: blob:; media-src * data: asset: blob:; style-src wallets: 'unsafe-inline';`,
        'Beaker-Trusted-Interface': '1' // see wc-trust.js
      },
      data: intoStream(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <link rel="stylesheet" href="wallets://app-stdlib/css/fontawesome.css">
    <script type="module" src="wallets://drive-view/index.js"></script>
  </head>
</html>`)
    })
  };
  const respondCustomFrontend = async (checkoutFS) => {
    return respond({
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': corsHeader,
        'Allow-CSP-From': '*',
        'Content-Security-Policy': cspHeader
      },
      data: intoStream(await checkoutFS.pda.readFile('/.ui/ui.html')) // TODO use stream
    })
  };
  const respondRedirect = (url) => {
    respond({
      statusCode: 200,
      headers: {'Content-Type': 'text/html', 'Allow-CSP-From': '*'},
      data: intoStream(`<!doctype html><meta http-equiv="refresh" content="0; url=${url}">`)
    });
  };
  const respondError = (code, status, errorPageInfo) => {
    if (errorPageInfo) {
      errorPageInfo.validatedURL = request.url;
      errorPageInfo.errorCode = code;
    }
    var accept = request.headers.Accept || '';
    if (accept.includes('text/html')) {
      respond({
        statusCode: code,
        headers: {
          'Content-Type': 'text/html',
          'Content-Security-Policy': "default-src 'unsafe-inline' wallets:;",
          'Access-Control-Allow-Origin': corsHeader,
          'Allow-CSP-From': '*'
        },
        data: intoStream(errorPage(errorPageInfo || (code + ' ' + status)))
      });
    } else {
      respond({statusCode: code});
    }
  };

  // validate request
  logger$c.silly(`Starting ${logUrl}`, {url: request.url});
  var urlp = parseDriveUrl(request.url, true);
  if (!urlp.host) {
    return respondError(404, 'Drive Not Found', {
      title: 'Site Not Found',
      errorDescription: 'Invalid URL',
      errorInfo: `${request.url} is an invalid hyper:// URL`
    })
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return respondError(405, 'Method Not Supported')
  }

  // resolve the name
  var driveKey;
  var driveVersion;
  if (urlp.host.endsWith('.cap')) {
    let cap = lookupCap(urlp.host);
    if (!cap) {
      return respondError(404, 'No record found for ' + urlp.host, {
        errorDescription: 'Invalid capability record',
        errorInfo: `No record found for hyper://${urlp.host}`
      })
    }
    driveKey = cap.target.key;
    driveVersion = cap.target.version;
  } else {
    try {
      driveKey = await fromURLToKey(urlp.host, true);
      driveVersion = urlp.version;
    } catch (err) {
      return respondError(404, 'No DNS record found for ' + urlp.host, {
        errorDescription: 'No DNS record found',
        errorInfo: `No DNS record found for hyper://${urlp.host}`
      })
    }
  }

  // protect the system drive
  if (isRootUrl(`hyper://${driveKey}/`)) {
    corsHeader = undefined;
  }

  record('-browser', 'serve', {url: urlp.origin, path: urlp.pathname}, undefined, async () => {
    try {
      // start searching the network
      logger$c.silly(`Loading drive for ${logUrl}`, {url: request.url});
      drive = await getOrLoadDrive(driveKey);
    } catch (err) {
      logger$c.warn(`Failed to open drive ${driveKey}`, {err});
      return respondError(500, 'Failed')
    }

    // parse path
    var filepath = decodeURIComponent(urlp.path);
    if (!filepath) filepath = '/';
    if (filepath.indexOf('?') !== -1) filepath = filepath.slice(0, filepath.indexOf('?')); // strip off any query params
    var hasTrailingSlash = filepath.endsWith('/');

    // checkout version if needed
    try {
      var {checkoutFS} = await getDriveCheckout(drive, driveVersion);
    } catch (err) {
      logger$c.warn(`Failed to open drive checkout ${driveKey}`, {err});
      return respondError(500, 'Failed')
    }

    // read the manifest (it's needed in a couple places)
    var manifest;
    try { manifest = await checkoutFS.pda.readManifest(); } catch (e) { manifest = null; }

    // check to see if we actually have data from the drive
    var version = await checkoutFS.session.drive.version();
    if (version === 0) {
      logger$c.silly(`Drive not found ${logUrl}`, {url: request.url});
      return respondError(404, 'Site not found', {
        title: 'Site Not Found',
        errorDescription: 'No peers hosting this site were found',
        errorInfo: 'You may still be connecting to peers - try reloading the page.'
      })
    }

    // read manifest CSP
    if (manifest && manifest.csp && typeof manifest.csp === 'string') {
      cspHeader = manifest.csp;
    }

    // check for the presence of a frontend
    if (await checkoutFS.pda.stat('/.ui/ui.html').catch(e => false)) {
      customFrontend = true;
    }

    // lookup entry
    var statusCode = 200;
    var headers = {};
    var entry = await datServeResolvePath(checkoutFS.pda, manifest, urlp, request.headers.Accept);

    var canExecuteHTML = true;
    if (entry && !customFrontend) {
      // dont execute HTML if in a mount and no frontend is running
      let pathParts = entry.path.split('/').filter(Boolean);
      pathParts.pop(); // skip target, just need to check parent dirs
      while (pathParts.length) {
        let path = '/' + pathParts.join('/');
        let stat = await checkoutFS.pda.stat(path).catch(e => undefined);
        if (stat && stat.mount) {
          canExecuteHTML = false;
          break
        }
        pathParts.pop();
      }
    }

    // handle folder
    if (entry && entry.isDirectory()) {
      if (!hasTrailingSlash) {
        // make sure there's a trailing slash
        logger$c.silly(`Redirecting to trailing slash ${logUrl}`, {url: request.url});
        return respondRedirect(`hyper://${urlp.host}${urlp.version ? ('+' + urlp.version) : ''}${urlp.pathname || ''}/${urlp.search || ''}`)
      }
      if (customFrontend) {
        logger$c.silly(`Serving custom frontend ${logUrl}`, {url: request.url});
        return respondCustomFrontend(checkoutFS)
      }
      logger$c.silly(`Serving builtin frontend ${logUrl}`, {url: request.url});
      return respondBuiltinFrontend()
    }

    // custom frontend
    if (customFrontend && wantsHTML) {
      logger$c.silly(`Serving custom frontend ${logUrl}`, {url: request.url});
      return respondCustomFrontend(checkoutFS)
    }

    // 404
    if (!entry) {
      logger$c.silly('Not found', {url: request.url});
      // try to establish what the issue is
      let res = await checkoutFS.pda.stat('/.ui/ui.html').catch(err => ({err}));
      if (res?.err && /(not available|connectable)/i.test(res?.err.toString())) {
        return respondError(404, 'File Not Available', {
          errorDescription: 'File Not Available',
          errorInfo: `Wallets could not find any peers to access ${urlp.path}`,
          title: 'File Not Available'
        })
      }
      return respondError(404, 'File Not Found', {
        errorDescription: 'File Not Found',
        errorInfo: `Wallets could not find the file at ${urlp.path}`,
        title: 'File Not Found'
      })
    }

    // handle .goto redirects
    if (entry.path.endsWith('.goto') && entry.metadata.href) {
      try {
        let u = new URL(entry.metadata.href); // make sure it's a valid url
        logger$c.silly(`Redirecting for .goto ${logUrl} to ${entry.metadata.href}`, {url: request.url, href: entry.metadata.href});
        return respondRedirect(entry.metadata.href)
      } catch (e) {
        // pass through
      }
    }

    // detect mimetype
    var mimeType = entry.metadata.mimetype || entry.metadata.mimeType;
    if (!mimeType) {
      mimeType = identify(entry.path);
    }
    if (!canExecuteHTML && mimeType.includes('text/html')) {
      mimeType = 'text/plain';
    }

    // handle range
    headers['Accept-Ranges'] = 'bytes';
    var length;
    var range = request.headers.Range || request.headers.range;
    if (range) range = parseRange(entry.size, range);
    if (range && range.type === 'bytes') {
      range = range[0]; // only handle first range given
      statusCode = 206;
      length = (range.end - range.start + 1);
      headers['Content-Length'] = '' + length;
      headers['Content-Range'] = 'bytes ' + range.start + '-' + range.end + '/' + entry.size;
    } else {
      if (entry.size) {
        length = entry.size;
        headers['Content-Length'] = '' + length;
      }
    }

    Object.assign(headers, {
      'Content-Security-Policy': cspHeader,
      'Access-Control-Allow-Origin': corsHeader,
      'Allow-CSP-From': '*',
      'Cache-Control': 'no-cache'
    });

    // markdown rendering
    if (!range && entry.path.endsWith('.md') && acceptHeaderWantsHTML(request.headers.Accept)) {
      let content = await checkoutFS.pda.readFile(entry.path, 'utf8');
      let contentType = canExecuteHTML ? 'text/html' : 'text/plain';
      content = canExecuteHTML
        ? `<!doctype html>
<html>
  <head>
    <meta charset="utf8">
    <style>
      body {
        font-family: sans-serif;
        max-width: 800px;
        margin: 0 auto;
        padding: 0 10px;
        line-height: 1.4;
      }
      body * {
        max-width: 100%;
      }
    </style>
  </head>
  <body>
    ${md.render(content)}
  </body>
</html>`
        : content;
      logger$c.silly(`Serving markdown ${logUrl}`, {url: request.url});
      return respond({
        statusCode: 200,
        headers: Object.assign(headers, {'Content-Type': contentType}),
        data: intoStream(content)
      })
    }

    var mimeType = entry.metadata.mimeType;
    if (!mimeType) {
      let chunk;
      for await (const part of checkoutFS.session.drive.createReadStream(entry.path, { start: 0, length: 512 })) {
        chunk = chunk ? Buffer.concat([chunk, part]) : part;
      }
      mimeType = identify(entry.path, chunk);
    }
    if (!canExecuteHTML && mimeType.includes('text/html')) {
      mimeType = 'text/plain';
    }
    headers['Content-Type'] = mimeType;
    logger$c.silly(`Serving file ${logUrl}`, {url: request.url});
    if (request.method === 'HEAD') {
      respond({statusCode: 204, headers, data: intoStream('')});
    } else {
      respond({
        statusCode,
        headers,
        data: new WhackAMoleStream(checkoutFS.session.drive.createReadStream(entry.path, range))
      });
    }
  });
};

function intoStream (text) {
  return new stream$2.Readable({
    read () {
      this.push(text);
      this.push(null);
    }
  })
}

const logger$d = child({category: 'dat', subcategory: 'protocol'});

// globals
// =

var scopedFSes = {}; // map of scoped filesystems, kept in memory to reduce allocations
function getFS (path) {
  if (!(path in scopedFSes)) {
    let fs = scopedFSes[path] = new ScopedFS(path);
    fs.isLocalFS = true;
    fs.stat = util.promisify(fs.stat).bind(fs);
    fs.readdir = util.promisify(fs.readdir).bind(fs);
    fs.readFile = util.promisify(fs.readFile).bind(fs);
  }
  return scopedFSes[path]
}
function intoStream$1 (text) {
  const rv = new stream$2.PassThrough();
  rv.push(text);
  rv.push(null);
  return rv
}

// exported api
// =

function register$3 (protocol) {
  protocol.registerStreamProtocol('dat', electronHandler);
}

const electronHandler = async function (request, respond) {
  try {
    var urlp = new url.URL(request.url);
    var key = await datDns.resolveName(urlp.hostname);

    var path$1 = getStoragePathFor(key);
    await downloadDat(key);
    var fs = getFS(path$1);

    var manifest = {};
    try {
      manifest = JSON.parse(await fs.readFile('/dat.json'));
    } catch (e) {
      logger$d.warn('Failed to fetch dat:// manifest', {key, error: e});
    }

    var entry = await datServeResolvePath(fs, manifest, request.url, request.headers.Accept);

    if (!entry) {
      return respond({
        statusCode: 404,
        headers: {'Content-Type': 'text/html'},
        data: intoStream$1(`<h1>File not found</h1>`)
      })
    }

    if (entry.isFile()) {
      return respond({
        statusCode: 200,
        headers: {'Content-Type': identify(entry.path)},
        data: fs.createReadStream(entry.path)
      })
    }

    var files = await fs.readdir(entry.path);
    return respond({
      statusCode: 200,
      headers: {'Content-Type': 'text/html'},
      data: intoStream$1(`<!doctype html>
<html>
  <body>
    ${files.map(file => `<a href="${path.join(entry.path, file)}">${file}</a>`).join('<br>\n')}
  </body>
</html>
`)})
  } catch (e) {
    logger$d.error('Failed to access dat', {error: e, url: request.url});
    respond({
      statusCode: 400,
      headers: {'Content-Type': 'text/html'},
      data: intoStream$1(`<h1>Failed to load Dat</h1><pre>${e.toString()}</pre>`)
    });
  }
};

var testPort = +getEnvVar('WALLETS_TEST_DRIVER');
var sock;

// exported api
// =

function setup$x () {
  // setup socket
  sock = dgram.createSocket('udp4');
  sock.bind(0, '127.0.0.1');
  sock.on('message', onMessage);
  sock.on('listening', () => {
    console.log('Test driver enabled, listening for messages on port', sock.address().port);
  });

  // emit ready when ready
  var todos = 2;
  sock.on('listening', hit);
  electron.ipcMain.once('shell-window:ready', hit);
  function hit () {
    if (!(--todos)) {
      // HACK
      // there's some kind of race which causes `executeJavaScript` to not run in the shell window during tests
      // this timeout is intended to solve that
      // -prf
      setTimeout(() => {
        send({isReady: true, port: sock.address().port});
      }, 1e3);
    }
  }
}

// internal methods
// =

function send (obj) {
  obj = Buffer.from(JSON.stringify(obj), 'utf8');
  sock.send(obj, 0, obj.length, testPort, '127.0.0.1', err => {
    if (err) console.log('Error communicating with the test driver', err);
  });
}

async function onMessage (message) {
  const {msgId, cmd, args} = JSON.parse(message.toString('utf8'));
  var method = METHODS[cmd];
  if (!method) method = () => new Error('Invalid method: ' + cmd);
  try {
    var resolve = await method(...args);
    send({msgId, resolve});
  } catch (err) {
    var reject = {
      message: err.message,
      stack: err.stack,
      name: err.name
    };
    send({msgId, reject});
  }
}

const METHODS = {
  newTab () {
    var win = getActiveWindow$1();
    var tab = create$2(win, undefined, {setActive: true});
    return getIndexOfTab(win, tab)
  },

  navigateTo (page, url) {
    var tab = getByIndex(getActiveWindow$1(), page);
    var loadPromise = new Promise(resolve => tab.webContents.once('dom-ready', () => resolve()));
    tab.loadURL(url);
    return loadPromise
  },

  getUrl (page) {
    var tab = getByIndex(getActiveWindow$1(), page);
    return tab.url
  },

  async executeJavascriptInShell (js) {
    var win = getActiveWindow$1();
    var res = await win.webContents.executeJavaScript(js);
    return res
  },

  async executeJavascriptOnPage (page, js) {
    var tab = getByIndex(getActiveWindow$1(), page);
    var res = await tab.webContents.executeJavaScript(js);
    return res
  },

  async executeJavascriptInPermPrompt (page, js) {
    var tab = getByIndex(getActiveWindow$1(), page).browserView;
    var prompt = await waitFor(() => get$5(tab));
    var res = await prompt.webContents.executeJavaScript(js);
    return res
  },

  async executeJavascriptInModal (page, js) {
    var tab = getByIndex(getActiveWindow$1(), page).browserView;
    var modal = await waitFor(() => get$d(tab));
    var res = await modal.webContents.executeJavaScript(js);
    return res
  }
};

function getActiveWindow$1 () {
  var win = getActiveWindow();
  while (win.getParentWindow()) {
    win = win.getParentWindow();
  }
  return win
}

function waitFor (condFn) {
  return new Promise(resolve => {
    var i = setInterval(async () => {
      var res = condFn();
      if (res) {
        clearInterval(i);
        return resolve(res)
      }
    }, 100);
  })
}

require('tls').DEFAULT_ECDH_CURVE = 'auto'; // HACK (prf) fix Node 8.9.x TLS issues, see https://github.com/nodejs/node/issues/19359
process.noAsar = true;

// setup
// =

const log = get().child({category: 'browser', subcategory: 'init'});

// read config from env vars
if (getEnvVar('WALLETS_USER_DATA_PATH')) {
  console.log('User data path set by environment variables');
  console.log('userData:', getEnvVar('WALLETS_USER_DATA_PATH'));
  electron.app.setPath('userData', getEnvVar('WALLETS_USER_DATA_PATH'));
}
if (getEnvVar('WALLETS_TEST_DRIVER')) {
  setup$x();
}
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = '1'; // we know, we know

// enable the sandbox
electron.app.enableSandbox();

// HACK fix for cors in custom protocols
// see https://github.com/electron/electron/issues/20730
electron.app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');

// enable process reuse to speed up navigations
// see https://github.com/electron/electron/issues/18397
electron.app.allowRendererProcessReuse = true;

// configure the protocols
electron.protocol.registerSchemesAsPrivileged([
  {scheme: 'dat', privileges: {standard: true, secure: true, allowServiceWorkers: true, supportFetchAPI: true, corsEnabled: true}},
  {scheme: 'hyper', privileges: {standard: true, secure: true, allowServiceWorkers: true, supportFetchAPI: true, corsEnabled: true, stream: true}},
  {scheme: 'wallets', privileges: {standard: true, secure: true, allowServiceWorkers: true, supportFetchAPI: true, corsEnabled: true}}
]);

// handle OS event to open URLs
electron.app.on('open-url', (e, url) => {
  e.preventDefault(); // we are handling it
  // wait for ready (not waiting can trigger errors)
  if (electron.app.isReady()) open(url);
  else electron.app.on('ready', () => open(url));
});

// handle OS event to open files
electron.app.on('open-file', (e, filepath) => {
  e.preventDefault(); // we are handling it
  // wait for ready (not waiting can trigger errors)
  if (electron.app.isReady()) open(`file://${filepath}`);
  else electron.app.on('ready', () => open(`file://${filepath}`));
});

electron.app.on('ready', async function () {
  var commonOpts = {
    userDataPath: electron.app.getPath('userData'),
    homePath: electron.app.getPath('home')
  };

  await setup(path.join(commonOpts.userDataPath, 'wallets.log'));
  log.info('Welcome to Wallets');
  register(electron.protocol);
  setup$u();
  open$2();
  setup$t();

  // setup databases
  log.info('Initializing databases');
  for (let k in dbs) {
    if (dbs[k].setup) {
      dbs[k].setup(commonOpts);
    }
  }

  // start subsystems
  // (order is important)
  log.info('Starting hyperdrive');
  await hyper.setup(commonOpts);
  log.info('Initializing hyperdrive filesystem');
  await setup$o();
  log.info('Initializing browser');
  await setup$r();
  setup$2();
  setup$s();
  await setup$l();

  // protocols
  log.info('Registering protocols');
  setup$w();
  register$1(electron.protocol);
  register$2(electron.protocol);
  register$3(electron.protocol);

  close$3();

  // setup flow
  log.info('Running setup flow');
  await runSetupFlow();

  // ui
  log.info('Initializing window menu');
  setup$k();
  log.info('Initializing context menus');
  registerContextMenu();
  log.info('Initializing tray icon');
  setup$v();
  log.info('Initializing browser windows');
  setup$i();
  log.info('Initializing downloads manager');
  log.info('Initializing permissions manager');
  setup$c();
  log.info('Program setup complete');

  // theming
  electron.nativeTheme.themeSource = await dbs.settings.get('browser_theme');
  dbs.settings.on('set:browser_theme', v => {
    electron.nativeTheme.themeSource = v;
  });
});

electron.app.on('window-all-closed', () => {
  // do nothing
});

electron.app.on('will-quit', async (e) => {
  if (hyper.daemon.requiresShutdown()) {
    e.preventDefault();
    log.info('Delaying shutdown to teardown the daemon');
    await hyper.daemon.shutdown();
    electron.app.quit();
  }
});

electron.app.on('quit', () => {
  log.info('Program quit');
  closePort();
});

electron.app.on('custom-ready-to-show', () => {
  // our first window is ready to show, do any additional setup
});

// only run one instance
const isFirstInstance = electron.app.requestSingleInstanceLock();
if (!isFirstInstance) {
  electron.app.exit();
} else {
  handleArgv(process.argv);
  electron.app.on('second-instance', (event, argv, workingDirectory) => {
    log.info('Second instance opened', {argv});
    handleArgv(argv);

    // focus/create a window
    ensureOneWindowExists();
  });
}
function handleArgv (argv) {
  if (process.platform !== 'darwin') {
    // look for URLs, windows & linux use argv instead of open-url
    let url = argv.find(v => v.indexOf('://') !== -1);
    if (url) {
      open(url);
    }
  }
}

}());