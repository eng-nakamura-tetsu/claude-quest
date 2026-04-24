import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Claude Quest — あなたの組織のClaude Codeをドラクエで学ぼう",
  description: "GitHubリポジトリのスキル・MCP・Issueをドラクエ風RPGで体験できるWebサービス",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="h-full">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-[#0a0a1a]">
        {children}
        <a
          href="/pricing"
          style={{
            position: "fixed",
            top: 12,
            right: 12,
            zIndex: 60,
            fontSize: 9,
            padding: "4px 8px",
            background: "#ffd700",
            color: "#0a0a1a",
            fontFamily: "'Press Start 2P', monospace",
            textDecoration: "none",
          }}
        >
          PRO
        </a>
      </body>
    </html>
  );
}
