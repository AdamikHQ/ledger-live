import type { AccountBridge, CurrencyBridge, Operation } from "@ledgerhq/types-live";
import { makeAccountBridgeReceive } from "../../../bridge/jsHelpers";
import { createTransaction } from "../createTransaction";
import { estimateMaxSpendable } from "../estimateMaxSpendable";
import { getTransactionStatus } from "../getTransactionStatus";
import {
  assignFromAccountRaw,
  assignToAccountRaw,
  fromOperationExtraRaw,
  toOperationExtraRaw,
} from "../serialization";
import { signOperation } from "../signOperation";
import { scanAccounts, sync } from "../synchronisation";
import type { AdamikAccount, Transaction, TransactionStatus } from "../types";
import { defaultUpdateTransaction } from "@ledgerhq/coin-framework/lib/bridge/jsHelpers";
import prepareTransaction from "../prepareTransaction";
import { broadcast } from "../broadcast";
import { hydrate, preload } from "../preload";
import { isEqual } from "lodash";

const receive = makeAccountBridgeReceive();

const getPreloadStrategy = _currency => ({
  preloadMaxAge: 30 * 1000,
});

const currencyBridge: CurrencyBridge = {
  getPreloadStrategy,
  preload: preload,
  hydrate: hydrate,
  scanAccounts,
};

const accountBridge: AccountBridge<Transaction, AdamikAccount, TransactionStatus> = {
  createTransaction,
  updateTransaction: (t, patch) => {
    const patched = { ...t, ...patch };
    return isEqual(t, patched) ? t : patched;
  },
  prepareTransaction,
  estimateMaxSpendable,
  getTransactionStatus,
  sync,
  receive,
  signOperation,
  assignFromAccountRaw,
  assignToAccountRaw,
  broadcast,
  fromOperationExtraRaw,
  toOperationExtraRaw,
};

export default {
  currencyBridge,
  accountBridge,
};
