import render from './render'
import * as accounts from './accounts'
import * as near from './near'
import * as utils from './utils'
import * as validators from './validators'

declare global {
  interface Window {
    render: render;
    renderers: (() => {})[];
    state: { [key: string]: any };
    accounts: accounts;
    near: near;
    utils: utils;
    validators: validators;
  }
}
