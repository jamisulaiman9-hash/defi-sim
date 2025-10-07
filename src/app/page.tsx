"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { AssetSymbol } from "@/lib/config";
import { ASSET_PARAMS, DEFAULTS } from "@/lib/config";
import { fetchSpot } from "@/lib/prices";
import EducationModal from "@/components/EducationModal";

type Spot = { price: number; ts: number } | null;

const RED = "#EA3943";
const RED_DARK = "#B9242D";
const INK = "#e5e7eb";
const SUB = "#9aa1ab";

const asUSD = (n: number) =>
  Number.isFinite(n)
    ? n.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : "0.00";

function formatTimeWithSeconds(ts: number) {
  try {
    return new Date(ts).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  } catch {
    return "—";
  }
}

export default function Page() {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const init = () => setShowIntro(location.hash !== "#sim");
    init();
    const onPop = () => setShowIntro(location.hash !== "#sim");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const goToSim = () => {
    history.pushState({}, "", "#sim");
    setShowIntro(false);
  };
  const goToIntro = () => {
    history.pushState({}, "", "#intro");
    setShowIntro(true);
  };

  type Topic =
    | "collateralisation"
    | "looping"
    | "ratio"
    | "liquidation"
    | "redstone-atom";
  const [eduOpen, setEduOpen] = useState(false);
  const [eduTopic, setEduTopic] = useState<Topic>("collateralisation");

  const [asset, setAsset] = useState<AssetSymbol>(DEFAULTS.asset);
  const [amount, setAmount] = useState<number>(DEFAULTS.amount);
  const [desiredCR, setDesiredCR] = useState<number>(DEFAULTS.desiredCR);
  const [shock, setShock] = useState<number>(0);

  const [spot, setSpot] = useState<Spot>(null);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null); // local fetch timestamp

  useEffect(() => {
    let active = true;
    let timer: any;
    const load = async () => {
      try {
        const data = await fetchSpot(asset);
        if (active) {
          setSpot(data);
          setUpdatedAt(Date.now()); // record exact fetch time
        }
      } catch (e) {
        console.error("Spot fetch failed:", e);
        if (active) setSpot(null);
      } finally {
        if (active) timer = setTimeout(load, 30000); // poll every 30s
      }
    };
    load();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [asset]);

  const shockedPrice = useMemo(
    () => (spot ? spot.price * (1 + shock) : 0),
    [spot, shock]
  );

  const { collateralValue, borrowLimit, liquidationValue, debt, hf } =
    useMemo(() => {
      const price = shockedPrice;
      const cv = amount * (Number.isFinite(price) ? price : 0);
      const params = ASSET_PARAMS[asset];
      const borrowLimit = cv * params.ltv;
      const liquidationValue = cv * params.liquidation;
      const debt = cv * desiredCR;
      const hf = debt > 0 ? (cv * params.liquidation) / debt : Infinity;
      return { collateralValue: cv, borrowLimit, liquidationValue, debt, hf };
    }, [amount, asset, desiredCR, shockedPrice]);

  const status =
    hf === Infinity
      ? "Safe (HF ∞)"
      : hf >= 1.1
      ? `Safe (HF ${hf.toFixed(2)})`
      : `At risk (HF ${hf.toFixed(2)})`;

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        {/* EDU pills */}
        <div className="edu-bar" style={styles.eduBar}>
          {[
            ["collateralisation", "Collateralisation"],
            ["looping", "Looping"],
            ["ratio", "Ratio"],
            ["liquidation", "Liquidation"],
            ["redstone-atom", "RedStone ATOM"],
          ].map(([key, label]) => (
            <button
              key={key}
              style={styles.eduBtn}
              onClick={() => {
                setEduTopic(key as any);
                setEduOpen(true);
              }}
              className="anim-pill"
            >
              {label}
            </button>
          ))}
        </div>

        <h1 style={styles.h1} className="animate-fade-in-up">
          DeFi Collateral Simulator
        </h1>

        {showIntro ? (
          // Intro card
          <section className="card animate-fade-in-up" style={styles.intro}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>
              What is this?
            </h2>
            <p style={styles.p}>
              This tool helps you understand how borrowing against crypto
              collateral works using
              <span style={{ color: RED, fontWeight: 700 }}> RedStone</span>{" "}
              oracle prices. You can choose an asset, set a deposit amount,
              pick a desired collateral ratio, and explore how health factor
              changes if the price moves.
            </p>

            <div className="grid-2" style={{ marginTop: 12 }}>
              <div className="card animate-fade-in-up" style={styles.introItem}>
                <div style={styles.k}>Collateral Ratio (CR)</div>
                <div style={styles.v}>
                  Debt ÷ Collateral Value. Higher CR = more borrowed risk.
                </div>
              </div>
              <div className="card animate-fade-in-up" style={styles.introItem}>
                <div style={styles.k}>LTV / Borrow Limit</div>
                <div style={styles.v}>
                  Max you can borrow safely (protocol parameter per asset).
                </div>
              </div>
              <div className="card animate-fade-in-up" style={styles.introItem}>
                <div style={styles.k}>Liquidation Threshold</div>
                <div style={styles.v}>
                  Price where your position can be liquidated.
                </div>
              </div>
              <div className="card animate-fade-in-up" style={styles.introItem}>
                <div style={styles.k}>HF (Health Factor)</div>
                <div style={styles.v}>
                  Higher is safer. HF &gt; 1 means safe; &lt; 1 means at risk.
                </div>
              </div>
            </div>

            {/* numbered steps (CSS counters handle numbers/indent) */}
            <ol className="steps">
              <li>Select an asset and set a deposit amount.</li>
              <li>
                Drag the “Desired Collateral Ratio” to simulate borrowing
                more/less.
              </li>
              <li>
                Use “Price Shock” to see the impact of a price move on safety.
              </li>
            </ol>

            <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
              <button style={styles.primaryBtn} className="btn-pop" onClick={goToSim}>
                Start Simulation
              </button>
            </div>
          </section>
        ) : (
          <>
            {/* Controls grid */}
            <div className="controls-grid animate-fade-in-up">
              <div className="grid-item card" style={styles.control}>
                <label style={styles.label}>Asset</label>
                <div style={{ position: "relative" }}>
                  <select
                    value={asset}
                    onChange={(e) => setAsset(e.target.value as AssetSymbol)}
                    className="select"
                    style={styles.select}
                  >
                    {Object.keys(ASSET_PARAMS).map((sym) => (
                      <option key={sym} value={sym} style={{ background: "#0b0b0c", color: "#fff" }}>
                        {sym}
                      </option>
                    ))}
                  </select>
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: 16,
                      color: SUB,
                      pointerEvents: "none",
                    }}
                  >
                    ▾
                  </span>
                </div>
              </div>

              <div className="grid-item card" style={styles.control}>
                <label style={styles.label}>Deposit Amount</label>
                <input
                  type="number"
                  min={0}
                  step={0.0001}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="input"
                  style={styles.input}
                />
              </div>

              <div className="grid-item card" style={styles.control}>
                <label style={styles.label}>Desired Collateral Ratio</label>
                <input
                  type="range"
                  min={0}
                  max={0.95}
                  step={0.01}
                  value={desiredCR}
                  onChange={(e) => setDesiredCR(Number(e.target.value))}
                  className="range"
                  style={styles.range}
                />
                <div style={styles.help}>
                  {Math.round(desiredCR * 100)}% of collateral value borrowed
                </div>
              </div>

              <div className="grid-item card live-card" style={styles.liveCard}>
                <div style={{ ...styles.mono, fontWeight: 700, fontSize: "1.1rem" }}>
                  Live Price: {spot ? `$${asUSD(spot.price)}` : "…"}{" "}
                  <span style={{ color: SUB }}>(RedStone)</span>
                </div>
                <div style={{ color: SUB, fontSize: 13, marginTop: 4 }}>
                  Last updated: {updatedAt ? formatTimeWithSeconds(updatedAt) : "…"}
                </div>

                <div style={{ marginTop: 12 }}>
                  <label style={styles.label}>Price Shock</label>
                  <input
                    type="range"
                    min={-0.8}
                    max={2.0}
                    step={0.01}
                    value={shock}
                    onChange={(e) => setShock(Number(e.target.value))}
                    className="range"
                    style={styles.range}
                  />
                  <div style={{ ...styles.mono, marginTop: 8 }}>
                    Shocked Price: ${asUSD(shockedPrice)}
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <section className="metrics-grid animate-fade-in-up">
              <div className="card grid-item" style={styles.metric}>
                <div style={styles.metricLabel}>Collateral Value</div>
                <div style={styles.metricValue}>${asUSD(collateralValue)}</div>
              </div>
              <div className="card grid-item" style={styles.metric}>
                <div style={styles.metricLabel}>Borrow Limit</div>
                <div style={styles.metricValue}>${asUSD(borrowLimit)}</div>
              </div>
              <div className="card grid-item" style={styles.metric}>
                <div style={styles.metricLabel}>Liquidation Threshold Value</div>
                <div style={styles.metricValue}>${asUSD(liquidationValue)}</div>
              </div>
            </section>

            {/* formula card with inner padding */}
            <section className="card animate-fade-in-up" style={{ marginTop: 16, padding: 16 }}>
              <span style={hf >= 1.1 || hf === Infinity ? styles.badgeSafe : styles.badgeRisk}>
                {status}
              </span>
              <div style={styles.help}>
                HF = (Collateral Value × Liq. Threshold) / Debt
              </div>
            </section>

            <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
              <button style={styles.smallGhostBtn} className="btn-pop" onClick={goToIntro}>
                ← Back to intro
              </button>
            </div>
          </>
        )}
      </div>

      <EducationModal open={eduOpen} topic={eduTopic} onClose={() => setEduOpen(false)} />
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#0f0f10",
    backgroundImage:
      "radial-gradient(1200px 600px at -10% -10%, rgba(234,57,67,0.10), transparent 60%), radial-gradient(1400px 700px at 110% -10%, rgba(234,57,67,0.10), transparent 60%), radial-gradient(1200px 600px at 50% 130%, rgba(234,57,67,0.08), transparent 60%)",
    color: INK,
  },
  container: { maxWidth: 1200, margin: "0 auto", padding: "16px 16px 72px", fontSize: "1.05rem" },

  eduBar: { width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginTop: 6, marginBottom: 10 },
  eduBtn: {
    display: "inline-block",
    padding: "7px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.06)",
    color: INK,
    fontWeight: 800,
    fontSize: 13,
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0,0,0,0.20)",
    backdropFilter: "blur(6px)",
    whiteSpace: "nowrap",
  },

  h1: { fontSize: 32, fontWeight: 900, marginBottom: 14, color: RED, textAlign: "center", textShadow: "0 2px 20px rgba(234,57,67,0.25)" },

  intro: { marginTop: 8, fontSize: "1.05rem", padding: 14 },
  p: { margin: "10px 0 14px", color: INK },
  introItem: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: 12,
  },
  k: { fontWeight: 800, marginBottom: 6, color: INK },
  v: { color: SUB },

  label: { fontSize: 13, color: "#a1a1aa" },
  input: {
    height: 40,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    padding: "6px 12px",
    background: "rgba(0,0,0,0.25)",
    color: INK,
    fontSize: "1rem",
  },
  select: {
    width: "100%",
    height: 40,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    padding: "0 32px 0 12px",
    background: "rgba(0,0,0,0.35)",
    color: INK,
    fontSize: "1rem",
    appearance: "none" as any,
    backgroundImage: "none",
  },
  range: { width: "100%", accentColor: RED },

  control: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: 12,
    width: "100%",
    boxSizing: "border-box",
  },

  liveCard: {
    borderRadius: 12,
    padding: 12,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
    width: "100%",
    boxSizing: "border-box",
  },

  metric: { padding: 14, boxSizing: "border-box" },
  metricLabel: { fontSize: 13, color: "#9ca3af", marginBottom: 6 },
  metricValue: { fontSize: 20, fontWeight: 700, color: INK },

  primaryBtn: {
    background: RED,
    border: `1px solid ${RED_DARK}`,
    color: "white",
    padding: "12px 18px",
    borderRadius: 12,
    fontWeight: 800,
  },
  smallGhostBtn: {
    background: "transparent",
    border: `1px solid ${RED_DARK}`,
    color: RED,
    padding: "8px 12px",
    borderRadius: 10,
    fontWeight: 700,
    cursor: "pointer",
  },

  badgeSafe: {
    display: "inline-block",
    background: "rgba(34,197,94,0.15)",
    border: "1px solid rgba(34,197,94,0.4)",
    color: "#34d399",
    padding: "5px 12px",
    borderRadius: 999,
    fontSize: 13,
    marginBottom: 8,
  },
  badgeRisk: {
    display: "inline-block",
    background: "rgba(239,68,68,0.15)",
    border: "1px solid rgba(239,68,68,0.4)",
    color: "#f87171",
    padding: "5px 12px",
    borderRadius: 999,
    fontSize: 13,
    marginBottom: 8,
  },
};