"use client";

import type { GameData } from "@/types";

const VT323 = { fontFamily: "'VT323', monospace" };
const PS2P = { fontFamily: "'Press Start 2P', monospace" };

export function LevelUpScreen({ gameData, onClose }: { gameData: GameData; onClose: () => void }) {
  const { level, skills, mcpServers } = gameData;
  const prevLevel = Math.max(1, level - 1);

  const currentHp = level * 80 + 100;
  const prevHp = prevLevel * 80 + 100;
  const currentMp = skills.length * 20 || 20;
  const prevMp = currentMp; // MP doesn't change on level-up, only skill count does

  const stats: { label: string; before: number; after: number }[] = [
    { label: "HP", before: prevHp, after: currentHp },
    { label: "MP", before: prevMp, after: currentMp },
    { label: "呪文数", before: skills.length, after: skills.length },
    { label: "装備MCP", before: mcpServers.length, after: mcpServers.length },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.85)" }}
    >
      <style>{`
        @keyframes flash {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .level-up-flash {
          animation: flash 1s ease-in-out infinite;
        }
      `}</style>

      <div
        className="w-full max-w-md mx-4 p-8 rounded"
        style={{ border: "3px solid #ffd700", background: "#0a0a1a" }}
      >
        {/* Title */}
        <p
          className="text-center text-[#ffd700] text-sm mb-6 level-up-flash"
          style={PS2P}
        >
          ⭐ LEVEL UP! ⭐
        </p>

        {/* Level transition */}
        <p className="text-center text-[#e0e8ff] text-2xl mb-6" style={VT323}>
          Lv.<span className="text-[#aabbcc]">{prevLevel}</span>
          {"  →  "}
          <span className="text-[#ffd700]">Lv.{level}</span>
        </p>

        {/* Stats table */}
        <div
          className="mb-6 p-4 rounded"
          style={{ border: "1px solid #ffd70044", background: "#0f1629" }}
        >
          <div className="grid grid-cols-3 gap-2 mb-2">
            <span className="text-[#8899aa] text-base" style={VT323}>STAT</span>
            <span className="text-[#8899aa] text-base text-right" style={VT323}>BEFORE</span>
            <span className="text-[#ffd700] text-base text-right" style={VT323}>AFTER</span>
          </div>
          <div className="border-t border-[#ffffff11] mb-2" />
          {stats.map(({ label, before, after }) => (
            <div key={label} className="grid grid-cols-3 gap-2 py-1">
              <span className="text-[#e0e8ff] text-base" style={VT323}>{label}</span>
              <span className="text-[#8899aa] text-base text-right" style={VT323}>{before}</span>
              <span
                className="text-base text-right"
                style={{ ...VT323, color: after > before ? "#00cc44" : "#e0e8ff" }}
              >
                {after}
                {after > before && <span className="text-[#00cc44] ml-1">▲</span>}
              </span>
            </div>
          ))}
        </div>

        {/* Flavor text */}
        <p className="text-center text-[#00ffcc] text-xl mb-6" style={VT323}>
          ✨ 新しい呪文を習得できる！
        </p>

        {/* Close button */}
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-8 py-3 text-sm border-2 transition-colors cursor-pointer hover:bg-[#ffd700] hover:text-[#0a0a1a]"
            style={{
              ...PS2P,
              borderColor: "#ffd700",
              color: "#ffd700",
              background: "transparent",
            }}
          >
            つぎへ
          </button>
        </div>
      </div>
    </div>
  );
}
