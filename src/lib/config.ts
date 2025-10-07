// src/lib/config.ts

export type AssetSymbol =
  | "ETH" | "BTC" | "USDC" | "BNB" | "SOL" | "AVAX"
  | "MATIC" | "DOGE" | "ADA" | "DOT" | "LINK" | "LTC";

export const DEFAULTS = {
  asset: "ETH" as AssetSymbol,
  amount: 1,
  desiredCR: 0.5, // 50% borrowed against collateral value
};

// Per-asset parameters for the simulator
type Params = { ltv: number; liquidation: number };

export const ASSET_PARAMS: Record<AssetSymbol, Params> = {
  ETH:  { ltv: 0.52, liquidation: 0.83 },
  BTC:  { ltv: 0.50, liquidation: 0.80 },
  USDC: { ltv: 0.75, liquidation: 0.90 },
  BNB:  { ltv: 0.50, liquidation: 0.80 },
  SOL:  { ltv: 0.45, liquidation: 0.78 },
  AVAX: { ltv: 0.45, liquidation: 0.78 },
  MATIC:{ ltv: 0.45, liquidation: 0.78 },
  DOGE: { ltv: 0.35, liquidation: 0.75 },
  ADA:  { ltv: 0.40, liquidation: 0.77 },
  DOT:  { ltv: 0.40, liquidation: 0.77 },
  LINK: { ltv: 0.45, liquidation: 0.78 },
  LTC:  { ltv: 0.45, liquidation: 0.78 },
};
