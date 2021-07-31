import near from './near'
import { getStatus, ValidatorStatus } from './validators'

// accounts as they exist in local storage
interface RawAccount {
  wallet_location: string;
  public_key?: string;
  account_name: string;
  hd_path?: string;
  starting_balance: number;
  lockup_contract: string;
  delegated_to?: string;
};

type Account = RawAccount & {
  current_balance?: number;
  validator_status?: ValidatorStatus
}

interface AccountsCache {
  raw?: string;
  parsed?: Account[];
}

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
 * @returns Accounts an array of Account objects, or null
 */
export async function get(): Promise<Account[]> {
  const raw = localStorage.getItem('accounts')
  if (!raw) return []

  if (raw === accountsCache.raw) {
    return accountsCache.parsed as Account[]
  }

  accountsCache.raw = raw
  accountsCache.parsed = await Promise.all((JSON.parse(raw) as RawAccount[]).map(
    async (account: Account) => {
      if (account.delegated_to) {
        account.current_balance = await checkBalance(
          account.delegated_to, account.lockup_contract
        )
        account.validator_status = await getStatus(account.delegated_to)
      }
      return account
    }
  ))

  return accountsCache.parsed
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
 * @param newAccounts array of accounts
 */
export async function set(newAccounts: RawAccount[]) {
  localStorage.setItem('accounts', JSON.stringify(newAccounts));
  await Promise.all(onChangeFns.map(fn => fn()))
}

/**
 * Add a function to be called any time the data in storage is updated
 */
export function onChange(fn: () => {}) {
  onChangeFns.push(fn)
}
