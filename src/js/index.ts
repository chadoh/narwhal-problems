import { onChange } from './accounts'
import render from './render'
import * as utils from './utils'

// can't import libraries in inline scripts, so let's add them all to window
window.render = render
window.utils = utils

onChange(render)
