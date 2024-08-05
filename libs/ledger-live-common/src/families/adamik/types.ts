import {
  Account,
  AccountRaw,
  Operation,
  OperationExtra,
  OperationExtraRaw,
  OperationRaw,
  TransactionCommon,
  TransactionCommonRaw,
  TransactionStatusCommon,
  TransactionStatusCommonRaw,
} from "@ledgerhq/types-live";
import type { BigNumber } from "bignumber.js";

export type AdamikLikeNetworkInfo = {
  family: string;
  fees: BigNumber;
};

export type AdamikLikeNetworkInfoRaw = {
  family: string;
  fees: string;
};

export type NetworkInfo = AdamikLikeNetworkInfo & {
  family: "adamik";
};

export type NetworkInfoRaw = AdamikLikeNetworkInfoRaw & {
  family: "adamik";
};

type AdamikOperationMode = "send";

export type AdamikLikeTransaction = TransactionCommon & {
  family: string;
  mode: AdamikOperationMode;
  networkInfo: AdamikLikeNetworkInfo | null | undefined;
  fees: BigNumber | null | undefined;
  gas: BigNumber | null | undefined;
  memo: string | null | undefined;
};

export type Transaction = AdamikLikeTransaction & {
  family: "adamik";
  networkInfo: NetworkInfo | null | undefined;
};

export type AdamikLikeTransactionRaw = TransactionCommonRaw & {
  family: string;
  mode: AdamikOperationMode;
  networkInfo: AdamikLikeNetworkInfoRaw | null | undefined;
  fees: string | null | undefined;
  gas: string | null | undefined;
  memo: string | null | undefined;
};

export type AdamikOperation = Operation<{}>;
export type AdamikOperationRaw = OperationRaw<{}>;

export type AdamikOperationExtra = {
  memo?: string | undefined;
  assetId?: string | undefined;
};
export function isAdamikOperationExtra(op: OperationExtra): op is AdamikOperationExtra {
  return op !== null && typeof op === "object" && ("memo" in op || "assetId" in op);
}

export type AdamikOperationExtraRaw = {
  memo?: string | undefined;
  assetId?: string | undefined;
};
export function isAdamikOperationExtraRaw(op: OperationExtraRaw): op is AdamikOperationExtraRaw {
  return op !== null && typeof op === "object" && ("memo" in op || "assetId" in op);
}

export type TransactionRaw = AdamikLikeTransactionRaw & {
  family: "adamik";
  networkInfo: NetworkInfoRaw | null | undefined;
};

export type StatusErrorMap = {
  recipient?: Error;
  amount?: Error;
  fees?: Error;
  validators?: Error;
  delegate?: Error;
  redelegation?: Error;
  unbonding?: Error;
  claimReward?: Error;
  feeTooHigh?: Error;
};

export type AdamikAccount = Account & {
  adamikResources: AdamikResources;
};
export type AdamikAccountRaw = AccountRaw & {
  adamikResources: AdamikResourcesRaw;
};
export type AdamikResources = {};
export type AdamikResourcesRaw = {};

export type TransactionStatus = TransactionStatusCommon;

export type TransactionStatusRaw = TransactionStatusCommonRaw;
