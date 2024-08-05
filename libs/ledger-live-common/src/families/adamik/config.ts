import { ConfigInfo } from "@ledgerhq/live-config/LiveConfig";

const adamikConfig: Record<string, ConfigInfo> = {
  config_currency_zksync: {
    type: "object",
    default: {
      status: {
        type: "active",
      },
    },
  },
};

export { adamikConfig };
