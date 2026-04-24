import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "料金プラン — Claude Quest",
  description: "Claude Quest の料金プラン。無料で始めて、PRO でさらに強力な機能を解放しよう。",
};

const PS2P: React.CSSProperties = { fontFamily: "'Press Start 2P', monospace" };
const VT323: React.CSSProperties = { fontFamily: "'VT323', monospace" };

export default function PricingPage() {
  return (
    <main
      style={{ minHeight: "100vh", background: "#0a0a1a", color: "#e0e8ff", position: "relative", overflow: "hidden" }}
    >
      {/* CRT scanline overlay */}
      <div
        style={{
          pointerEvents: "none",
          position: "fixed",
          inset: 0,
          zIndex: 40,
          background:
            "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.08) 2px,rgba(0,0,0,0.08) 4px)",
        }}
      />

      <div style={{ position: "relative", zIndex: 10, maxWidth: 720, margin: "0 auto", padding: "48px 16px 80px" }}>
        {/* Title */}
        <h1
          style={{
            ...PS2P,
            textAlign: "center",
            color: "#ffd700",
            fontSize: 14,
            letterSpacing: "0.2em",
            marginBottom: 8,
          }}
        >
          ⚔ CLAUDE QUEST ⚔
        </h1>
        <p style={{ ...PS2P, textAlign: "center", color: "#8899aa", fontSize: 9, marginBottom: 48 }}>
          ◆ 冒険者の選択
        </p>

        {/* Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            marginBottom: 48,
          }}
        >
          {/* FREE Card */}
          <div
            style={{
              background: "#0f1629",
              border: "2px solid #ffd700",
              borderRadius: 4,
              padding: 24,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <p style={{ ...PS2P, color: "#8899aa", fontSize: 8, marginBottom: 8 }}>FREE</p>
            <p style={{ ...PS2P, color: "#ffd700", fontSize: 18, marginBottom: 4 }}>無料</p>
            <p style={{ ...VT323, color: "#8899aa", fontSize: 16, marginBottom: 24 }}>いつでも無料</p>

            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", flexGrow: 1 }}>
              {[
                "公開リポジトリ",
                "全ゲーム機能",
                "CLIセットアップ",
                "Orgランキング",
              ].map((item) => (
                <li
                  key={item}
                  style={{ ...VT323, color: "#e0e8ff", fontSize: 18, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}
                >
                  <span style={{ color: "#ffd700" }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>

            <a
              href="/"
              style={{
                ...PS2P,
                display: "block",
                textAlign: "center",
                padding: "10px 0",
                fontSize: 8,
                border: "2px solid #ffd700",
                color: "#ffd700",
                textDecoration: "none",
                borderRadius: 2,
                transition: "background 0.2s, color 0.2s",
              }}
            >
              無料で始める
            </a>
          </div>

          {/* PRO Card */}
          <div
            style={{
              background: "#0f1629",
              border: "2px solid #ffd700",
              borderRadius: 4,
              padding: 24,
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 0 24px #ffd70033",
              position: "relative",
            }}
          >
            {/* Popular badge */}
            <div
              style={{
                position: "absolute",
                top: -12,
                right: 16,
                background: "#ffd700",
                color: "#0a0a1a",
                padding: "2px 8px",
                fontSize: 8,
                ...PS2P,
              }}
            >
              人気
            </div>

            <p style={{ ...PS2P, color: "#ffd700", fontSize: 8, marginBottom: 8 }}>PRO</p>
            <p style={{ ...PS2P, color: "#ffd700", fontSize: 18, marginBottom: 4 }}>¥7,800</p>
            <p style={{ ...VT323, color: "#8899aa", fontSize: 16, marginBottom: 24 }}>/ 月</p>

            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", flexGrow: 1 }}>
              {[
                "無料の全機能",
                "プライベートリポジトリ",
                "リアルタイムEXP (Webhook)",
                "週次ギルドレポート",
                "カスタムキングダムテーマ",
              ].map((item) => (
                <li
                  key={item}
                  style={{ ...VT323, color: "#e0e8ff", fontSize: 18, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}
                >
                  <span style={{ color: "#ffd700" }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>

            <form action="/api/checkout" method="POST">
              <button
                type="submit"
                style={{
                  ...PS2P,
                  display: "block",
                  width: "100%",
                  padding: "10px 0",
                  fontSize: 8,
                  background: "#ffd700",
                  color: "#0a0a1a",
                  border: "none",
                  borderRadius: 2,
                  cursor: "pointer",
                }}
              >
                PRO に進む →
              </button>
            </form>
          </div>
        </div>

        {/* CLI CTA */}
        <div style={{ textAlign: "center" }}>
          <p style={{ ...VT323, color: "#8899aa", fontSize: 18, marginBottom: 12 }}>
            今すぐ冒険を始めよう
          </p>
          <code
            style={{
              display: "inline-block",
              background: "#1a1a2e",
              border: "1px solid #ffd70044",
              color: "#00ffcc",
              padding: "10px 20px",
              ...VT323,
              fontSize: 20,
              letterSpacing: "0.05em",
            }}
          >
            npx claude-quest init
          </code>
          <p style={{ ...VT323, color: "#555566", fontSize: 16, marginTop: 12 }}>
            で今すぐ始める
          </p>
        </div>
      </div>
    </main>
  );
}
