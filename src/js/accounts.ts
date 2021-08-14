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
  raw: string;
  parsed: RawAccount[];
  decorated: Account[];
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
  const cacheKey = poolId + lockupId
  if (balancesCache[cacheKey]) return balancesCache[cacheKey]!
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
  return balancesCache[cacheKey]!
}

const onChangeFns: (() => {})[] = []

const accountsCache: AccountsCache = {
  raw: '[]',
  parsed: [],
  decorated: [],
}

async function updateAccountsCache(): Promise<void> {
  const raw = localStorage.getItem('accounts')

  if (!raw || raw === accountsCache.raw) {
    return;
  }

  accountsCache.raw = raw
  accountsCache.parsed = JSON.parse(raw) as RawAccount[]
  accountsCache.decorated = await Promise.all(accountsCache.parsed.map(
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
}

/**
 * Get all accounts
 * @returns array of {@link Account} objects
 */
export async function get(): Promise<Account[]> {
  await updateAccountsCache()
  return accountsCache.decorated
}

/**
 * Get raw accounts, without computed values
 * @returns array of {@link RawAccount} objects
 */
export async function getRaw(): Promise<RawAccount[]> {
  await updateAccountsCache()
  return accountsCache.parsed
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
