import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "跨境工具导航 - Cross-Border Tools Navigator",
  description: "分享最实用的跨境工具、浏览器、广告联盟和支付工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
