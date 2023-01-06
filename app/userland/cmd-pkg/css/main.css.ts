import {css} from 'wallets://app-stdlib/vendor/lit-element/lit-element.js'
import buttonsCSS from 'wallets://app-stdlib/css/buttons2.css.js'
import inputsCSS from 'wallets://app-stdlib/css/inputs.css.js'
import tooltipCSS from 'wallets://app-stdlib/css/tooltip.css.js'

const cssStr = css`
${buttonsCSS}
${inputsCSS}
${tooltipCSS}

:host {
  display: block;
  padding: 6px 10px;
  margin: 0 auto;
  max-width: 800px;
}

.header {
  padding: 16px;
  border: 1px solid #ccd;
  border-radius: 4px;
}

.header h1,
.header p {
  margin-top: 0;
}

.header h1 {
  margin-bottom: 8px;
}

.header p {
  margin-bottom: 12px;
}
`
export default cssStr