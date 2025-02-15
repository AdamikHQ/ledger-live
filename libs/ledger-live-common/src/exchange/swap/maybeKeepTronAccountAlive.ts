import { SwapTransactionType } from "./types";
import { MaybeKeepTronAccountAlive } from "@ledgerhq/errors";
export const maybeKeepTronAccountAlive = (
  swapTransaction: SwapTransactionType,
): Error | undefined => {
  if (
    swapTransaction?.swap?.from?.currency?.id === "tron" &&
    swapTransaction.swap.from.account?.balance
      .minus(swapTransaction.swap.from?.amount || 0)
      .lt(1_200_000) // keep 1.1 TRX for fees and 0.1 TRX for keeping the account alive
  ) {
    return new MaybeKeepTronAccountAlive("PREVENT_RECEIVING_TRC20_ON_EMPTY_ACCOUNT", {
      links: [
        "https://support.ledger.com/hc/en-us/articles/6516823445533-Activate-Tron-account-to-send-or-receive-Tron-tokens?support=true",
      ],
    });
  }
};
