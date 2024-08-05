import network from "@ledgerhq/live-network";
import {
  AdamikAccountState,
  AdamikTransaction,
  AdamikTransactionEncodeResponse,
} from "./adamik.types";
import axios from "axios";

const ADAMIK_API_URL = `https://api.adamik.io/api`;
const ADAMIK_API_KEY = "afd0b43d3c2297ff5771fa6c4d6a0bf2d12405b310ff295d2ac5ad54ff509852";

export const getAccount = async (chainId: string, address: string): Promise<AdamikAccountState> => {
  const response = await network<AdamikAccountState>({
    url: `${ADAMIK_API_URL}/address/state`,
    headers: {
      Authorization: ADAMIK_API_KEY,
      "Content-Type": "application/json",
    },
    method: "POST",
    data: { chainId, address },
  });

  const data = response.data;
  return data;
};

export const transactionEncode = async (
  plainTransaction: AdamikTransaction,
): Promise<AdamikTransactionEncodeResponse | null> => {
  const response = await fetch(`${ADAMIK_API_URL}/transaction/encode`, {
    headers: {
      Authorization: ADAMIK_API_KEY,
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({ transaction: { plain: plainTransaction } }),
  });

  const data = await response.json();
  return data;
};

export type BroadcastResponse = {
  hash: string;
  error?: { message: string };
};

type BroadcastArgs = {
  transaction: AdamikTransaction;
  signature: string;
  encodedTransaction?: string;
};

export const broadcastTransaction = async ({
  transaction,
  signature,
  encodedTransaction,
}: BroadcastArgs): Promise<BroadcastResponse> => {
  console.log({ transaction, signature, encodedTransaction });
  const response = await network<BroadcastResponse>({
    url: `${ADAMIK_API_URL}/transaction/broadcast`,
    headers: {
      Authorization: ADAMIK_API_KEY,
      "Content-Type": "application/json",
    },
    method: "POST",
    data: {
      transaction: {
        plain: transaction,
        encoded: encodedTransaction,
        signature,
      },
    },
  });

  console.log({ response });

  return response.data;
};
