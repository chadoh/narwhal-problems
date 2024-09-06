import {
  get as getAccounts,
  set as setAccounts
} from './accounts'

export default async function render() {
  const accountsRaw = await getAccounts('undecorated')
  const accounts = await getAccounts()

  // avoid race conditions in multiple calls to `getAccounts` by calling once
  // then passing result to all renderers
  return Promise.all(window.renderers.map(fn => fn({
    accounts, accountsRaw, setAccounts
  })))
}
