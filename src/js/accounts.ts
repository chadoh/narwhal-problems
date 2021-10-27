import {view} from './near'
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
  vesting_info: any;
}

interface AccountsCache {
  raw: string;
  undecorated: RawAccount[];
  decorated: Account[];
}

function toNear(yoctoNear: number | string): number {
  return Number(yoctoNear) / 1e24
}

const onChangeFns: (() => {})[] = []

const accountsCache: AccountsCache = {
  raw: '[]',
  undecorated: [],
  decorated: [],
}

async function updateAccountsCache(): Promise<void> {
  const raw = localStorage.getItem('accounts')

  if (!raw || raw === accountsCache.raw) {
    return;
  }

  accountsCache.raw = raw
  accountsCache.undecorated = JSON.parse(raw) as RawAccount[]
  accountsCache.decorated = await Promise.all(accountsCache.undecorated.map(
    async (rawAccount: RawAccount) => {
      // make copy of object, otherwise new array stores references to objects in old array
      const account = {...rawAccount} as Account
      if (account.delegated_to) {
        account.current_balance = toNear(await view(
          account.delegated_to,
          'get_account_total_balance',
          { account_id: account.lockup_contract }
        ))
        account.validator_status = await getStatus(account.delegated_to)
      }
      if (account.lockup_contract) {
        account.vesting_info = await view(account.lockup_contract, 'get_vesting_information')
      }
      return account
    }
  ))
}

/**
 * Get all accounts
 *
 * @param style 'raw' | 'undecorated' | 'decorated'; @default 'decorated'. 'decorated' returns {@link Account}s with computed fields like `validator_status`. 'undecorated' returns {@link RawAccount}s with only the values stored in localStorage. 'raw' returns the unparsed string from localStorage.
 */
export async function get(
  style: 'raw' | 'undecorated' | 'decorated' = 'decorated'
): Promise<Account[] | RawAccount[] | string> {
  if (!['raw', 'undecorated', 'decorated'].includes(style)) {
    throw new Error(
      `Invalid argument to \`get\`; must be 'raw' | 'undecorated' | 'decorated'; got ${style}`
    )
  }
  await updateAccountsCache()
  return accountsCache[style]
}

/**
 * Set localStorage with new accounts and call on functions passed that have
 * been passed to onChange.
 *
 * @param newAccounts array of accounts
 */
export async function set(newAccounts: RawAccount[]) {
  localStorage.setItem('accounts', JSON.stringify(newAccounts));
  await updateAccountsCache()
  await Promise.all(onChangeFns.map(fn => fn()))
}

/**
 * Add a function to be called any time the data in storage is updated
 */
export function onChange(fn: () => {}) {
  onChangeFns.push(fn)
}
