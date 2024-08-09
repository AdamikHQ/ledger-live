import Cosmos from "@ledgerhq/hw-app-cosmos";
import type { Resolver } from "../../hw/getAddress/types";
import Algorand from "@ledgerhq/hw-app-algorand";
import Eth from "@ledgerhq/hw-app-eth";

const resolver: Resolver = async (transport, { path, verify, currency }) => {
  let signerResponse: any;
  switch (currency.id) {
    case "algorand":
      const algorandSigner = new Algorand(transport);
      signerResponse = await algorandSigner.getAddress(path, verify || false);
      break;
    case "cosmos":
    case "osmo":
    case "celestia":
      const cosmosSigner = new Cosmos(transport);
      signerResponse = await cosmosSigner.getAddress(path, currency.id, verify || false);
      break;
    case "ethereum":
    case "base":
    case "zksync":
    case "zksync_sepolia":
      const ethSigner = new Eth(transport);
      const chainId = currency?.ethereumLikeInfo?.chainId.toString();
      signerResponse = await ethSigner.getAddress(path, verify, false, chainId);
      break;
  }

  if (!signerResponse) {
    throw new Error(`hw-getAddress for ${currency.id} not implemented`);
  }

  return {
    address: signerResponse.address,
    publicKey: signerResponse.publicKey,
    path,
  };
};

export default resolver;
