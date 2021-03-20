import parse from 'loose-json'
import { Near, keyStores } from 'near-api-js'

interface Account {
  wallet_location: string;
  public_key?: string;
  account_name: string;
  starting_balance: number;
  current_balance?: number;
  lockup_contract: string;
  delegated_to?: string;
}

interface AccountsCache {
  raw?: string;
  parsed?: Account[];
}

const near = new Near({
  keyStore: new keyStores.InMemoryKeyStore(),
  // @ts-expect-error
  networkId: process.env.NETWORK_ID,
  // @ts-expect-error
  nodeUrl: process.env.NODE_URL,
})

const balancesCache: { [key: string]: number } = {}

/**
 * Check balance that given `lockupId` has in given `poolId`
 *
 * Returns a cached balance. Cache is refreshed on page reload.
 */
async function checkBalance(
  poolId: string,
  lockupId: string
): Promise<number> {
  const cacheKey = poolId+lockupId
  if (balancesCache[cacheKey]) return balancesCache[cacheKey]
  // near-api-js requires instantiating an "account" object, but this is NOT
  // used to sign view functions, and so the lockupId passed in doesn't
  // matter. Passing poolId to be doubly sure that no lockupIds get
  // de-anonymized.
  const account = await near.account(poolId)
  const yocto = await account.viewFunction(
    poolId,
    'get_account_total_balance',
    { account_id: lockupId }
  )
  balancesCache[cacheKey] = yocto / 1e24
  return balancesCache[cacheKey]
}

const onChangeFns: (() => {})[] = []

const accountsCache: AccountsCache = {}

/**
 * Get all accounts
 * @returns an array of Account objects, or null
 */
export async function get(): Promise<null | Account[]> {
  const raw = localStorage.getItem('accounts')
  if (!raw) return null

  if (raw === accountsCache.raw) {
    return accountsCache.parsed as Account[]
  }

  accountsCache.raw = raw
  accountsCache.parsed = await Promise.all(parse(raw).map(
    async (account: Account) => ({
      ...account,
      current_balance: account.delegated_to
        ? await checkBalance(account.delegated_to, account.lockup_contract)
        : undefined
    })
  ))

  return accountsCache.parsed as Account[]
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
export async function set(newAccounts: string) {
  localStorage.setItem('accounts', newAccounts);
  await Promise.all(onChangeFns.map(fn => fn()))
}

/**
 * Add a function to be called any time the data in storage is updated
 */
export function onChange(fn: () => {}) {
  onChangeFns.push(fn)
}
