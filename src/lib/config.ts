// src/lib/config.ts

export type AssetSymbol =
  | "ETH" | "BTC" | "USDC" | "BNB" | "SOL" | "AVAX"
  | "MATIC" | "DOGE" | "ADA" | "DOT" | "LINK" | "LTC"
  // ETH LST / LRT (UPPERCASE internally)
  | "STETH" | "WSTETH" | "RETH" | "RSETH" | "WEETH" | "SFRXETH" | "OSETH";

export const DEFAULTS = {
  asset: "ETH" as AssetSymbol,
  amount: 1,
  desiredCR: 0.5,
};

// What users see in the UI
export const DISPLAY_LABELS: Record<AssetSymbol, string> = {
  ETH: "ETH",
  BTC: "BTC",
  USDC: "USDC",
  BNB: "BNB",
  SOL: "SOL",
  AVAX: "AVAX",
  MATIC: "MATIC",
  DOGE: "DOGE",
  ADA: "ADA",
  DOT: "DOT",
  LINK: "LINK",
  LTC: "LTC",

  STETH:  "stETH",
  WSTETH: "wstETH",
  RETH:   "rETH",
  RSETH:  "rsETH",
  WEETH:  "weETH",
  SFRXETH:"sfrxETH",
  OSETH:  "osETH",
};

// Selector buckets
export const LST_LRT: AssetSymbol[] = [
  "STETH","WSTETH","RETH","RSETH","WEETH","SFRXETH","OSETH",
];

export const OTHERS: AssetSymbol[] = [
  "ETH","BTC","USDC","BNB","SOL","AVAX","MATIC","DOGE","ADA","DOT","LINK","LTC",
];

export const ALL_TOKENS: AssetSymbol[] = [...OTHERS, ...LST_LRT];

// Simulator risk params
type Params = { ltv: number; liquidation: number };

export const ASSET_PARAMS: Record<AssetSymbol, Params> = {
  // Majors / stables (realistic, Aave/Morpho-style)
  ETH:   { ltv: 0.80, liquidation: 0.83 },
  BTC:   { ltv: 0.70, liquidation: 0.75 },
  USDC:  { ltv: 0.77, liquidation: 0.80 },
  BNB:   { ltv: 0.65, liquidation: 0.70 },
  SOL:   { ltv: 0.55, liquidation: 0.65 },
  AVAX:  { ltv: 0.70, liquidation: 0.70 },
  MATIC: { ltv: 0.73, liquidation: 0.76 },
  DOGE:  { ltv: 0.40, liquidation: 0.50 },
  ADA:   { ltv: 0.50, liquidation: 0.60 },
  DOT:   { ltv: 0.50, liquidation: 0.60 },
  LINK:  { ltv: 0.72, liquidation: 0.75 },
  LTC:   { ltv: 0.55, liquidation: 0.65 },

  // ETH LST / LRT (aligned with leading markets)
  STETH:   { ltv: 0.70, liquidation: 0.75 },
  WSTETH:  { ltv: 0.73, liquidation: 0.77 },
  RETH:    { ltv: 0.67, liquidation: 0.72 },
  RSETH:   { ltv: 0.78, liquidation: 0.83 },
  WEETH:   { ltv: 0.75, liquidation: 0.80 },
  SFRXETH: { ltv: 0.73, liquidation: 0.77 },
  OSETH:   { ltv: 0.78, liquidation: 0.83 },
};
