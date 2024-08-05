interface Token {
  chainId: string;
  type: string;
  id: string;
  name: string;
  ticker: string;
  decimals: number;
  contractAddress?: string;
}

interface TokenAmount {
  amount: string;
  value: string;
  token: Token;
}

interface ValidatorPosition {
  validatorAddresses: string[];
  amount: string;
  status: string;
  completionDate?: number;
}

interface Reward {
  tokenId?: string;
  validatorAddress: string;
  amount: string;
}

interface AdamikBalances {
  native: {
    available: string;
    total: string;
  };
  tokens: TokenAmount[];
  staking?: {
    total: string;
    locked: string;
    unlocking: string;
    unlocked: string;
    positions?: ValidatorPosition[];
    rewards: {
      native: Reward[];
      tokens: Reward[];
    };
  };
}

export type AdamikAccountState = {
  chainId: string;
  address: string;
  balances: AdamikBalances;
};

export enum AdamikTransactionMode {
  TRANSFER = "transfer",
  TRANSFER_TOKEN = "transferToken",
}

export type AdamikTransaction = {
  mode: AdamikTransactionMode;
  senders: string[];
  recipients: string[];
  useMaxAmount: boolean;
  chainId: string;
  amount: string;
  fees?: string;
  gas?: string;
  format?: string;
  params?: {
    pubKey?: string;
  };
  memo?: string;
};

export type AdamikTransactionEncodeResponse = {
  transaction: {
    plain: AdamikTransaction;
    encoded: string;
    status: { errors: { message: string }[]; warnings: { message: string }[] };
  };
};
