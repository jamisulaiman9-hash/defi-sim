// src/app/api/spot/route.ts
import { NextResponse } from "next/server";

/**
 * Very small proxy to fetch the latest spot price from RedStone.
 * We try a couple of public mirrors and normalize the output to:
 * { price: number, ts: number }  // ts in milliseconds
 *
 * Usage: /api/spot?asset=ETH
 */

type RsRecord = {
  symbol?: string;
  value?: number;     // sometimes "value"
  price?: number;     // sometimes "price"
  timestamp?: number; // sometimes "timestamp" (ms)
  provider?: string;
};

// NOTE: add a cache-buster (&t=now) so no layer serves stale data.
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
      // extra hints for intermediaries (belt & suspenders)
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
  if (ts < 10_000_000_000) ts *= 1000; // seconds→ms if needed
  if (!Number.isFinite(price)) throw new Error("Bad price");
  if (!Number.isFinite(ts)) throw new Error("Bad timestamp");
  return { price, ts };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const asset = (searchParams.get("asset") || "ETH").toUpperCase();

  const ALLOWED = ["ETH","BTC","BNB","SOL","AVAX","MATIC","XRP","ADA","DOT","UNI","LINK","LTC","TRX","DOGE","USDC"];
  if (!ALLOWED.includes(asset)) {
    return NextResponse.json({ error: "Unsupported asset" }, { status: 400 });
  }

  let lastErr: unknown = null;
  for (const makeUrl of MIRRORS) {
    const url = makeUrl(asset);
    try {
      const raw = await tryFetch(url);
      const { price, ts } = normalize(raw);
      return new NextResponse(JSON.stringify({ price, ts }), {
        status: 200,
        headers: {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "no-store, max-age=0",
          pragma: "no-cache",
        },
      });
    } catch (err) {
      lastErr = err;
    }
  }

  return NextResponse.json(
    { error: "RedStone unreachable", detail: String(lastErr ?? "unknown") },
    { status: 502 }
  );
}
