import errorPage from '../lib/error-page'
import * as mime from '../lib/mime'
import { drivesDebugPage, datDnsCachePage, datDnsCacheJS } from '../hyper/debugging'
import path from 'path'
import url from 'url'
import once from 'once'
import fs from 'fs'
import jetpack from 'fs-jetpack'
import intoStream from 'into-stream'
import ICO from 'icojs'

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
`.replace(/\n/g, '')
const WALLETS_APP_CSP = `
  default-src 'self' wallets:;
  img-src wallets: asset: data: blob: hyper: http: https;
  script-src 'self' wallets: hyper: 'unsafe-eval';
  media-src 'self' wallets: hyper:;
  style-src 'self' 'unsafe-inline' wallets:;
  child-src 'self' hyper:;
`.replace(/\n/g, '')
const SIDEBAR_CSP = `
default-src 'self' wallets:;
img-src wallets: asset: data: blob: hyper: http: https;
script-src 'self' wallets: hyper: blob: 'unsafe-eval';
media-src 'self' wallets: hyper:;
style-src 'self' 'unsafe-inline' wallets:;
child-src 'self' wallets:;
`.replace(/\n/g, '')

// exported api
// =

export function register (protocol) {
  // setup the protocol handler
  protocol.registerStreamProtocol('wallets', walletsProtocol)
}

// internal methods
// =

async function walletsProtocol (request, respond) {
  var cb = once((statusCode, status, contentType, path, CSP) => {
    const headers = {
      'Cache-Control': 'no-cache',
      'Content-Type': (contentType || 'text/html; charset=utf-8'),
      'Content-Security-Policy': CSP || WALLETS_CSP,
      'Access-Control-Allow-Origin': '*'
    }
    if (typeof path === 'string') {
      respond({statusCode, headers, data: fs.createReadStream(path)})
    } else if (typeof path === 'function') {
      respond({statusCode, headers, data: intoStream(path())})
    } else {
      respond({statusCode, headers, data: intoStream(errorPage(statusCode + ' ' + status))})
    }
  })
  async function serveICO (path, size = 16) {
    // read the file
    const data = await jetpack.readAsync(path, 'buffer')

    // parse the ICO to get the 16x16
    const images = await ICO.parse(data, 'image/png')
    let image = images[0]
    for (let i = 1; i < images.length; i++) {
      if (Math.abs(images[i].width - size) < Math.abs(image.width - size)) {
        image = images[i]
      }
    }

    // serve
    cb(200, 'OK', 'image/png', () => Buffer.from(image.buffer))
  }

  var requestUrl = request.url
  var queryParams
  {
    // strip off the hash
    let i = requestUrl.indexOf('#')
    if (i !== -1) requestUrl = requestUrl.slice(0, i)
  }
  {
    // get the query params
    queryParams = url.parse(requestUrl, true).query

    // strip off the query
    let i = requestUrl.indexOf('?')
    if (i !== -1) requestUrl = requestUrl.slice(0, i)
  }

  // redirects from old pages
  if (requestUrl.startsWith('wallets://start/')) {
    return cb(200, 'OK', 'text/html', () => `<!doctype html><meta http-equiv="refresh" content="0; url=wallets://desktop/">`)
  }

  // browser ui
  if (requestUrl === 'wallets://shell-window/') {
    return cb(200, 'OK', 'text/html; charset=utf-8', path.join(__dirname, 'fg', 'shell-window', 'index.html'))
  }
  if (requestUrl === 'wallets://shell-window/main.js') {
    return cb(200, 'OK', 'application/javascript; charset=utf-8', path.join(__dirname, 'fg', 'shell-window', 'index.build.js'))
  }
  if (requestUrl === 'wallets://location-bar/') {
    return cb(200, 'OK', 'text/html; charset=utf-8', path.join(__dirname, 'fg', 'location-bar', 'index.html'))
  }
  if (requestUrl === 'wallets://shell-menus/') {
    return cb(200, 'OK', 'text/html; charset=utf-8', path.join(__dirname, 'fg', 'shell-menus', 'index.html'))
  }
  if (requestUrl === 'wallets://prompts/') {
    return cb(200, 'OK', 'text/html; charset=utf-8', path.join(__dirname, 'fg', 'prompts', 'index.html'))
  }
  if (requestUrl === 'wallets://perm-prompt/') {
    return cb(200, 'OK', 'text/html; charset=utf-8', path.join(__dirname, 'fg', 'perm-prompt', 'index.html'))
  }
  if (requestUrl === 'wallets://modals/') {
    return cb(200, 'OK', 'text/html; charset=utf-8', path.join(__dirname, 'fg', 'modals', 'index.html'))
  }
  if (requestUrl === 'wallets://assets/syntax-highlight.js') {
    return cb(200, 'OK', 'application/javascript; charset=utf-8', path.join(__dirname, 'assets/js/syntax-highlight.js'))
  }
  if (requestUrl === 'wallets://assets/syntax-highlight.css') {
    return cb(200, 'OK', 'text/css; charset=utf-8', path.join(__dirname, 'assets/css/syntax-highlight.css'))
  }
  if (requestUrl === 'wallets://assets/font-awesome.css') {
    return cb(200, 'OK', 'text/css; charset=utf-8', path.join(__dirname, 'assets/css/fa-all.min.css'))
  }
  if (requestUrl === 'wallets://assets/webfonts/fa-regular-400.woff2') {
    return cb(200, 'OK', 'text/css; charset=utf-8', path.join(__dirname, 'assets/fonts/fa-regular-400.woff2'))
  }
  if (requestUrl === 'wallets://assets/webfonts/fa-regular-400.woff') {
    return cb(200, 'OK', 'text/css; charset=utf-8', path.join(__dirname, 'assets/fonts/fa-regular-400.woff'))
  }
  if (requestUrl === 'wallets://assets/webfonts/fa-regular-400.svg') {
    return cb(200, 'OK', 'text/css; charset=utf-8', path.join(__dirname, 'assets/fonts/fa-regular-400.svg'))
  }
  if (requestUrl === 'wallets://assets/webfonts/fa-solid-900.woff2') {
    return cb(200, 'OK', 'text/css; charset=utf-8', path.join(__dirname, 'assets/fonts/fa-solid-900.woff2'))
  }
  if (requestUrl === 'wallets://assets/webfonts/fa-solid-900.woff') {
    return cb(200, 'OK', 'text/css; charset=utf-8', path.join(__dirname, 'assets/fonts/fa-solid-900.woff'))
  }
  if (requestUrl === 'wallets://assets/webfonts/fa-solid-900.svg') {
    return cb(200, 'OK', 'text/css; charset=utf-8', path.join(__dirname, 'assets/fonts/fa-solid-900.svg'))
  }
  if (requestUrl === 'wallets://assets/webfonts/fa-brands-400.woff2') {
    return cb(200, 'OK', 'text/css; charset=utf-8', path.join(__dirname, 'assets/fonts/fa-brands-400.woff2'))
  }
  if (requestUrl === 'wallets://assets/webfonts/fa-brands-400.woff') {
    return cb(200, 'OK', 'text/css; charset=utf-8', path.join(__dirname, 'assets/fonts/fa-brands-400.woff'))
  }
  if (requestUrl === 'wallets://assets/webfonts/fa-brands-400.svg') {
    return cb(200, 'OK', 'text/css; charset=utf-8', path.join(__dirname, 'assets/fonts/fa-brands-400.svg'))
  }
  if (requestUrl === 'wallets://assets/font-photon-entypo') {
    return cb(200, 'OK', 'application/font-woff', path.join(__dirname, 'assets/fonts/photon-entypo.woff'))
  }
  if (requestUrl === 'wallets://assets/font-source-sans-pro') {
    return cb(200, 'OK', 'application/font-woff2', path.join(__dirname, 'assets/fonts/source-sans-pro.woff2'))
  }
  if (requestUrl === 'wallets://assets/font-source-sans-pro-le') {
    return cb(200, 'OK', 'application/font-woff2', path.join(__dirname, 'assets/fonts/source-sans-pro-le.woff2'))
  }
  if (requestUrl === 'wallets://assets/logo-black.svg') {
    return cb(200, 'OK', 'image/svg+xml', path.join(__dirname, 'assets/img/logo-black.svg'))
  }
  if (requestUrl === 'wallets://assets/spinner.gif') {
    return cb(200, 'OK', 'image/gif', path.join(__dirname, 'assets/img/spinner.gif'))
  }
  if (requestUrl.startsWith('wallets://assets/logo2')) {
    return cb(200, 'OK', 'image/png', path.join(__dirname, 'assets/img/logo2.png'))
  }
  if (requestUrl.startsWith('wallets://assets/logo')) {
    return cb(200, 'OK', 'image/png', path.join(__dirname, 'assets/img/logo.png'))
  }
  if (requestUrl.startsWith('wallets://assets/default-user-thumb')) {
    return cb(200, 'OK', 'image/jpeg', path.join(__dirname, 'assets/img/default-user-thumb.jpg'))
  }
  if (requestUrl.startsWith('wallets://assets/default-thumb')) {
    return cb(200, 'OK', 'image/jpeg', path.join(__dirname, 'assets/img/default-thumb.jpg'))
  }
  if (requestUrl.startsWith('wallets://assets/default-frontend-thumb')) {
    return cb(200, 'OK', 'image/jpeg', path.join(__dirname, 'assets/img/default-frontend-thumb.jpg'))
  }
  if (requestUrl.startsWith('wallets://assets/search-icon-large')) {
    return cb(200, 'OK', 'image/jpeg', path.join(__dirname, 'assets/img/search-icon-large.png'))
  }
  if (requestUrl.startsWith('wallets://assets/favicons/')) {
    return serveICO(path.join(__dirname, 'assets/favicons', requestUrl.slice('wallets://assets/favicons/'.length)))
  }
  if (requestUrl.startsWith('wallets://assets/search-engines/')) {
    return cb(200, 'OK', 'image/png', path.join(__dirname, 'assets/img/search-engines', requestUrl.slice('wallets://assets/search-engines/'.length)))
  }
  if (requestUrl.startsWith('wallets://assets/img/templates/')) {
    let imgPath = requestUrl.slice('wallets://assets/img/templates/'.length)
    return cb(200, 'OK', 'image/png', path.join(__dirname, `assets/img/templates/${imgPath}`))
  }
  if (requestUrl.startsWith('wallets://assets/img/frontends/')) {
    let imgPath = requestUrl.slice('wallets://assets/img/frontends/'.length)
    return cb(200, 'OK', 'image/png', path.join(__dirname, `assets/img/frontends/${imgPath}`))
  }
  if (requestUrl.startsWith('wallets://assets/img/drive-types/')) {
    let imgPath = requestUrl.slice('wallets://assets/img/drive-types/'.length)
    return cb(200, 'OK', 'image/png', path.join(__dirname, `assets/img/drive-types/${imgPath}`))
  }

  // userland
  if (requestUrl === 'wallets://app-stdlib' || requestUrl.startsWith('wallets://app-stdlib/')) {
    return serveAppAsset(requestUrl, path.join(__dirname, 'userland', 'app-stdlib'), cb)
  }
  if (requestUrl === 'wallets://diff' || requestUrl.startsWith('wallets://diff/')) {
    return serveAppAsset(requestUrl, path.join(__dirname, 'userland', 'diff'), cb)
  }
  if (requestUrl === 'wallets://library' || requestUrl.startsWith('wallets://library/')) {
    return serveAppAsset(requestUrl, path.join(__dirname, 'userland', 'library'), cb, {fallbackToIndexHTML: true})
  }
  if (requestUrl === 'wallets://drive-view' || requestUrl.startsWith('wallets://drive-view/')) {
    return serveAppAsset(requestUrl, path.join(__dirname, 'userland', 'drive-view'), cb)
  }
  if (requestUrl === 'wallets://cmd-pkg' || requestUrl.startsWith('wallets://cmd-pkg/')) {
    return serveAppAsset(requestUrl, path.join(__dirname, 'userland', 'cmd-pkg'), cb)
  }
  if (requestUrl === 'wallets://site-info' || requestUrl.startsWith('wallets://site-info/')) {
    return serveAppAsset(requestUrl, path.join(__dirname, 'userland', 'site-info'), cb, {fallbackToIndexHTML: true})
  }
  if (requestUrl === 'wallets://setup' || requestUrl.startsWith('wallets://setup/')) {
    return serveAppAsset(requestUrl, path.join(__dirname, 'userland', 'setup'), cb, {fallbackToIndexHTML: true})
  }
  if (requestUrl === 'wallets://init' || requestUrl.startsWith('wallets://init/')) {
    return serveAppAsset(requestUrl, path.join(__dirname, 'userland', 'init'), cb, {fallbackToIndexHTML: true})
  }
  if (requestUrl === 'wallets://editor' || requestUrl.startsWith('wallets://editor/')) {
    return serveAppAsset(requestUrl, path.join(__dirname, 'userland', 'editor'), cb)
  }
  if (requestUrl === 'wallets://explorer' || requestUrl.startsWith('wallets://explorer/')) {
    return serveAppAsset(requestUrl, path.join(__dirname, 'userland', 'explorer'), cb, {fallbackToIndexHTML: true})
  }
  if (requestUrl === 'wallets://hypercore-tools' || requestUrl.startsWith('wallets://hypercore-tools/')) {
    return serveAppAsset(requestUrl, path.join(__dirname, 'userland', 'hypercore-tools'), cb, {fallbackToIndexHTML: true})
  }
  if (requestUrl === 'wallets://webterm' || requestUrl.startsWith('wallets://webterm/')) {
    return serveAppAsset(requestUrl, path.join(__dirname, 'userland', 'webterm'), cb, {
      fallbackToIndexHTML: true,
      CSP: SIDEBAR_CSP
    })
  }
  if (requestUrl === 'wallets://desktop' || requestUrl.startsWith('wallets://desktop/')) {
    return serveAppAsset(requestUrl, path.join(__dirname, 'userland', 'desktop'), cb, {
      CSP: WALLETS_APP_CSP,
      fallbackToIndexHTML: true,
    })
  }
  if (requestUrl === 'wallets://history' || requestUrl.startsWith('wallets://history/')) {
    return serveAppAsset(requestUrl, path.join(__dirname, 'userland', 'history'), cb)
  }
  if (requestUrl === 'wallets://settings' || requestUrl.startsWith('wallets://settings/')) {
    return serveAppAsset(requestUrl, path.join(__dirname, 'userland', 'settings'), cb)
  }
  if (requestUrl.startsWith('wallets://assets/img/onboarding/')) {
    let imgPath = requestUrl.slice('wallets://assets/img/onboarding/'.length)
    return cb(200, 'OK', 'image/png', path.join(__dirname, `assets/img/onboarding/${imgPath}`))
  }
  if (requestUrl === 'wallets://assets/monaco.js') {
    return cb(200, 'OK', 'application/javascript; charset=utf-8', path.join(__dirname, 'assets/js/editor/monaco.js'))
  }
  if (requestUrl.startsWith('wallets://assets/vs/') && requestUrl.endsWith('.js')) {
    let filePath = requestUrl.slice('wallets://assets/vs/'.length)
    return cb(200, 'OK', 'application/javascript', path.join(__dirname, `assets/js/editor/vs/${filePath}`))
  }
  if (requestUrl.startsWith('wallets://assets/vs/') && requestUrl.endsWith('.css')) {
    let filePath = requestUrl.slice('wallets://assets/vs/'.length)
    return cb(200, 'OK', 'text/css; charset=utf-8', path.join(__dirname, `assets/js/editor/vs/${filePath}`))
  }
  if (requestUrl.startsWith('wallets://assets/vs/') && requestUrl.endsWith('.ttf')) {
    let filePath = requestUrl.slice('wallets://assets/vs/'.length)
    return cb(200, 'OK', 'font/ttf', path.join(__dirname, `assets/js/editor/vs/${filePath}`))
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
  const urlp = new URL(requestUrl)
  var pathname = urlp.pathname
  if (pathname === '' || pathname === '/') {
    pathname = '/index.html'
  }
  var filepath = path.join(dirPath, pathname)

  // make sure the file exists
  try {
    await fs.promises.stat(filepath)
  } catch (e) {
    if (fallbackToIndexHTML) {
      filepath = path.join(dirPath, '/index.html')
    } else {
      return cb(404, 'Not Found')
    }
  }

  // identify the mime type
  var contentType = mime.identify(filepath)

  // serve
  cb(200, 'OK', contentType, filepath, CSP)
}