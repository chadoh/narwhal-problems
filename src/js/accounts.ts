import parse from 'loose-json'

interface Account {
  wallet_location: string;
  public_key?: string;
  account_name: string;
  starting_balance: number;
  lockup_contract: string;
  delegated_to?: string;
}

const onChangeFns: (() => {})[] = []

/**
 * Get all accounts
 * @returns an array of Account objects, or null
 */
export async function get(): Promise<null | Account[]> {
  const raw = localStorage.getItem('accounts')
  if (raw) return parse(raw)
  return null
}

/**
 * Get raw account data as stored in localStorage.
 * This may have spaces and comments in it.
 */
export async function getRaw(): Promise<null | string> {
  return localStorage.getItem('accounts')
}

/**
 * Set localStorage with new accounts and call on functions passed that have
 * been passed to onChange.
 *
 * @param newAccounts json blob of accounts. Can have whitespace
 */
export async function set(newAccounts) {
  localStorage.setItem('accounts', newAccounts);
  await Promise.all(onChangeFns.map(fn => fn()))
}

/**
 * Add a function to be called any time the data in storage is updated
 */
export function onChange(fn: () => {}) {
  onChangeFns.push(fn)
}
