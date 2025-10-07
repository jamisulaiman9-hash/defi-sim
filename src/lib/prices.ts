// src/lib/prices.ts

import type { AssetSymbol } from "./config";

export type Spot = { price: number; ts: number };

/**
 * Call our local API route (/api/spot?asset=XYZ)
 * Returns the latest RedStone price + timestamp (ms).
 */
export async function fetchSpot(asset: AssetSymbol): Promise<Spot> {
  const u = `/api/spot?asset=${encodeURIComponent(asset)}`;

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000); // 8s safety timeout

  try {
    const res = await fetch(u, {
      method: "GET",
      cache: "no-store",
      signal: ctrl.signal,
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => res.statusText);
      throw new Error(`Spot API ${res.status}: ${msg}`);
    }

    const data = (await res.json()) as { price: number; ts: number };
    if (!Number.isFinite(data.price) || !Number.isFinite(data.ts)) {
      throw new Error("Bad payload from /api/spot");
    }
    return { price: Number(data.price), ts: Number(data.ts) };
  } finally {
    clearTimeout(t);
  }
}
