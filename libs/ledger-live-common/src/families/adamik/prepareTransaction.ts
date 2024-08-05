import { AccountBridge } from "@ledgerhq/types-live";
import { BigNumber } from "bignumber.js";
import isEqual from "lodash/isEqual";
import { estimateMaxSpendable } from "./estimateMaxSpendable";
import type { AdamikAccount, Transaction } from "./types";
import { getEstimatedFees } from "./getEstimatedFees";

export const prepareTransaction: AccountBridge<
  Transaction,
  AdamikAccount
>["prepareTransaction"] = async (account, transaction) => {
  let recipient: string;
  let amount: BigNumber;
  if (transaction.mode === "send") {
    recipient = transaction.recipient;
    amount = transaction.useAllAmount
      ? await estimateMaxSpendable({ account, transaction })
      : transaction.amount;
  }

  const fees = await getEstimatedFees({ account, transaction });

  const newTx = { ...transaction, fees };
  return isEqual(transaction, newTx) ? transaction : newTx;
};

export default prepareTransaction;
