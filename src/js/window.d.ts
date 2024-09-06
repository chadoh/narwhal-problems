import render from './render'
import * as accounts from './accounts'
import * as near from './near'
import * as utils from './utils'
import * as validators from './validators'
import type { Account, RawAccount, set } from './accounts'

declare global {
  interface Window {
    Buffer: Buffer,
    render: render;
    renderers:
    ((
      { accounts, accountsRaw, setAccounts }:
        { accounts: Account[], accountsRaw: RawAccount[], setAccounts: typeof set }
    ) => void)[];
    state: { [key: string]: any };
    accounts: accounts;
    near: near;
    utils: utils;
    validators: validators;
  }
}
