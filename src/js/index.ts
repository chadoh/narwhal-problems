window.global ||= window;
import { onChange } from "./accounts";
import render from "./render";
import * as accounts from "./accounts";
import * as near from "./near";
import * as utils from "./utils";
import * as validators from "./validators";

// can't import libraries in inline scripts, so let's add them all to window
window.accounts = accounts;
window.near = near;
window.render = render;
window.utils = utils;
window.validators = validators;
window.render = render;

onChange(render);
window.addEventListener("hashchange", render);
