// src/components/EducationModal.tsx
"use client";
import React from "react";

type Topic = "collateralisation" | "looping" | "ratio" | "liquidation" | "redstone-atom";

export default function EducationModal({
  open,
  topic,
  onClose,
}: {
  open: boolean;
  topic: Topic;
  onClose: () => void;
}) {
  if (!open) return null;

  const copy: Record<Topic, { title: string; body: React.ReactNode }> = {
    collateralisation: {
      title: "What is Collateralisation?",
      body: (
        <>
          <p>
            Collateralisation means you deposit an asset (e.g., ETH) to borrow against it. Your borrow
            capacity depends on protocol limits (LTV) and the asset’s price.
          </p>
          <ul>
            <li>Higher collateral value → you can safely borrow more.</li>
            <li>If price drops too far, your position can be liquidated.</li>
            <li>
              <strong>HF (Health Factor)</strong> tracks safety (HF &gt; 1 = safer).
            </li>
          </ul>
        </>
      ),
    },
    looping: {
      title: "What is Looping?",
      body: (
        <>
          <p>
            Looping is a strategy where you deposit, borrow a portion, buy more of the same asset and
            deposit again  (repeating to increase exposure). It amplifies both gains and risks.
          </p>
          <ul>
            <li>Use conservative CR (borrowed %) to avoid liquidation risk.</li>
            <li>Mind fees, interest rates, and oracle price movement.</li>
          </ul>
        </>
      ),
    },
    ratio: {
      title: "What is the Collateral Ratio (CR)?",
      body: (
        <>
          <p>
            CR ≈ <em>Debt ÷ Collateral Value</em>. Higher CR means you borrowed a larger share of your
            collateral value  (more risk).
          </p>
          <ul>
            <li>Lower CR → safer, more room before liquidation.</li>
            <li>Higher CR → riskier, liquidation happens sooner if price falls.</li>
          </ul>
        </>
      ),
    },
    liquidation: {
      title: "What is Liquidation?",
      body: (
        <>
          <p>
            When price drops enough that your Health Factor &lt; 1, the protocol can sell your collateral
            to cover debt. This happens near the asset’s liquidation threshold.
          </p>
          <ul>
            <li>Monitor HF and avoid borrowing right up to the limit.</li>
            <li>Use alerts and keep buffer for volatility.</li>
          </ul>
        </>
      ),
    },
    "redstone-atom": {
      title: "RedStone ATOM",
      body: (
        <>
          <p>
           RedStone Atom delivers instant, precise, and reliable on-chain price data for DeFi and lending protocols.
           It introduces liquidation intelligence, enabling atomic liquidations and zero-latency price updates
           to maintain fair borrowing limits and healthy collateral ratios.
          </p>
          <ul>
            <li>Instant price updates keep Health Factor (HF) and risk metrics accurate in real time.</li>
            <li>Atomic liquidation system executes price updates and liquidations in one transaction.</li>
            <li>Captures OEV, returning value from liquidations back to the protocol.</li>
            <li>Seamless integration with existing RedStone feeds across multiple chains.</li>
          </ul>
        </>
      ),
    },
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3 style={{ margin: 0 }}>{copy[topic].title}</h3>
          <button style={styles.closeBtn} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div style={styles.modalBody}>{copy[topic].body}</div>
        <div style={styles.modalFooter}>
          <button style={styles.cta} onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.70)", // darker for readability
    zIndex: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modal: {
    width: "min(720px, 92vw)",
    background: "#101112",            // opaque panel
    color: "#e5e7eb",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 14,
    boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    fontWeight: 900,
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#9aa1ab",
    fontSize: 22,
    cursor: "pointer",
  },
  modalBody: {
    padding: "14px 16px",
    lineHeight: 1.55,
    fontSize: "1rem",
  },
  modalFooter: {
    padding: "10px 16px 16px",
    display: "flex",
    justifyContent: "flex-end",
  },
  cta: {
    background: "#EA3943",
    border: "1px solid #B9242D",
    color: "white",
    padding: "10px 14px",
    borderRadius: 10,
    fontWeight: 800,
    cursor: "pointer",
  },
};
