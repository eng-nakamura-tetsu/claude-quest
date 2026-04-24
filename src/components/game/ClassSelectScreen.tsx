"use client";

import type { CharacterClass } from "@/types";
import { ALL_CLASSES } from "@/lib/classes";
import { useState } from "react";

const VT323 = { fontFamily: "'VT323', monospace" };
const PS2P = { fontFamily: "'Press Start 2P', monospace" };

type Props = {
  recommended: CharacterClass;
  onSelect: (cls: CharacterClass) => void;
};

export function ClassSelectScreen({ recommended, onSelect }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<CharacterClass>(recommended);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a1a]/90 p-4">
      <div
        className="w-full max-w-2xl rounded p-6 overflow-y-auto max-h-[90vh]"
        style={{ border: "2px solid #ffd700", background: "#0f1629" }}
      >
        <p className="text-center text-[#ffd700] text-[10px] mb-1" style={PS2P}>
          ◆ 職業を選べ！
        </p>
        <p className="text-center text-[#8899aa] text-base mb-6" style={VT323}>
          あなたの戦い方を決める大切な選択じゃ
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {ALL_CLASSES.map((cls) => {
            const isRecommended = cls.name === recommended.name;
            const isSelected = cls.name === selected.name;
            const isHovered = hovered === cls.name;

            return (
              <button
                key={cls.name}
                onClick={() => setSelected(cls)}
                onMouseEnter={() => setHovered(cls.name)}
                onMouseLeave={() => setHovered(null)}
                className="relative text-left p-3 rounded transition-all cursor-pointer"
                style={{
                  border: `2px solid ${isSelected ? "#ffd700" : isHovered ? "#ffd70088" : "#ffd70033"}`,
                  background: isSelected ? "#ffd70018" : isHovered ? "#ffd70008" : "transparent",
                  boxShadow: isSelected ? "0 0 16px rgba(255,215,0,0.25)" : "none",
                }}
              >
                {isRecommended && (
                  <span
                    className="absolute top-1 right-1 text-[8px] text-[#0a0a1a] bg-[#ffd700] px-1 leading-tight"
                    style={PS2P}
                  >
                    推奨
                  </span>
                )}
                <div className="text-3xl mb-1">{cls.emoji}</div>
                <p className="text-[#ffd700] text-sm leading-tight mb-0.5" style={VT323}>
                  {cls.name}
                </p>
                <p className="text-[#8899aa] text-sm leading-tight" style={VT323}>
                  {cls.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Selected preview */}
        <div
          className="flex items-center gap-4 p-3 rounded mb-4"
          style={{ border: "1px solid #ffd70044", background: "#0a0a1a" }}
        >
          <div className="text-4xl">{selected.emoji}</div>
          <div>
            <p className="text-[#ffd700] text-base" style={VT323}>
              {selected.name}
            </p>
            <p className="text-[#8899aa] text-sm" style={VT323}>
              {selected.description}
            </p>
          </div>
        </div>

        <button
          onClick={() => onSelect(selected)}
          className="w-full py-3 text-[10px] bg-[#ffd700] text-[#0a0a1a] cursor-pointer hover:opacity-90 transition-opacity"
          style={PS2P}
        >
          この職業で冒険する！
        </button>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .fixed > div { animation: fadeIn 0.2s ease-out; }
      `}</style>
    </div>
  );
}
