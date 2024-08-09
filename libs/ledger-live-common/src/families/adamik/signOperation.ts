import type { AccountBridge, Operation } from "@ledgerhq/types-live";
import { Observable } from "rxjs";
import { withDevice } from "../../hw/deviceAccess";
import { AdamikAccount, Transaction } from "./types";
import { FeeNotLoaded } from "@ledgerhq/errors";
import { transactionEncode } from "./api/adamik";
import { modeToAdamikMode } from "./getEstimatedFees";
import signer from "./hw-sign";
import { buildOptimisticOperation } from "./buildOptimisticOperation";
import { currencyIdToAdamikIdMapper } from "./helpers";
import { CryptoCurrencyId } from "@ledgerhq/types-cryptoassets";

export const signOperation: AccountBridge<Transaction, AdamikAccount>["signOperation"] = ({
  account,
  deviceId,
  transaction,
}) =>
  withDevice(deviceId)(
    transport =>
      new Observable(o => {
        let cancelled;

        async function main() {
          const { fees } = transaction;
          if (!fees) throw new FeeNotLoaded();
          o.next({ type: "device-signature-requested" });

          const encodedTransaction = await transactionEncode({
            ...transaction,
            mode: modeToAdamikMode(transaction.mode),
            amount: transaction.amount.toString(),
            fees: "",
            gas: "",
            memo: transaction.memo || "",
            chainId: currencyIdToAdamikIdMapper(account.currency.id as CryptoCurrencyId),
            senders: [account.freshAddress],
            recipients: [transaction.recipient],
            useMaxAmount: transaction.useAllAmount || false,
            params: {
              pubKey: account.xpub,
            },
            format: "hex",
          });

          console.log(encodedTransaction);

          const encoded = encodedTransaction?.transaction.encoded;

          console.log({ encoded: JSON.stringify(encoded) });

          if (!encoded) {
            throw new Error("failed to encode transaction");
          }

          const signature = await signer(transport, {
            path: account.freshAddressPath,
            message: encoded,
            account,
            transaction,
          });

          console.log({
            signature: Buffer.isBuffer(signature.signature)
              ? signature.signature.toString("hex")
              : signature.signature,
          });

          o.next({ type: "device-signature-granted" });

          o.next({
            type: "signed",
            signedOperation: {
              operation: buildOptimisticOperation(account, transaction),
              signature: Buffer.isBuffer(signature.signature)
                ? signature.signature.toString("hex")
                : signature.signature,
              rawData: { data: JSON.stringify(encodedTransaction) },
            },
          });
        }

        main().then(
          () => o.complete(),
          e => o.error(e),
        );

        return () => {
          cancelled = true;
        };
      }),
  );

export default signOperation;
