import BigNumber from "bignumber.js";
import { transactionEncode } from "./api/adamik";
import { AdamikTransactionMode } from "./api/adamik.types";
import { AdamikAccount, AdamikLikeTransaction } from "./types";
import { CryptoCurrencyId } from "@ledgerhq/types-cryptoassets";
import { currencyIdToAdamikIdMapper } from "./helpers";

export const modeToAdamikMode = (mode: string): AdamikTransactionMode => {
  switch (mode) {
    case "send":
      return AdamikTransactionMode.TRANSFER;
    default:
      throw new Error(`Unknown mode ${mode}`);
  }
};

export const getEstimatedFees = async ({
  account,
  transaction,
}: {
  account: AdamikAccount;
  transaction: AdamikLikeTransaction;
}): Promise<BigNumber> => {
  const tx = {
    ...transaction,
  };
  try {
    const result = await transactionEncode({
      ...tx,
      mode: modeToAdamikMode(tx.mode),
      amount: tx.amount.toString(),
      fees: "",
      gas: "",
      memo: tx.memo || "",
      chainId: currencyIdToAdamikIdMapper(account.currency.id as CryptoCurrencyId),
      senders: [account.freshAddress],
      recipients: [tx.recipient],
      useMaxAmount: tx.useAllAmount || false,
      params: {
        pubKey: account.xpub,
      },
    });
    return new BigNumber(result?.transaction.plain.fees || 0);
  } catch (e) {
    return new BigNumber(0);
  }
};
