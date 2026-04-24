"use client";

import type { GameData } from "@/types";

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-3 bg-[#1a1a2e] border border-[#ffffff22] rounded-sm overflow-hidden">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${(value / max) * 100}%`, background: color }}
        />
      </div>
      <span className="text-[10px] text-[#8899aa] w-16 text-right">
        {value}/{max}
      </span>
    </div>
  );
}

export function StatusScreen({ gameData }: { gameData: GameData }) {
  const { skills, mcpServers, characterClass, primaryLanguage, openIssueCount } = gameData;
  const level = Math.max(1, skills.length * 2 + mcpServers.length);
  const hp = 100;
  const mp = skills.length * 20;
  const exp = ((skills.length % 5) / 5) * 100;

  return (
    <div className="space-y-4">
      {/* Character card */}
      <div
        className="p-4 rounded"
        style={{ border: "2px solid #ffd700", background: "#0f1629" }}
      >
        <div className="flex items-start gap-4">
          {/* Pixel character */}
          <div className="text-4xl">{characterClass.emoji}</div>
          <div className="flex-1">
            <p
              className="text-[#ffd700] text-xs mb-1"
              style={{ fontFamily: "'Press Start 2P', monospace" }}
            >
              {gameData.config.name ?? `${gameData.repo}`}
            </p>
            <p className="text-[#8899aa] text-xs mb-2">
              {characterClass.name} / Lv.{level}
            </p>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-[#00cc44] w-6">HP</span>
                <Bar value={hp} max={hp} color="#00cc44" />
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-[#4488ff] w-6">MP</span>
                <Bar value={mp} max={skills.length * 20 || 20} color="#4488ff" />
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-[#ffaa00] w-6">EXP</span>
                <Bar value={exp} max={100} color="#ffaa00" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-[#ffd70022] grid grid-cols-3 gap-2 text-center text-[10px] text-[#8899aa]">
          <div>
            <div className="text-[#ffd700] text-xs">{skills.length}</div>
            <div>習得呪文</div>
          </div>
          <div>
            <div className="text-[#ffd700] text-xs">{mcpServers.length}</div>
            <div>装備MCP</div>
          </div>
          <div>
            <div className="text-[#ffd700] text-xs">{openIssueCount}</div>
            <div>クエスト</div>
          </div>
        </div>
      </div>

      {/* Spell list */}
      <div
        className="p-4 rounded"
        style={{ border: "2px solid #ffd70044", background: "#0f1629" }}
      >
        <p
          className="text-[#ffd700] text-[10px] mb-3"
          style={{ fontFamily: "'Press Start 2P', monospace" }}
        >
          ◆ 習得済み呪文
        </p>
        {skills.length === 0 ? (
          <p className="text-[#8899aa] text-xs">呪文が見つかりませんでした</p>
        ) : (
          <div className="space-y-2">
            {skills.map((skill) => (
              <div key={skill.name} className="flex items-start gap-2">
                <span className="text-[#00ffcc] text-xs w-28 shrink-0">{skill.name}</span>
                <span className="text-[#8899aa] text-[10px] leading-relaxed">
                  {skill.description || "—"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Language badge */}
      <div
        className="p-3 rounded text-center text-[10px] text-[#8899aa]"
        style={{ border: "1px solid #ffd70022", background: "#0f1629" }}
      >
        主要言語: <span className="text-[#ffd700]">{primaryLanguage}</span> ／ リポジトリ:{" "}
        <span className="text-[#ffd700]">
          {gameData.org}/{gameData.repo}
        </span>
      </div>
    </div>
  );
}
