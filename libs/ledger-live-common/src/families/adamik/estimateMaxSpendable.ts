import type { AccountBridge } from "@ledgerhq/types-live";
import { getAbandonSeedAddress } from "@ledgerhq/cryptoassets";
import type { AdamikAccount, Transaction } from "./types";
import { getTransactionStatus } from "./getTransactionStatus";
import { createTransaction } from "./createTransaction";
import { getMainAccount } from "../../account";

export const estimateMaxSpendable: AccountBridge<
  Transaction,
  AdamikAccount
>["estimateMaxSpendable"] = async ({ account, parentAccount, transaction }) => {
  const mainAccount = getMainAccount(account, parentAccount);

  const t = {
    ...createTransaction(account),
    ...transaction,
    recipient: transaction?.recipient || getAbandonSeedAddress(mainAccount.currency.id),
    useAllAmount: true,
  };

  const { amount } = await getTransactionStatus(mainAccount, t);
  return amount;
};

export default estimateMaxSpendable;
