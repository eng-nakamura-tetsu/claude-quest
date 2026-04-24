import { ImageResponse } from "@vercel/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ org: string; repo: string }> }
) {
  const { org, repo } = await params;
  const { searchParams } = new URL(req.url);

  const issue = searchParams.get("issue");
  const title = searchParams.get("title") ?? "Quest";
  const exp = searchParams.get("exp") ?? "0";
  const level = searchParams.get("level") ?? "1";
  const cls = searchParams.get("class") ?? "冒険者";
  const emoji = searchParams.get("emoji") ?? "🗺️";

  const isVictory = issue !== null;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: 1200,
          height: 630,
          background: "#0a0a1a",
          color: "#e0e8ff",
          fontFamily: "monospace",
          padding: "48px 56px",
          position: "relative",
          border: "8px solid #ffd700",
          boxSizing: "border-box",
        }}
      >
        {/* Scanline overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 6px)",
            pointerEvents: "none",
          }}
        />

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div style={{ color: "#ffd700", fontSize: 28, letterSpacing: 6 }}>⚔ CLAUDE QUEST ⚔</div>
          <div style={{ color: "#8899aa", fontSize: 20 }}>{org}/{repo}</div>
        </div>

        {/* Main content */}
        {isVictory ? (
          // Victory card
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div style={{ color: "#ffd700", fontSize: 52, fontWeight: "bold", marginBottom: 12 }}>
              ⚔ QUEST CLEAR ⚔
            </div>
            <div style={{ color: "#00ffcc", fontSize: 32, marginBottom: 8, display: "flex" }}>
              Issue #{issue}
            </div>
            <div style={{ color: "#e0e8ff", fontSize: 26, marginBottom: 32, display: "flex" }}>
              {title.length > 48 ? title.slice(0, 48) + "..." : title}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 32, marginBottom: 24 }}>
              <div style={{ fontSize: 80 }}>{emoji}</div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ color: "#8899aa", fontSize: 22, marginBottom: 4 }}>{cls}</div>
                <div style={{ color: "#ffd700", fontSize: 36, fontWeight: "bold" }}>Lv.{level}</div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  background: "#ffd70022",
                  border: "2px solid #ffd700",
                  padding: "12px 24px",
                  borderRadius: 4,
                }}
              >
                <div style={{ color: "#ffaa00", fontSize: 18, marginBottom: 4 }}>EXP GAINED</div>
                <div style={{ color: "#ffd700", fontSize: 44, fontWeight: "bold" }}>+{exp}</div>
              </div>
            </div>
          </div>
        ) : (
          // Default repo card
          <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
            <div style={{ fontSize: 100, marginBottom: 16 }}>{emoji}</div>
            <div style={{ color: "#ffd700", fontSize: 48, fontWeight: "bold", marginBottom: 8 }}>
              {cls}
            </div>
            <div style={{ color: "#8899aa", fontSize: 28 }}>Lv.{level} の冒険者が待つ王国</div>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #ffd70033",
            paddingTop: 16,
            marginTop: "auto",
          }}
        >
          <div style={{ color: "#8899aa", fontSize: 18 }}>
            claude-quest.vercel.app/{org}/{repo}
          </div>
          <div style={{ color: "#ffd70088", fontSize: 16 }}>#ClaudeQuest</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
