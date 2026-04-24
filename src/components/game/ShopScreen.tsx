"use client";

import { useState, useEffect } from "react";
import type { GameData } from "@/types";

const VT323 = { fontFamily: "'VT323', monospace" };
const PS2P = { fontFamily: "'Press Start 2P', monospace" };

const CATEGORY_EFFECT: Record<string, string> = {
  search: "🔍 調査系呪文の威力 +30%",
  code: "⚔️ 開発系呪文の威力 +30%",
  data: "📊 分析系呪文の威力 +30%",
  communication: "📢 提案系呪文の威力 +30%",
  other: "✨ 全呪文の威力 +10%",
};

const CATEGORY_BADGE: Record<string, string> = {
  search: "🔍 search",
  code: "⚔️ code",
  data: "📊 data",
  communication: "📢 communication",
  other: "✨ other",
};

const MAX_EQUIPPED = 3;

export function ShopScreen({ gameData }: { gameData: GameData }) {
  const { mcpServers, org, repo } = gameData;
  const storageKey = `claude-quest-equipped-${org}-${repo}`;

  const [equipped, setEquipped] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const arr = JSON.parse(raw) as string[];
        setEquipped(new Set(arr));
      }
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  const toggle = (name: string) => {
    setEquipped((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        if (next.size >= MAX_EQUIPPED) return prev; // slots full, do nothing
        next.add(name);
      }
      try {
        localStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const equippedArray = Array.from(equipped);

  return (
    <div className="space-y-4">
      {/* Equipment slots */}
      <div
        className="p-3 rounded"
        style={{ border: "2px solid #ffd700", background: "#0f1629" }}
      >
        <p className="text-[#ffd700] text-[10px] mb-3" style={PS2P}>
          [ 装備スロット ]
        </p>
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => {
            const name = equippedArray[i];
            return (
              <div
                key={i}
                className="flex-1 text-center py-2 px-1 rounded-sm"
                style={{
                  border: `1px solid ${name ? "#ffd700" : "#ffd70033"}`,
                  background: name ? "#ffd70011" : "transparent",
                  minWidth: 0,
                }}
              >
                <p className="text-base truncate" style={VT323}>
                  {name ? (
                    <span className="text-[#ffd700]">{name.slice(0, 10)}</span>
                  ) : (
                    <span className="text-[#8899aa]">——</span>
                  )}
                </p>
              </div>
            );
          })}
        </div>
        <p className="text-[#8899aa] text-[10px] mt-2 text-right" style={PS2P}>
          {equipped.size} / {MAX_EQUIPPED}
        </p>
      </div>

      {/* MCP list */}
      <div
        className="p-4 rounded"
        style={{ border: "2px solid #ffd700", background: "#0f1629" }}
      >
        <p className="text-[#ffd700] text-[10px] mb-1" style={PS2P}>
          ⚒ MCP 武器屋
        </p>
        <p className="text-[#8899aa] text-[10px] mb-4">
          装備するMCPを選んでください（最大{MAX_EQUIPPED}個）
        </p>

        {mcpServers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[#8899aa] text-xs mb-2">
              MCPサーバーが見つかりませんでした
            </p>
            <p className="text-[#8899aa] text-[10px]">
              .mcp.json を追加すると武器が並びます
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {mcpServers.map((mcp) => {
              const isEquipped = equipped.has(mcp.name);
              const slotsFull = !isEquipped && equipped.size >= MAX_EQUIPPED;
              return (
                <div
                  key={mcp.name}
                  className="relative p-3 rounded"
                  style={{
                    border: `2px solid ${isEquipped ? "#ffd700" : "#ffd70033"}`,
                    background: isEquipped ? "#ffd70011" : "transparent",
                    boxShadow: isEquipped
                      ? "0 0 12px rgba(255,215,0,0.2)"
                      : "none",
                  }}
                >
                  {/* Category badge */}
                  <div
                    className="absolute top-2 right-2 px-1 rounded-sm text-[10px]"
                    style={{
                      background: "#1a1a2e",
                      border: "1px solid #ffd70044",
                      color: "#8899aa",
                      fontFamily: "'VT323', monospace",
                      fontSize: 13,
                    }}
                  >
                    {CATEGORY_BADGE[mcp.category] ?? mcp.category}
                  </div>

                  <div className="flex items-center justify-between gap-2 pr-24">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#00ffcc]" style={VT323}>
                        {mcp.name}
                      </p>
                      {mcp.description && (
                        <p className="text-sm text-[#8899aa] mt-0.5" style={VT323}>
                          {mcp.description}
                        </p>
                      )}
                      {mcp.command && (
                        <p
                          className="text-[10px] text-[#8899aa66] mt-0.5 font-mono"
                          style={VT323}
                        >
                          {mcp.command}
                        </p>
                      )}
                      {isEquipped && (
                        <p
                          className="text-sm mt-1"
                          style={{ ...VT323, color: "#ffd700" }}
                        >
                          {CATEGORY_EFFECT[mcp.category] ?? ""}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => !slotsFull && toggle(mcp.name)}
                      disabled={slotsFull}
                      className="ml-3 px-3 py-1 text-[10px] border transition-colors shrink-0"
                      style={{
                        ...PS2P,
                        borderColor: slotsFull ? "#555566" : "#ffd700",
                        background: isEquipped
                          ? "#ffd700"
                          : slotsFull
                          ? "transparent"
                          : "transparent",
                        color: isEquipped
                          ? "#0a0a1a"
                          : slotsFull
                          ? "#555566"
                          : "#ffd700",
                        cursor: slotsFull ? "not-allowed" : "pointer",
                        opacity: slotsFull ? 0.5 : 1,
                      }}
                    >
                      {isEquipped ? "外す" : slotsFull ? "スロット満" : "装備する"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
