import { BigNumber } from "bignumber.js";
import { AccountBridge } from "@ledgerhq/types-live";
import type { Transaction } from "./types";

/**
 * Create an empty transaction
 *
 * @returns {Transaction}
 */
export const createTransaction: AccountBridge<Transaction>["createTransaction"] = () => ({
  family: "adamik",
  mode: "send",
  amount: new BigNumber(0),
  fees: null,
  gas: null,
  recipient: "",
  useAllAmount: false,
  networkInfo: null,
  memo: null,
});

export default createTransaction;
