import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TempoInit } from "@/components/tempo-init";
import { WalletContextProvider } from "@/components/wallet/WalletContextProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Solana NFT Market - Discover, Collect, and Trade",
  description: "The premier marketplace for Solana NFTs - discover, collect, and trade digital assets with real-time data and wallet integration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      {/* <Script src="https://api.tempo.build/proxy-asset?url=https://storage.googleapis.com/tempo-public-assets/error-handling.js" /> [deprecated] */}
      <body className={inter.className}>
        <WalletContextProvider>
          {children}
        </WalletContextProvider>
        <TempoInit />
      </body>
    </html>
  );
}