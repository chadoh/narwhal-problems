import { onChange } from './accounts'
import render from './render'
import * as accounts from './accounts'
import * as utils from './utils'
import * as validators from './validators'

// can't import libraries in inline scripts, so let's add them all to window
window.accounts = accounts
window.render = render
window.utils = utils
window.validators = validators

onChange(render)
window.addEventListener('hashchange', render)
