import { toNear } from "./utils";
import { view } from "./near";
import { getStatus, ValidatorStatus } from "./validators";

// accounts as they exist in local storage
interface RawAccount {
  wallet_location: string;
  public_key?: string;
  account_name: string;
  hd_path?: string;
  starting_balance: number;
  lockup_contract: string;
  delegated_to?: string;
}

type Account = RawAccount & {
  lockup_info:
    | {}
    | {
        "Vesting Info": any;
        "Termination Status": any;
        "Liquid Balance": any;
        "Locked Amount": number;
        "Owner's Balance": number;
        "Terminated Unvested Balance": number;
      };
  current_balance?: number;
  validator_status?: ValidatorStatus;
};

interface AccountsCache {
  raw: string;
  undecorated: RawAccount[];
  decorated: Account[];
}

const onChangeFns: (() => {})[] = [];

const accountsCache: AccountsCache = {
  raw: "[]",
  undecorated: [],
  decorated: [],
};

async function updateAccountsCache(): Promise<void> {
  const raw = localStorage.getItem("accounts");

  if (!raw || raw === accountsCache.raw) {
    return;
  }

  accountsCache.raw = raw;
  accountsCache.undecorated = JSON.parse(raw) as RawAccount[];
  accountsCache.decorated = await Promise.all(
    accountsCache.undecorated.map(
      async (account: RawAccount): Promise<Account> => ({
        ...account,
        lockup_info: !account.lockup_contract
          ? {}
          : {
              "Vesting Info": await view(
                account.lockup_contract,
                "get_vesting_information"
              ),
              "Termination Status": await view(
                account.lockup_contract,
                "get_termination_status"
              ),
              "Liquid Balance": toNear(
                await view(account.lockup_contract, "get_liquid_owners_balance")
              ),
              "Locked Amount": toNear(
                await view(account.lockup_contract, "get_locked_amount")
              ),
              "Owners Balance": toNear(
                await view(account.lockup_contract, "get_owners_balance")
              ),
              "Terminated Unvested Balance": toNear(
                await view(
                  account.lockup_contract,
                  "get_terminated_unvested_balance"
                )
              ),
            },
        ...(!account.delegated_to
          ? {}
          : {
              validator_status: await getStatus(account.delegated_to),
            }),
        ...(!account.lockup_contract
          ? {}
          : {
              current_balance: await view(
                account.lockup_contract,
                "get_balance"
              ),
            }),
      })
    )
  );
}

/**
 * Get all accounts
 *
 * @param style 'raw' | 'undecorated' | 'decorated'; @default 'decorated'. 'decorated' returns {@link Account}s with computed fields like `lockup_info`. 'undecorated' returns {@link RawAccount}s with only the values stored in localStorage. 'raw' returns the unparsed string from localStorage.
 */
export async function get(
  style: "raw" | "undecorated" | "decorated" = "decorated"
): Promise<Account[] | RawAccount[] | string> {
  if (!["raw", "undecorated", "decorated"].includes(style)) {
    throw new Error(
      `Invalid argument to \`get\`; must be 'raw' | 'undecorated' | 'decorated'; got ${style}`
    );
  }
  await updateAccountsCache();
  return accountsCache[style];
}

/**
 * Set localStorage with new accounts and call on functions passed that have
 * been passed to onChange.
 *
 * @param newAccounts array of accounts
 */
export async function set(newAccounts: RawAccount[]) {
  localStorage.setItem("accounts", JSON.stringify(newAccounts));
  await updateAccountsCache();
  await Promise.all(onChangeFns.map((fn) => fn()));
}

/**
 * Add a function to be called any time the data in storage is updated
 */
export function onChange(fn: () => {}) {
  onChangeFns.push(fn);
}
