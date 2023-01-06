import * as rpc from 'pauls-electron-rpc'
import * as hyperdrive from './fg/hyperdrive'
import * as internal from './fg/internal'
import * as external from './fg/external'
import * as experimental from './fg/experimental'
import { contextBridge } from 'electron'

export const setup = function () {
  // setup APIs
  var beaker = {}
  if (['wallets:', 'hyper:', 'https:', 'http:', 'data:'].includes(window.location.protocol) ||
      window.location.hostname.endsWith('hyperdrive.network') /* TEMPRARY */) {
    beaker.hyperdrive = hyperdrive.setup(rpc)
    Object.assign(beaker, external.setup(rpc))
  }
  if (['wallets:', 'hyper:'].includes(window.location.protocol)) {
    contextBridge.exposeInMainWorld('experimental', experimental.setup(rpc)) // TODO remove?
  }
  if (window.location.protocol === 'wallets:' || /* TEMPRARY */ window.location.hostname.endsWith('hyperdrive.network')) {
    Object.assign(beaker, internal.setup(rpc))
  }
  if (Object.keys(beaker).length > 0) {
    contextBridge.exposeInMainWorld('beaker', beaker)
  }
}