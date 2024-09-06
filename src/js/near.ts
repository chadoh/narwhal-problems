window.global ||= window;
import { Buffer } from "buffer/";
(window as any).Buffer = Buffer;

import { Near, keyStores } from "near-api-js";

export const near = new Near({
  keyStore: new keyStores.InMemoryKeyStore(),
  networkId: import.meta.env.PUBLIC_NETWORK_ID,
  nodeUrl: import.meta.env.PUBLIC_NODE_URL,
  walletUrl: import.meta.env.PUBLIC_WALLET_URL,
  helperUrl: import.meta.env.PUBLIC_HELPER_URL,
});

/**
 * Make a view call to a NEAR smart contract.
 *
 * near-api-js requires instantiating an "account" object, but this is NOT
 * used to sign view functions. This `view` function will instantiate an
 * account object for the provided `contract`, essentially causing it to view
 * itself.
 */
export const view = async (
  contract: string,
  method: string,
  args: Record<string, any> = {},
): Promise<any> => {
  const account = await near.account(contract);
  return account.viewFunction({
    contractId: contract,
    methodName: method,
    args,
  });
};
