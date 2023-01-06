/* globals customElements */
import {LitElement, html, css} from '../../vendor/lit-element/lit-element'
import { classMap } from '../../vendor/lit-element/lit-html/directives/class-map'
import _get from 'lodash.get'
import * as bg from '../bg-process-rpc'
import buttonResetCSS from './button-reset.css'

class NavbarSiteInfo extends LitElement {
  static get properties () {
    return {
      url: {type: String},
      siteTitle: {type: String},
      siteSubtitle: {type: String},
      siteIcon: {type: String},
      siteTrust: {type: String},
      driveDomain: {type: String},
      driveIdent: {type: String},
      writable: {type: Boolean},
      isPressed: {type: Boolean},
      hideOrigin: {type: Boolean, attribute: 'hide-origin'},
      rounded: {type: Boolean}
    }
  }

  constructor () {
    super()
    this.url = ''
    this.siteTitle = ''
    this.siteSubtitle = ''
    this.siteIcon = ''
    this.siteTrust = ''
    this.driveDomain = ''
    this.driveIdent = ''
    this.writable = false
    this.isPressed = false
    this.hideOrigin = false
    this.rounded = false
  }

  get scheme () {
    try {
      return (new URL(this.url)).protocol
    } catch (e) {
      return ''
    }
  }

  get hostname () {
    try {
      return (new URL(this.url)).hostname
    } catch (e) {
      return ''
    }
  }

  get isHyperdrive () {
    return this.url.startsWith('hyper://')
  }

  // rendering
  // =

  render () {
    var innerHTML
    if (this.siteIcon || this.siteTitle) {
      innerHTML = html`
        ${this.siteIcon === 'wallets-logo' ? html`
          <svg class="wallets-logo" viewBox="0 0 20 16">
            <g>
            <path d="M3.4,2.8C2,2.8,0.9,3.9,0.9,5.3S2,7.8,3.4,7.8s2.5-1.1,2.5-2.5S4.7,2.8,3.4,2.8z"/>
            <path d="M7.7,5.8c0,0.1,0,0.2,0,0.3C7.7,7.2,7,8.2,6,8.6v0l-0.1,0C4.9,9,4.3,10,4.3,11c0,1.4,1.1,2.5,2.5,2.5
              s2.5-1.1,2.5-2.5c0-0.1,0-0.2,0-0.3c0-0.1,0-0.1,0-0.2c0-0.1,0-0.2,0-0.3C9.2,9,10,8,11.1,7.6c1-0.4,1.6-1.3,1.6-2.3
              c0-1.4-1.1-2.5-2.5-2.5S7.6,3.9,7.6,5.3c0,0.1,0,0.2,0,0.3L7.7,5.8z"/>
            <path d="M16.1,10.5c0-0.1,0-0.2,0-0.3C16,9,16.8,8,17.9,7.6c1-0.4,1.6-1.3,1.6-2.3c0-1.4-1.1-2.5-2.5-2.5
              s-2.5,1.1-2.5,2.5c0,0.1,0,0.2,0,0.3l0,0.2c0,0.1,0,0.2,0,0.3c0,1.1-0.7,2.1-1.7,2.5v0l-0.1,0c-1,0.4-1.7,1.3-1.7,2.4
              c0,1.4,1.1,2.5,2.5,2.5s2.5-1.1,2.5-2.5L16.1,10.5z"/>
            </g>
          </svg>
        ` : html`
          <span class="${this.siteIcon} ${this.siteTrust}"></span>
        `}
        <span class="label">${this.siteTitle}</span>
        ${this.siteSubtitle ? html`<span class="label sublabel">${this.siteSubtitle}</span>` : ''}
      `
    }

    if (!innerHTML) {
      return html`<button class="hidden"></button>`
    }

    return html`
      <link rel="stylesheet" href="wallets://assets/font-awesome.css">
      <button class=${classMap({[this.siteTrust]: true, pressed: this.isPressed, 'hide-origin': this.hideOrigin, rounded: this.rounded})} @click=${this.onClickButton}>
        ${innerHTML}
        ${this.renderHyperCtrls()}
      </button>
    `
  }

  renderHyperCtrls () {
    if (!this.isHyperdrive) {
      return ''
    }
    if (this.writable) {
      if (['system', 'profile'].includes(this.driveIdent)) {
        return ''
      }
      return html`<span class="fas fa-fw fa-pen"></span>`
    }
  }

  // events
  // =

  async onClickButton (e) {
    if (Date.now() - (this.lastButtonClick||0) < 100) {
      return
    }
    this.isPressed = true
    var rect = e.currentTarget.getClientRects()[0]
    await bg.views.toggleSiteInfo({
      bounds: {
        top: (rect.bottom|0),
        left: (rect.left|0)
      }
    })
    this.isPressed = false
    this.lastButtonClick = Date.now()
  }
}
NavbarSiteInfo.styles = [buttonResetCSS, css`
:host {
  display: block;
  min-width: 5px;
}

button {
  border-radius: 0;
  border-top-left-radius: 16px;
  border-bottom-left-radius: 16px;
  height: 26px;
  line-height: 27px;
  padding: 0 12px 0 10px;
  background: var(--bg-color--cert--default);
  clip-path: polygon(0% 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:host([autocomplete-open]) button {
  border-top-left-radius: 12px;
  border-bottom-left-radius: 0;
}

button:not(:disabled):hover {
  background: var(--bg-color--cert--default--hover);
}

button.trusted {
  background: var(--bg-color--cert--trusted);
}

button.trusted:hover {
  background: var(--bg-color--cert--trusted--hover);
}

button.untrusted {
  background: var(--bg-color--cert--untrusted);
}

button.untrusted:hover {
  background: var(--bg-color--cert--untrusted--hover);
}

button.hide-origin .label {
  display: none;
}

button.rounded {
  clip-path: none;
  border-radius: 16px;
  padding: 0 10px 0 10px;
  margin-right: 2px;
}

button.hidden {
  display: none;
}

.fa-exclamation-triangle,
.fa-check-circle {
  font-size: 12.5px;
  line-height: 27px;
}

.fa-user-check {
  font-size: 12px;
  line-height: 27px;
}

.wallets-logo {
  width: 20px;
  height: 16px;
  position: relative;
  top: 3px;
  margin: 0 -4px 0 4px;
}

.wallets-logo path,
.wallets-logo circle {
  fill: var(--text-color--cert--trusted);
}

.fa-user {
  font-size: 9px;
  position: relative;
  top: -1px;
}

.label {
  margin-left: 2px;
  margin-right: 2px;
  font-variant-numeric: tabular-nums;
  font-weight: 400;
  font-size: 12.5px;
  line-height: 27px;
  letter-spacing: 0.5px;
}

.label.sublabel {
  display: inline-block;
  height: 18px;
  line-height: 20px;
  border-radius: 4px;
  padding: 0 5px;
  background: var(--bg-color--cert-sublabel);
  color: var(--text-color--cert-sublabel);
}

.notrust {
  color: var(--text-color--cert--notrust);
}

.trusted {
  color: var(--text-color--cert--trusted);
}

.secure {
  color: var(--text-color--cert--secure);
}

.warning {
  color: var(--text-color--cert--warning);
}

.untrusted {
  color: var(--text-color--cert--untrusted);
}

`]
customElements.define('shell-window-navbar-site-info', NavbarSiteInfo)
