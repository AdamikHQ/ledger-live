import BigNumber from "bignumber.js";
import { emptyHistoryCache, encodeAccountId } from "../../account";
import { GetAccountShape, makeScanAccounts, makeSync } from "../../bridge/jsHelpers";
import { getAccount } from "./api/adamik";
import { AdamikAccount } from "./types";
import { currencyIdToAdamikIdMapper } from "./helpers";
import { CryptoCurrency, CryptoCurrencyId, TokenCurrency } from "@ledgerhq/types-cryptoassets";
import { findTokenById, listTokensForCryptoCurrency } from "@ledgerhq/cryptoassets/tokens";
import { Account, SyncConfig, TokenAccount } from "@ledgerhq/types-live";
import { AdamikAccountState } from "./api/adamik.types";
import { addPrefixToken, extractTokenId } from "./tokens";
import { promiseAllBatched } from "@ledgerhq/live-promise";

async function buildSubAccount({
  parentAccountId,
  token,
  balance,
}: {
  parentAccountId: string;
  token: TokenCurrency;
  balance: BigNumber;
}) {
  const extractedId = extractTokenId(token.id);
  const tokenAccountId = parentAccountId + "+" + extractedId;

  const operations = [];

  const tokenAccount: TokenAccount = {
    type: "TokenAccount",
    id: tokenAccountId,
    parentId: parentAccountId,
    token,
    operationsCount: operations.length,
    operations,
    pendingOperations: [],
    balance,
    spendableBalance: balance,
    swapHistory: [],
    creationDate: new Date(),
    balanceHistoryCache: emptyHistoryCache,
  };
  return tokenAccount;
}

type buildSubAccountsProps = {
  currency: CryptoCurrency;
  syncConfig: SyncConfig;
  initialAccount: Account | null | undefined;
  balances: AdamikAccountState["balances"];
  accountId: string;
};
const buildSubAccounts = async ({
  currency,
  syncConfig,
  initialAccount,
  balances,
  accountId,
}: buildSubAccountsProps) => {
  const { blacklistedTokenIds = [] } = syncConfig;
  if (listTokensForCryptoCurrency(currency).length === 0) return undefined;
  const tokenAccounts: TokenAccount[] = [];
  const existingAccountByTicker: { [ticker: string]: TokenAccount } = {}; // used for fast lookup
  const existingAccountTickers: string[] = []; // used to keep track of ordering

  if (initialAccount && initialAccount.subAccounts) {
    for (const existingSubAccount of initialAccount.subAccounts) {
      if (existingSubAccount.type === "TokenAccount") {
        const { ticker, id } = existingSubAccount.token;

        if (!blacklistedTokenIds.includes(id)) {
          existingAccountTickers.push(ticker);
          existingAccountByTicker[ticker] = existingSubAccount;
        }
      }
    }
  }

  await promiseAllBatched(3, balances.tokens, async asset => {
    const token = findTokenById(
      addPrefixToken(asset.token.id, currency.id as CryptoCurrencyId, asset.token.type),
    );

    if (token && !blacklistedTokenIds.includes(token.id)) {
      const tokenAccount = await buildSubAccount({
        parentAccountId: accountId,
        token,
        balance: new BigNumber(asset.amount),
      });
      if (tokenAccount) tokenAccounts.push(tokenAccount);
    }
  });

  tokenAccounts.sort((a, b) => {
    const i = existingAccountTickers.indexOf(a.token.ticker);
    const j = existingAccountTickers.indexOf(b.token.ticker);
    if (i === j) return 0;
    if (i < 0) return 1;
    if (j < 0) return -1;
    return i - j;
  });

  return tokenAccounts;
};

export const getAccountShape: GetAccountShape<AdamikAccount> = async (info, syncConfig) => {
  const { address, initialAccount, currency, derivationMode } = info;
  const accountId = encodeAccountId({
    type: "js",
    version: "2",
    currencyId: currency.id,
    xpubOrAddress: address,
    derivationMode,
  });

  const adamikAccount = await getAccount(
    currencyIdToAdamikIdMapper(currency.id as CryptoCurrencyId),
    address,
  );

  const { balances } = adamikAccount;

  const operations = [];
  let balance = new BigNumber(balances.native.total);
  let spendableBalance = new BigNumber(balances.native.available);

  const shape = {
    id: accountId,
    xpub: address,
    balance: balance,
    spendableBalance,
    operationsCount: operations.length,
    blockHeight: 0,
  };

  const subAccounts = await buildSubAccounts({
    currency,
    accountId,
    initialAccount,
    balances,
    syncConfig,
  });

  return { ...shape, operations, subAccounts };
};

export const scanAccounts = makeScanAccounts({ getAccountShape });
export const sync = makeSync({ getAccountShape });
