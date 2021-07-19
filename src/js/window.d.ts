import render from './render'
import * as utils from './utils'
import * as validators from './validators'

declare global {
  interface Window {
    render: render;
    renderers: (() => {})[];
    state: { [key: string]: any };
    utils: utils;
    validators: validators;
  }
}
