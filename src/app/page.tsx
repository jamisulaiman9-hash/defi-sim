// src/app/page.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { AssetSymbol } from "@/lib/config";
import {
  ASSET_PARAMS,
  DEFAULTS,
  DISPLAY_LABELS,
  LST_LRT,
  OTHERS,
} from "@/lib/config";
import { fetchSpot } from "@/lib/prices";
import EducationModal from "@/components/EducationModal";

type Spot = { price: number; ts: number } | null;

const RED = "#EA3943";
const RED_DARK = "#B9242D";
const INK = "#e5e7eb";
const SUB = "#9aa1ab";
const Z = 2147483000;

const asUSD = (n: number) =>
  Number.isFinite(n)
    ? n.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : "0.00";

const fmtTime = (ts: number) =>
  new Date(ts).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

function AssetDropdown({
  open,
  onClose,
  value,
  onSelect,
  anchorRef,
}: {
  open: boolean;
  onClose: () => void;
  value: AssetSymbol;
  onSelect: (sym: AssetSymbol) => void;
  anchorRef: React.RefObject<HTMLDivElement>;
}) {
  const [q, setQ] = useState("");
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!open) return;
    const measure = () =>
      setRect(anchorRef.current?.getBoundingClientRect() ?? null);
    measure();

    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    if (anchorRef.current && ro) ro.observe(anchorRef.current);

    const onScroll = measure;
    const onResize = measure;
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      ro?.disconnect();
    };
  }, [open, anchorRef]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || typeof document === "undefined" || !rect) return null;

  const ql = q.trim().toLowerCase();
  const cryptos = OTHERS.filter((s) =>
    ql ? DISPLAY_LABELS[s].toLowerCase().includes(ql) : true
  );

  // permanently excluded
  const excluded = ["wBETH", "ankrETH", "swETH"];
  const lstlrtFiltered = LST_LRT.filter((s) => !excluded.includes(s)).filter(
    (s) => (ql ? DISPLAY_LABELS[s].toLowerCase().includes(ql) : true)
  );

  const rawWidth = Math.min(Math.max(rect.width * 0.92, 320), 440);
  const idealWidth = Math.round(rawWidth);
  const vw = window.innerWidth;
  const centeredLeft =
    rect.left + (rect.width - idealWidth) / 2 + window.scrollX;
  const left = Math.min(
    Math.max(8 + window.scrollX, centeredLeft),
    vw - idealWidth - 8 + window.scrollX
  );
  const top = rect.bottom + window.scrollY + 6;

  const Header: React.CSSProperties = {
    color: RED,
    fontWeight: 900,
    fontSize: 12,
    letterSpacing: 0.35,
    marginBottom: 6,
    textTransform: "uppercase",
  };
  const Item: React.CSSProperties = {
    width: "100%",
    textAlign: "left",
    padding: "10px 12px",
    borderRadius: 8,
    marginBottom: 6,
    border: "1px solid #1c1d21",
    background: "#0b0c0f",
    color: INK,
    fontWeight: 700,
    cursor: "pointer",
  };

  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: Z, pointerEvents: "none" }}>
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          pointerEvents: "auto",
        }}
      />
      <div
        role="listbox"
        aria-label="Select token"
        style={{
          position: "absolute",
          left,
          top,
          width: idealWidth,
          maxWidth: "96vw",
          maxHeight: "60vh",
          background: "#000",
          border: "1px solid #222",
          borderRadius: 12,
          boxShadow: "0 28px 80px rgba(0,0,0,0.8)",
          overflow: "hidden",
          pointerEvents: "auto",
        }}
      >
        <div
          style={{
            padding: 10,
            borderBottom: "1px solid #1a1a1a",
            background: "#000",
          }}
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search token..."
            style={{
              width: "100%",
              height: 36,
              borderRadius: 8,
              border: "1px solid #2a2a2a",
              background: "#000",
              color: INK,
              padding: "0 10px",
              outline: "none",
            }}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            padding: 10,
            background: "#000",
            maxHeight: "calc(60vh - 56px)",
            overflowY: "auto",
          }}
        >
          <div>
            <div style={Header}>Cryptos</div>
            {cryptos.map((sym) => (
              <button
                key={sym}
                onClick={() => {
                  onSelect(sym as AssetSymbol);
                  onClose();
                }}
                style={Item}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#15171b")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#0b0c0f")
                }
              >
                {DISPLAY_LABELS[sym]}
              </button>
            ))}
          </div>

          <div>
            <div style={Header}>LST / LRT</div>
            {lstlrtFiltered.map((sym) => (
              <button
                key={sym}
                onClick={() => {
                  onSelect(sym as AssetSymbol);
                  onClose();
                }}
                style={Item}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#15171b")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#0b0c0f")
                }
              >
                {DISPLAY_LABELS[sym]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
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
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);

  useEffect(() => {
    let ok = true;
    let t: any;
    const load = async () => {
      try {
        const data = await fetchSpot(asset);
        if (ok) {
          setSpot(data);
          setUpdatedAt(Date.now());
        }
      } catch {
        if (ok) setSpot(null);
      } finally {
        if (ok) t = setTimeout(load, 30_000);
      }
    };
    load();
    return () => {
      ok = false;
      clearTimeout(t);
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

  const [menuOpen, setMenuOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  return (
    <main style={S.page}>
      <div style={S.container}>
        <div style={S.eduBar}>
          {[
            ["collateralisation", "Collateralisation"],
            ["looping", "Looping"],
            ["ratio", "Ratio"],
            ["liquidation", "Liquidation"],
            ["redstone-atom", "RedStone ATOM"],
          ].map(([k, label]) => (
            <button
              key={k}
              style={S.eduBtn}
              onClick={() => {
                setEduTopic(k as Topic);
                setEduOpen(true);
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <h1 style={S.h1}>DeFi Collateral Simulator</h1>

        {showIntro ? (
          <section className="card" style={S.intro}>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>What is this?</h2>
            <p style={S.p}>
              This tool helps you understand how borrowing against crypto collateral
              works using <span style={{ color: RED, fontWeight: 800 }}>RedStone</span>{" "}
              oracle prices. You can choose an asset, set a deposit amount, pick a
              desired collateral ratio, and explore how health factor changes if the
              price moves.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                marginTop: 6,
              }}
            >
              {[
                ["Collateral Ratio (CR)", "Debt ÷ Collateral Value. Higher CR = more risk."],
                ["LTV / Borrow Limit", "Max you can borrow safely (protocol parameter per asset)."],
                ["Liquidation Threshold", "Value where you can be liquidated."],
                ["HF (Health Factor)", "Higher is safer. HF > 1 means safe; < 1 means at risk."],
              ].map(([k, v]) => (
                <div key={k} className="card" style={S.introItem}>
                  <div style={S.k}>{k}</div>
                  <div style={S.v}>{v}</div>
                </div>
              ))}
            </div>

            <ol className="steps" style={{ marginTop: 10 }}>
              <li>Select an asset and set a deposit amount.</li>
              <li>Adjust “Desired Collateral Ratio”.</li>
              <li>Use “Price Shock” to see impact.</li>
            </ol>

            <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
              <button style={S.primaryBtn} onClick={goToSim}>
                Start Simulation
              </button>
            </div>
          </section>
        ) : (
          <>
            <div className="controls-grid">
              <div className="grid-item card" style={S.control}>
                <label style={S.label}>Asset</label>
                <div
                  ref={anchorRef}
                  onClick={() => setMenuOpen((v) => !v)}
                  style={{ position: "relative", cursor: "pointer" }}
                >
                  <div
                    style={S.selectReadOnly}
                    aria-haspopup="listbox"
                    aria-expanded={menuOpen}
                  >
                    {DISPLAY_LABELS[asset] ?? asset}
                  </div>
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: SUB,
                      pointerEvents: "none",
                      fontSize: 18,
                    }}
                  >
                    ▾
                  </span>
                </div>
              </div>

              <div className="grid-item card" style={S.control}>
                <label style={S.label}>Deposit Amount</label>
                <input
                  type="number"
                  min={0}
                  step={0.0001}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  style={S.input}
                />
              </div>

              <div className="grid-item card" style={S.control}>
                <label style={S.label}>Desired Collateral Ratio</label>
                <input
                  type="range"
                  min={0}
                  max={0.95}
                  step={0.01}
                  value={desiredCR}
                  onChange={(e) => setDesiredCR(Number(e.target.value))}
                  style={S.range}
                />
                <div style={S.help}>
                  {Math.round(desiredCR * 100)}% of collateral value borrowed
                </div>
              </div>

              <div className="grid-item card" style={S.liveCard}>
                <div style={{ ...S.mono, fontWeight: 700, fontSize: "1.1rem" }}>
                  Live Price: {spot ? `$${asUSD(spot.price)}` : "…"}{" "}
                  <span style={{ color: SUB }}>(RedStone)</span>
                </div>
                <div style={{ color: SUB, fontSize: 13, marginTop: 4 }}>
                  Last updated: {updatedAt ? fmtTime(updatedAt) : "…"}
                </div>
                <div style={{ marginTop: 12 }}>
                  <label style={S.label}>Price Shock</label>
                  <input
                    type="range"
                    min={-0.8}
                    max={2.0}
                    step={0.01}
                    value={shock}
                    onChange={(e) => setShock(Number(e.target.value))}
                    style={S.range}
                  />
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                    <div style={{ ...S.mono }}>Shocked Price: ${asUSD(shockedPrice)}</div>
                    {shock !== 0 && (
                      <button
                        type="button"
                        onClick={() => setShock(0)}
                        title="Return to live price"
                        style={S.resetBtn}
                      >
                        Reset to live price
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <AssetDropdown
              open={menuOpen}
              onClose={() => setMenuOpen(false)}
              value={asset}
              onSelect={(s) => setAsset(s)}
              anchorRef={anchorRef}
            />

            <section className="metrics-grid">
              <div className="card grid-item" style={S.metric}>
                <div style={S.metricLabel}>Collateral Value</div>
                <div style={S.metricValue}>${asUSD(collateralValue)}</div>
              </div>
              <div className="card grid-item" style={S.metric}>
                <div style={S.metricLabel}>Borrow Limit</div>
                <div style={S.metricValue}>${asUSD(borrowLimit)}</div>
                <div style={S.help}>LTV cap: {Math.round(ASSET_PARAMS[asset].ltv * 100)}%</div>
              </div>
              <div className="card grid-item" style={S.metric}>
                <div style={S.metricLabel}>Liquidation Threshold Value</div>
                <div style={S.metricValue}>${asUSD(liquidationValue)}</div>
              </div>
            </section>

            <section className="card" style={{ marginTop: 16, padding: 16 }}>
              <span
                style={hf >= 1.1 || hf === Infinity ? S.badgeSafe : S.badgeRisk}
              >
                {status}
              </span>
              <div style={S.help}>
                HF = (Collateral Value × Liq. Threshold) / Debt
              </div>
            </section>

            <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
              <button style={S.smallGhostBtn} onClick={goToIntro}>
                ← Back to intro
              </button>
            </div>
          </>
        )}
      </div>

      <EducationModal
        open={eduOpen}
        topic={eduTopic}
        onClose={() => setEduOpen(false)}
      />
    </main>
  );
}

const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#0f0f10",
    backgroundImage:
      "radial-gradient(1200px 600px at -10% -10%, rgba(234,57,67,0.10), transparent 60%), radial-gradient(1400px 700px at 110% -10%, rgba(234,57,67,0.10), transparent 60%), radial-gradient(1200px 600px at 50% 130%, rgba(234,57,67,0.08), transparent 60%)",
    color: INK,
  },
  container: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "16px 16px 72px",
    fontSize: "1.05rem",
  },

  eduBar: {
    width: "100%",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
    marginBottom: 14,
  },
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
  },

  h1: {
    fontSize: 32,
    fontWeight: 900,
    margin: "0 auto 14px",
    color: RED,
    textAlign: "center",
    textShadow: "0 2px 20px rgba(234,57,67,0.25)",
    maxWidth: 900,
  },

  intro: {
    margin: "10px auto 0",
    padding: 22,
    maxWidth: 1120,
    width: "100%",
    background: "rgba(0,0,0,0.55)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    boxShadow: "0 18px 60px rgba(0,0,0,0.55)",
  },
  p: { margin: "10px 0 14px", color: INK, lineHeight: 1.5 },
  introItem: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 12,
    padding: 14,
    boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
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
    outline: "none",
  },

  selectReadOnly: {
    width: "100%",
    height: 44,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    padding: "0 36px 0 12px",
    background: "rgba(0,0,0,0.35)",
    color: INK,
    display: "flex",
    alignItems: "center",
    fontSize: "1rem",
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

  resetBtn: {
    background: "transparent",
    border: `1px dashed ${RED_DARK}`,
    color: RED,
    padding: "6px 10px",
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 12.5,
    cursor: "pointer",
  },

  mono: {
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
  help: { color: SUB, fontSize: 13 },

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