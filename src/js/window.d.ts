import render from './render'
import * as utils from './utils'

declare global {
  interface Window {
    render: render;
    renderers: (() => {})[];
    state: { [key: string]: any };
    utils: utils;
  }
}
