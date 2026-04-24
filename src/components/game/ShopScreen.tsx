"use client";

import { useState } from "react";
import type { GameData } from "@/types";

export function ShopScreen({ gameData }: { gameData: GameData }) {
  const { mcpServers } = gameData;
  const [equipped, setEquipped] = useState<Set<string>>(new Set());

  const toggle = (name: string) => {
    setEquipped((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div
        className="p-4 rounded"
        style={{ border: "2px solid #ffd700", background: "#0f1629" }}
      >
        <p
          className="text-[#ffd700] text-[10px] mb-1"
          style={{ fontFamily: "'Press Start 2P', monospace" }}
        >
          ⚒ MCP 武器屋
        </p>
        <p className="text-[#8899aa] text-[10px] mb-4">
          装備するMCPを選んでください
        </p>

        {mcpServers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[#8899aa] text-xs mb-2">MCPサーバーが見つかりませんでした</p>
            <p className="text-[#8899aa] text-[10px]">
              .mcp.json を追加すると武器が並びます
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {mcpServers.map((mcp) => {
              const isEquipped = equipped.has(mcp.name);
              return (
                <div
                  key={mcp.name}
                  className="flex items-center justify-between p-3 rounded"
                  style={{
                    border: `2px solid ${isEquipped ? "#ffd700" : "#ffd70033"}`,
                    background: isEquipped ? "#ffd70011" : "transparent",
                    boxShadow: isEquipped ? "0 0 12px rgba(255,215,0,0.2)" : "none",
                  }}
                >
                  <div className="flex-1">
                    <p className="text-xs text-[#00ffcc]">{mcp.name}</p>
                    {mcp.description && (
                      <p className="text-[10px] text-[#8899aa] mt-0.5">{mcp.description}</p>
                    )}
                    {mcp.command && (
                      <p className="text-[10px] text-[#8899aa66] mt-0.5 font-mono">{mcp.command}</p>
                    )}
                  </div>
                  <button
                    onClick={() => toggle(mcp.name)}
                    className="ml-3 px-3 py-1 text-[10px] border transition-colors cursor-pointer shrink-0"
                    style={{
                      fontFamily: "'Press Start 2P', monospace",
                      borderColor: "#ffd700",
                      background: isEquipped ? "#ffd700" : "transparent",
                      color: isEquipped ? "#0a0a1a" : "#ffd700",
                    }}
                  >
                    {isEquipped ? "装備中" : "装備する"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div
        className="p-3 rounded text-center text-[10px] text-[#8899aa]"
        style={{ border: "1px solid #ffd70022", background: "#0f1629" }}
      >
        装備中: <span className="text-[#ffd700]">{equipped.size}</span> / {mcpServers.length} MCP
      </div>
    </div>
  );
}
