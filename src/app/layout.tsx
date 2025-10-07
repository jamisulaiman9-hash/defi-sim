// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DeFi Collateral Simulator",
  description: "Live collateral health simulator using RedStone oracle prices.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* Main container width & padding kept minimal so the whole dashboard fits */}
        <div className="min-h-screen max-w-6xl mx-auto px-4 md:px-6 py-6">
          {children}
        </div>
      </body>
    </html>
  );
}
