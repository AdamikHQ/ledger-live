import { encodeOperationId } from "@ledgerhq/coin-framework/operation";
import { FeeNotLoaded } from "@ledgerhq/errors";
import BigNumber from "bignumber.js";
import { AdamikAccount, AdamikLikeTransaction, AdamikOperation } from "./types";

export const buildOptimisticOperation = (
  account: AdamikAccount,
  transaction: AdamikLikeTransaction,
): AdamikOperation => {
  const { spendableBalance, id, freshAddress, subAccounts } = account;

  const senders = [freshAddress];
  const recipients = [transaction.recipient];
  const { subAccountId, fees } = transaction;

  if (!fees) {
    throw new FeeNotLoaded();
  }

  const value = subAccountId
    ? fees
    : transaction.useAllAmount
      ? spendableBalance
      : transaction.amount.plus(fees);

  const type = "OUT";

  const op: AdamikOperation = {
    id: encodeOperationId(id, "", type),
    hash: "",
    type,
    value,
    fee: fees,
    blockHash: null,
    blockHeight: null,
    senders,
    recipients,
    accountId: id,
    date: new Date(),
    extra: {},
  };

  const tokenAccount = !subAccountId
    ? null
    : subAccounts && subAccounts.find(ta => ta.id === subAccountId);

  if (tokenAccount && subAccountId) {
    op.subOperations = [
      {
        id: `${subAccountId}--OUT`,
        hash: "",
        type: "OUT",
        value: transaction.useAllAmount ? tokenAccount.balance : transaction.amount,
        fee: new BigNumber(0),
        blockHash: null,
        blockHeight: null,
        senders,
        recipients,
        accountId: subAccountId,
        date: new Date(),
        extra: {},
      },
    ];
  }

  return op;
};
