import { AccountBridge } from "@ledgerhq/types-live";
import { BigNumber } from "bignumber.js";
import { Transaction, TransactionStatus } from "./types";
import { transactionEncode } from "./api/adamik";
import { modeToAdamikMode } from "./getEstimatedFees";
import { currencyIdToAdamikIdMapper } from "./helpers";
import { CryptoCurrencyId } from "@ledgerhq/types-cryptoassets";
import {
  FeeTooHigh,
  InvalidAddressBecauseDestinationIsAlsoSource,
  NotEnoughBalance,
} from "@ledgerhq/errors";

export const getTransactionStatus: AccountBridge<
  Transaction,
  any,
  TransactionStatus
>["getTransactionStatus"] = async (account, transaction) => {
  const errors: Record<string, Error> = {};
  const warnings: Record<string, Error> = {};
  const estimatedFees = transaction.fees || new BigNumber(0);
  let amount = transaction.useAllAmount
    ? account.spendableBalance.minus(estimatedFees)
    : transaction.amount;

  let totalSpent = amount.plus(estimatedFees);

  const result = await transactionEncode({
    ...transaction,
    mode: modeToAdamikMode(transaction.mode),
    amount: transaction.amount.toString(),
    fees: transaction.fees?.toString() || "",
    gas: "",
    memo: transaction.memo || "",
    chainId: currencyIdToAdamikIdMapper(account.currency.id as CryptoCurrencyId),
    senders: [account.freshAddress],
    recipients: [transaction.recipient],
    useMaxAmount: transaction.useAllAmount || false,
    params: {
      pubKey: account.xpub,
    },
  });

  const status = result?.transaction.status;

  status?.errors.forEach(error => {
    switch (error.message) {
      case "Balance is too low":
        errors.amount = new NotEnoughBalance();
        break;
    }
  });

  status?.warnings.forEach(warning => {
    switch (warning.message) {
      case "Same sender and recipient address":
        warnings.recipient = new InvalidAddressBecauseDestinationIsAlsoSource();
        break;
      case "Network fees are above 10% of the amount":
        warnings.feeTooHigh = new FeeTooHigh();
        break;
    }
  });

  return {
    errors,
    warnings,
    estimatedFees,
    amount,
    totalSpent,
  };
};
