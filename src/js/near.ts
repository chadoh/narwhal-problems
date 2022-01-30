import { Near, keyStores } from "near-api-js";

export const near = new Near({
  keyStore: new keyStores.InMemoryKeyStore(),
  // @ts-expect-error
  networkId: process.env.NETWORK_ID,
  // @ts-expect-error
  nodeUrl: process.env.NODE_URL,
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
  args: Record<string, any> = {}
): Promise<any> => {
  const account = await near.account(contract);
  return account.viewFunction(contract, method, args);
};
