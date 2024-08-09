import { CryptoCurrencyId } from "@ledgerhq/types-cryptoassets";

export const currencyIdToAdamikIdMapper = (currencyId: CryptoCurrencyId | "osmo"): string => {
  switch (currencyId) {
    case "cosmos":
      return "cosmoshub";
    case "osmo":
      return "osmosis";
    case "zksync_sepolia":
      return "zksync-sepolia";
  }
  return currencyId;
};
