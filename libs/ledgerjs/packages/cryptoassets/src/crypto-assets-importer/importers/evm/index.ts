import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { fetchTokens } from "../../fetch";
import { cryptocurrenciesById } from "../../../currencies";

export type EVMToken = [
  string, // parent currecncy id
  string, // token
  string, // ticker
  number, // precision
  string, // name
  string, // ledgerSignature
  string, // contract address
  boolean, // disabled counter values
  boolean, // delisted
  string?, // countervalue_ticker (legacy)
  string?, // coumpound_for (legacy)
];

const chainNames = new Map<number, string>();

export const importTokenByChainId = async (outputDir: string, chainId: number) => {
  try {
    console.log(`importing chain with chainId: ${chainId}...`);
    const [erc20, hash] = await fetchTokens<EVMToken[]>(`evm/${chainId}/erc20.json`);
    const [erc20Signatures, signatureHash] = await fetchTokens<string>(
      `evm/${chainId}/erc20-signatures.json`,
    );
    const indexTsStringified = `export { default as tokens } from "./erc20.json";
export { default as signatures } from "./erc20-signatures.json";
${hash ? `export { default as hash } from "./erc20-hash.json";` : ""}
${signatureHash ? `export { default as signaturesHash } from "./erc20-signatures-hash.json";` : ""}
`;

    if (erc20 && erc20Signatures) {
      const dirPath = path.join(outputDir, "evm", chainId.toString());
      if (!existsSync(dirPath)) {
        await fs.mkdir(dirPath, { recursive: true });
      }

      const [coinName] = erc20[0];
      chainNames.set(chainId, coinName);
      await fs.writeFile(path.join(dirPath, "erc20.json"), JSON.stringify(erc20));
      if (hash) {
        await fs.writeFile(path.join(dirPath, "erc20-hash.json"), JSON.stringify(hash));
      }
      if (signatureHash) {
        await fs.writeFile(
          path.join(dirPath, "erc20-signatures-hash.json"),
          JSON.stringify(signatureHash),
        );
      }

      await fs.writeFile(
        path.join(dirPath, "erc20-signatures.json"),
        JSON.stringify(erc20Signatures),
      );
      await fs.writeFile(path.join(dirPath, "index.ts"), indexTsStringified);

      console.log(`importing chain with chainId: ${chainId} (${coinName}) success`);
    }
  } catch (err) {
    console.error(err);
  }
};

export const importEVMTokens = async (outputDir: string) => {
  console.log("Importing evm tokens...");

  const supportedChainIds = Object.values(cryptocurrenciesById)
    .filter(cryptocurrency => cryptocurrency.ethereumLikeInfo?.chainId)
    .map(cryptocurrency => cryptocurrency.ethereumLikeInfo!.chainId)
    .sort((a, b) => a - b);

  await Promise.allSettled(
    supportedChainIds.map(chainId => importTokenByChainId(outputDir, chainId)),
  );

  const rootIndexStringified = `${supportedChainIds
    .map(chainId =>
      chainNames.has(chainId)
        ? `import ${chainNames.get(chainId)}_tokens from "./${chainId}/erc20.json"`
        : null,
    )
    .filter(Boolean)
    .join(";" + String.fromCharCode(10))};

${supportedChainIds
  .map(chainId =>
    chainNames.has(chainId) &&
    existsSync(path.join(outputDir, "evm", chainId.toString(), "erc20-hash.json"))
      ? `import ${chainNames.get(chainId)}_tokens_hash from "./${chainId}/erc20-hash.json"`
      : null,
  )
  .filter(Boolean)
  .join(";" + String.fromCharCode(10))};

${supportedChainIds
  .map(chainId =>
    chainNames.has(chainId)
      ? `import ${chainNames.get(chainId)}_signatures from "./${chainId}/erc20-signatures.json"`
      : null,
  )
  .filter(Boolean)
  .join(";" + String.fromCharCode(10))};

${supportedChainIds
  .map(chainId =>
    chainNames.has(chainId) &&
    existsSync(path.join(outputDir, "evm", chainId.toString(), "erc20-signatures-hash.json"))
      ? `import ${chainNames.get(
          chainId,
        )}_signatures_hash from "./${chainId}/erc20-signatures-hash.json"`
      : null,
  )
  .filter(Boolean)
  .join(";" + String.fromCharCode(10))};

export const tokens = {
${supportedChainIds
  .map(chainId =>
    chainNames.has(chainId) ? `  ${chainId}: ${chainNames.get(chainId)}_tokens` : null,
  )
  .filter(Boolean)
  .join("," + String.fromCharCode(10))},
};

export const signatures = {
${supportedChainIds
  .map(chainId =>
    chainNames.has(chainId) ? `  ${chainId}: ${chainNames.get(chainId)}_signatures` : null,
  )
  .filter(Boolean)
  .join("," + String.fromCharCode(10))},
};

export const hashes = {
${supportedChainIds
  .map(chainId =>
    chainNames.has(chainId) &&
    existsSync(path.join(outputDir, "evm", chainId.toString(), "erc20-hash.json"))
      ? `  ${chainId}: ${chainNames.get(chainId)}_tokens_hash`
      : null,
  )
  .filter(Boolean)
  .join("," + String.fromCharCode(10))},
};

export const signatureHashes = {
${supportedChainIds
  .map(chainId =>
    chainNames.has(chainId) &&
    existsSync(path.join(outputDir, "evm", chainId.toString(), "erc20-signatures-hash.json"))
      ? `  ${chainId}: ${chainNames.get(chainId)}_signatures_hash`
      : null,
  )
  .filter(Boolean)
  .join("," + String.fromCharCode(10))},
};

export default {
  tokens,
  signatures,
  hashes,
  signatureHashes,
};
`;

  await fs.writeFile(`${outputDir}/evm/index.ts`, rootIndexStringified);

  console.log("Importing evm tokens success");
};
