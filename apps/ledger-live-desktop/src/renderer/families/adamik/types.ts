import { LLDCoinFamily } from "../types";

import {
  AdamikAccount,
  Transaction,
  TransactionStatus,
  AdamikOperation,
} from "@ledgerhq/live-common/families/adamik/types";

export type AdamikFamily = LLDCoinFamily<
  AdamikAccount,
  Transaction,
  TransactionStatus,
  AdamikOperation
>;
