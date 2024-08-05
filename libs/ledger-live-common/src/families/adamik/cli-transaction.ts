import { AccountLike } from "@ledgerhq/types-live";
import { BigNumber } from "bignumber.js";
import flatMap from "lodash/flatMap";
import { Transaction as CosmosTransaction, Transaction } from "./types";

const options = [
  {
    name: "mode",
    type: String,
    desc: "mode of transaction: send, deletage, undelegate",
  },
  {
    name: "fees",
    type: String,
    desc: "how much fees",
  },
  {
    name: "gasLimit",
    type: String,
    desc: "how much gasLimit. default is estimated with the recipient",
  },
  {
    name: "memo",
    type: String,
    desc: "add a memo to a transaction",
  },
  {
    name: "sourceValidator",
    type: String,
    desc: "for redelegate, add a source validator",
  },
  {
    name: "cosmosValidator",
    type: String,
    multiple: true,
    desc: "address of recipient validator that will receive the delegate",
  },
  {
    name: "cosmosAmountValidator",
    type: String,
    multiple: true,
    desc: "Amount that the validator will receive",
  },
];

function inferTransactions(
  transactions: Array<{
    account: AccountLike;
    transaction: CosmosTransaction;
  }>,
  opts: Record<string, any>,
  { inferAmount }: any,
): Transaction[] {
  return flatMap(transactions, ({ transaction, account }) => {
    return {
      ...transaction,
      family: "adamik",
      mode: opts.mode || "send",
      memo: opts.memo,
      fees: opts.fees ? inferAmount(account, opts.fees) : null,
      gas: opts.gasLimit ? new BigNumber(opts.gasLimit) : null,
    } as Transaction;
  });
}

export default {
  options,
  inferTransactions,
};
