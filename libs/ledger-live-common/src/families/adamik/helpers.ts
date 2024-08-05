import { CryptoCurrencyId } from "@ledgerhq/types-cryptoassets";

export const currencyIdToAdamikIdMapper = (currencyId: CryptoCurrencyId): string => {
  switch (currencyId) {
    case "cosmos":
      return "cosmoshub";
  }
  return currencyId;
};
