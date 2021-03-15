import * as accounts from './accounts'
import * as naj from 'near-api-js'
import render from './render'

// can't import libraries in inline scripts, so let's add them all to window
window.accounts = accounts
window.naj = naj
window.render = render

accounts.onChange(render)