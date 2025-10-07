# 🧮 DeFi Collateral Simulator

An interactive simulator that helps users **understand how borrowing against crypto collateral works** using **[RedStone Oracles](https://www.redstone.finance/)** for live, reliable price feeds.

👉 **Live Demo:** https://defi-sim.vercel.app

---

## 🌐 Overview

This tool lets you explore key DeFi lending mechanics such as:

- **Collateral Ratio (CR)** — Debt ÷ Collateral Value  
- **LTV (Loan-to-Value)** — How much you can borrow safely  
- **Liquidation Threshold** — Where your position gets liquidated  
- **Health Factor (HF)** — Safety indicator (>1 safe, <1 risky)

You can:
1. Select an asset and set a deposit amount.  
2. Adjust your **Desired Collateral Ratio**.  
3. Simulate **price shocks** to see how your safety changes in real-time.

---

## ⚙️ How It Works

- Fetches live asset prices via **RedStone Oracles**
- Recalculates collateral and health factor automatically
- Built with **Next.js + TypeScript + TailwindCSS**
- Clean and responsive UI for desktop & mobile

---

## 🧠 Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 |
| Language | TypeScript |
| Styling | TailwindCSS |
| Data | RedStone SDK |
| Hosting | Vercel |

---

## 🛠️ Local Setup

```bash
git clone https://github.com/jamisulaiman9-hash/defi-sim.git
cd defi-sim
npm install
npm run dev
