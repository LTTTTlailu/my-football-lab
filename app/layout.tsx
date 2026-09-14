import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Football Lab",
  description: "个人足球训练、比赛记录与战术可视化。",
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
