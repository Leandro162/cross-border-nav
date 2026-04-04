import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "CrossBorder - 跨境出海工具导航",
  description: "发现最好的跨境出海工具和资源",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={inter.variable}>
      <body className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
        {children}
      </body>
    </html>
  );
}
