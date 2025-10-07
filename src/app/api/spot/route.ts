// src/app/api/spot/route.ts
import { NextResponse } from "next/server";

type RsRecord = {
  symbol?: string;
  value?: number;
  price?: number;
  timestamp?: number;
  provider?: string;
};

// App UPPERCASE symbol -> exact RedStone casing
const SYMBOL_MAP: Record<string, string> = {
  ETH: "ETH", BTC: "BTC", USDC: "USDC", BNB: "BNB", SOL: "SOL", AVAX: "AVAX",
  MATIC: "MATIC", DOGE: "DOGE", ADA: "ADA", DOT: "DOT", LINK: "LINK", LTC: "LTC",

  STETH:  "stETH",
  WSTETH: "wstETH",
  RETH:   "rETH",
  CBETH:  "cbETH",
  RSETH:  "rsETH",
  WEETH:  "weETH",
  SFRXETH:"sfrxETH",
  SWETH:  "swETH",
  OSETH:  "osETH",
  ANKRETH:"ankrETH",
  FRXETH: "frxETH",
  WBETH:  "wBETH",
};

const ALLOWED = Object.keys(SYMBOL_MAP);

const MIRRORS = [
  (sym: string) =>
    `https://api.redstone.finance/prices?symbol=${encodeURIComponent(sym)}&provider=redstone&t=${Date.now()}`,
  (sym: string) =>
    `https://gateway.redstone.finance/prices?symbol=${encodeURIComponent(sym)}&provider=redstone&t=${Date.now()}`,
  (sym: string) =>
    `https://rapid-gateway.redstone.finance/prices?symbol=${encodeURIComponent(sym)}&provider=redstone&t=${Date.now()}`,
];

async function tryFetch(url: string) {
  const res = await fetch(url, {
    cache: "no-store",
    next: { revalidate: 0 },
    headers: {
      accept: "application/json",
      "cache-control": "no-cache, no-store, max-age=0",
      pragma: "no-cache",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as RsRecord[] | RsRecord;
}

function normalize(payload: RsRecord[] | RsRecord) {
  const item: RsRecord = Array.isArray(payload) ? payload[0] : payload;
  const price = Number(item?.value ?? item?.price);
  let ts = Number(item?.timestamp ?? Date.now());
  if (ts < 10_000_000_000) ts *= 1000; // s -> ms
  if (!Number.isFinite(price)) throw new Error("Bad price");
  if (!Number.isFinite(ts)) throw new Error("Bad timestamp");
  return { price, ts };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const appAsset = (searchParams.get("asset") || "ETH").toUpperCase();

  if (!ALLOWED.includes(appAsset)) {
    return NextResponse.json({ error: "Unsupported asset" }, { status: 400 });
  }

  const redstoneSymbol = SYMBOL_MAP[appAsset];

  let lastErr: unknown = null;
  for (const makeUrl of MIRRORS) {
    try {
      const raw = await tryFetch(makeUrl(redstoneSymbol));
      const { price, ts } = normalize(raw);
      return NextResponse.json(
        { price, ts },
        {
          status: 200,
          headers: {
            "content-type": "application/json; charset=utf-8",
            "cache-control": "no-store, max-age=0",
            pragma: "no-cache",
          },
        }
      );
    } catch (err) {
      lastErr = err;
    }
  }

  return NextResponse.json(
    { error: "RedStone unreachable", detail: String(lastErr ?? "unknown") },
    { status: 502 }
  );
}
