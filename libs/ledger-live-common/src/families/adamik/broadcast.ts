import { AccountBridge } from "@ledgerhq/types-live";
import { patchOperationWithHash } from "../../operation";
import { broadcastTransaction } from "./api/adamik";
import { Transaction } from "./types";

export const broadcast: AccountBridge<Transaction>["broadcast"] = async ({ signedOperation }) => {
  const { signature, operation, rawData } = signedOperation;
  console.log({ signedOperation });

  const encodedTransaction = JSON.parse(rawData!.data as string);

  console.log({ encodedTransaction });

  const { hash } = await broadcastTransaction({
    transaction: encodedTransaction.transaction.plain,
    signature: signature,
    encodedTransaction: encodedTransaction.transaction.encoded,
  });
  return patchOperationWithHash(operation, hash);
};
