import { CryptoCurrencyId } from "@ledgerhq/types-cryptoassets";

export const addPrefixToken = (tokenId: string, currencyId: CryptoCurrencyId, tokenType: string) =>
  `${currencyId}/${tokenType.toLowerCase()}/${tokenId}`;

export const extractTokenId = (tokenId: string) => {
  return tokenId.split("/")[2];
};
