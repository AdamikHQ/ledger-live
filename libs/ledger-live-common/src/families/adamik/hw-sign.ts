import { isNFTActive } from "@ledgerhq/coin-framework/nft/support";
import Algorand from "@ledgerhq/hw-app-algorand";
import Eth from "@ledgerhq/hw-app-eth";
import { LoadConfig, ResolutionConfig } from "@ledgerhq/hw-app-eth/lib/services/types";
import Transport from "@ledgerhq/hw-transport";
import { getEnv } from "@ledgerhq/live-env";
import { CosmosApp } from "@zondax/ledger-cosmos-js";
import { AdamikAccount, Transaction } from "./types";

type SignerArgs = {
  path: string;
  message: string;
  account: AdamikAccount;
  transaction: Transaction;
};

const signer = async (
  transport: Transport,
  { path, message, account, transaction }: SignerArgs,
): Promise<{ signature: Buffer; returnCode?: number }> => {
  let signerResponse: any;
  const { currency } = account;
  switch (currency.id) {
    case "algorand":
      const algorandSigner = new Algorand(transport);
      signerResponse = await algorandSigner.sign(path, message);
      break;
    case "cosmos":
    case "osmo":
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
    case "zksync_sepolia":
      const ethSigner = new Eth(transport);
      const loadConfig: LoadConfig = {
        cryptoassetsBaseURL: getEnv("DYNAMIC_CAL_BASE_URL"),
        nftExplorerBaseURL: getEnv("NFT_ETH_METADATA_SERVICE") + "/v1/ethereum",
      };
      const resolutionConfig: ResolutionConfig = {
        externalPlugins: true,
        erc20: true,
        nft: isNFTActive(account.currency),
        domains: transaction.recipientDomain ? [transaction.recipientDomain] : [],
      };
      ethSigner.setLoadConfig(loadConfig);
      const sig = await ethSigner.clearSignTransaction(
        path,
        message.slice(2),
        resolutionConfig,
        true,
      );

      signerResponse = { signature: "0x" + sig.r + sig.s + sig.v };
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
