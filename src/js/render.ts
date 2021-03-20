import {
  get as getAccounts,
  getRaw as getAccountsRaw,
  set as setAccounts
} from './accounts'

export default async function render() {
  const accountsRaw = await getAccountsRaw()
  const accounts = await getAccounts()

  // avoid race conditions in multiple calls to `getAccounts` by calling once
  // then passing result to all renderers
  return Promise.all((window as any).renderers.map(fn => fn({
    accounts, accountsRaw, setAccounts
  })))
}
