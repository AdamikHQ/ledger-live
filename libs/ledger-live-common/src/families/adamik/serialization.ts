import type { Account, AccountRaw, OperationExtra, OperationExtraRaw } from "@ledgerhq/types-live";
import { BigNumber } from "bignumber.js";
import { AdamikAccount, AdamikAccountRaw, AdamikResources, AdamikResourcesRaw } from "./types";

function toResourcesRaw(r: AdamikResources): AdamikResourcesRaw {
  return {};
}
function fromResourcesRaw(r: AdamikResourcesRaw): AdamikResources {
  return {};
}

export function assignToAccountRaw(account: Account, accountRaw: AccountRaw): void {
  const adamikAccount = account as AdamikAccount;
  const adamikAccountRaw = accountRaw as AdamikAccountRaw;
  if (adamikAccount.adamikResources) {
    adamikAccountRaw.adamikResources = toResourcesRaw(adamikAccount.adamikResources);
  }
}

export function assignFromAccountRaw(accountRaw: AccountRaw, account: Account): void {
  const adamikResourcesRaw = (accountRaw as AdamikAccountRaw).adamikResources;
  const adamikAccount = account as AdamikAccount;
  if (adamikResourcesRaw) {
    adamikAccount.adamikResources = fromResourcesRaw(adamikResourcesRaw);
  }
}

export function fromOperationExtraRaw(extraRaw: OperationExtraRaw) {
  const extra = {};

  return extra;
}

export function toOperationExtraRaw(extra: OperationExtra) {
  const extraRaw = {};

  return extraRaw;
}
