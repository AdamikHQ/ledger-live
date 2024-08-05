import { getAccountCurrency } from "../../account";
import { formatCurrencyUnit } from "../../currencies";
import { AdamikAccount } from "./types";

export function formatAccountSpecifics(account: AdamikAccount): string {
  const unit = getAccountCurrency(account).units[0];
  const formatConfig = {
    disableRounding: true,
    alwaysShowSign: false,
    showCode: true,
  };
  let str = " ";
  str += formatCurrencyUnit(unit, account.spendableBalance, formatConfig) + " spendable. ";

  return str;
}

export default {
  formatAccountSpecifics,
};
