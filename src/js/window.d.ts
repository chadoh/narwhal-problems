import * as accounts from './accounts'
import * as naj from 'near-api-js'
import render from './render'

declare global {
  interface Window {
    accounts: accounts;
    naj: naj;
    render: render;
    renderers: (() => {})[]
    state: { [key: string]: any }
  }
}