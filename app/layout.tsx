import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "我的足球实验室 · 公开内测",
  description: "个人足球训练、比赛记录、首发阵容与战术可视化工具。",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
