"use client";

import type { GameData } from "@/types";

const VT323 = { fontFamily: "'VT323', monospace" };
const PS2P = { fontFamily: "'Press Start 2P', monospace" };

function Bar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-8 text-sm shrink-0" style={{ ...VT323, color }}>{label}</span>
      <div className="flex-1 h-3 bg-[#1a1a2e] border border-[#ffffff22] rounded-sm overflow-hidden">
        <div className="h-full transition-all duration-500" style={{ width: `${Math.min((value / max) * 100, 100)}%`, background: color }} />
      </div>
      <span className="text-sm text-[#8899aa] w-20 text-right shrink-0" style={VT323}>
        {value}/{max}
      </span>
    </div>
  );
}

export function StatusScreen({ gameData }: { gameData: GameData }) {
  const { skills, mcpServers, characterClass, primaryLanguage, openIssueCount } = gameData;
  const level = Math.max(1, skills.length * 2 + mcpServers.length);
  const hp = 100;
  const mp = skills.length * 20 || 20;
  const exp = ((skills.length % 5) / 5) * 100;

  return (
    <div className="space-y-4">
      {/* Character card */}
      <div className="p-5 rounded" style={{ border: "2px solid #ffd700", background: "#0f1629" }}>
        <div className="flex items-start gap-4">
          <div className="text-5xl mt-1">{characterClass.emoji}</div>
          <div className="flex-1 min-w-0">
            <p className="text-[#ffd700] text-sm mb-1 truncate" style={PS2P}>
              {gameData.config.name ?? gameData.repo}
            </p>
            <p className="text-[#8899aa] text-lg mb-3" style={VT323}>
              {characterClass.name} / Lv.{level}
            </p>
            <div className="space-y-2">
              <Bar value={hp} max={hp} color="#00cc44" label="HP" />
              <Bar value={mp} max={mp} color="#4488ff" label="MP" />
              <Bar value={Math.round(exp)} max={100} color="#ffaa00" label="EXP" />
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-[#ffd70022] grid grid-cols-3 gap-2 text-center">
          {[
            { value: skills.length, label: "習得呪文" },
            { value: mcpServers.length, label: "装備MCP" },
            { value: openIssueCount, label: "クエスト" },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-[#ffd700] text-xl" style={VT323}>{value}</div>
              <div className="text-[#8899aa] text-sm" style={VT323}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Spell list */}
      <div className="p-4 rounded" style={{ border: "2px solid #ffd70044", background: "#0f1629" }}>
        <p className="text-[#ffd700] text-[10px] mb-4" style={PS2P}>◆ 習得済み呪文</p>
        {skills.length === 0 ? (
          <p className="text-[#8899aa] text-lg" style={VT323}>呪文が見つかりませんでした</p>
        ) : (
          <div className="space-y-3">
            {skills.map((skill) => (
              <div key={skill.name} className="flex items-start gap-3 border-b border-[#ffffff08] pb-2 last:border-0 last:pb-0">
                <span
                  className="text-[#00ffcc] text-base shrink-0 w-36"
                  style={VT323}
                >
                  {skill.name}
                </span>
                <span className="text-[#aabbcc] text-base leading-snug" style={VT323}>
                  {skill.description || "—"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="p-3 rounded text-center text-base text-[#8899aa]"
        style={{ border: "1px solid #ffd70022", background: "#0f1629", ...VT323 }}
      >
        主要言語: <span className="text-[#ffd700]">{primaryLanguage}</span>
        {" ／ "}
        リポジトリ: <span className="text-[#ffd700]">{gameData.org}/{gameData.repo}</span>
      </div>
    </div>
  );
}
