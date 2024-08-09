export type IBCToken = [
  string, // chainId
  string, // name
  string, // symbol
  string, // id
  number, // decimals
  boolean?, // enableCountervalues
];

import tokens from "./ibc.json";

export default tokens as IBCToken[];
