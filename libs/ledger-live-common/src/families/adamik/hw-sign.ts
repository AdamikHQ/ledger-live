import Algorand from "@ledgerhq/hw-app-algorand";
import Transport from "@ledgerhq/hw-transport";
import { CryptoCurrency } from "@ledgerhq/types-cryptoassets";
import { CosmosApp } from "@zondax/ledger-cosmos-js";
import Eth from "@ledgerhq/hw-app-eth";

type SignerArgs = {
  path: string;
  message: string;
  currency: CryptoCurrency;
};

const signer = async (
  transport: Transport,
  { path, message, currency }: SignerArgs,
): Promise<{ signature: Buffer; returnCode?: number }> => {
  let signerResponse: any;
  switch (currency.id) {
    case "algorand":
      const algorandSigner = new Algorand(transport);
      signerResponse = await algorandSigner.sign(path, message);
      break;
    case "cosmos":
    case "celestia":
      const cosmosSigner = new CosmosApp(transport);
      const cosmosPath = path.split("/").map(p => parseInt(p.replace("'", "")));
      signerResponse = await cosmosSigner.sign(
        cosmosPath,
        Buffer.from(message, "hex"),
        currency.id,
      );
      break;
    case "base":
    case "base_sepolia":
      const ethSigner = new Eth(transport);
      const chainId = currency?.ethereumLikeInfo?.chainId.toString();
      break;
  }

  if (!signerResponse) {
    throw new Error(`signer for ${currency.id} not implemented`);
  }

  return {
    signature: signerResponse.signature,
    returnCode: signerResponse?.return_code || undefined,
  };
};

export default signer;
