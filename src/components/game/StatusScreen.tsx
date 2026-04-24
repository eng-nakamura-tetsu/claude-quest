"use client";

import type { GameData, Contributor } from "@/types";

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

function isAiBot(login: string): boolean {
  const lower = login.toLowerCase();
  return lower.includes("claude") || lower.includes("[bot]") || lower.endsWith("-bot") || lower.endsWith("_bot");
}

function agentDisplayName(login: string): string {
  const lower = login.toLowerCase();
  if (lower.includes("claude")) return "ドキお";
  return login.replace("[bot]", "").replace(/-bot$/, "").replace(/_bot$/, "");
}

function agentRole(login: string): { role: string; skill: string } {
  const lower = login.toLowerCase();
  if (lower.includes("claude")) return { role: "魔法使い", skill: "コード生成・PR作成・バグ修正" };
  if (lower.includes("renovate")) return { role: "鍛冶師", skill: "依存関係の自動更新" };
  if (lower.includes("dependabot")) return { role: "見張り番", skill: "セキュリティパッチ適用" };
  if (lower.includes("github-actions")) return { role: "自動兵", skill: "CI/CD自動化" };
  return { role: "召喚獣", skill: "自動化サポート" };
}

function AgentCard({ contributor }: { contributor: Contributor }) {
  const name = agentDisplayName(contributor.login);
  const { role, skill } = agentRole(contributor.login);
  const level = Math.max(1, Math.floor(Math.sqrt(contributor.contributions * 2)));
  const hp = level * 60 + 80;

  return (
    <div
      className="p-3 rounded flex items-center gap-3"
      style={{
        background: "linear-gradient(135deg, #1a0a2e 0%, #0f0a1e 100%)",
        border: "1.5px solid #cc44ff",
        boxShadow: "0 0 10px #cc44ff33",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 4,
          background: "linear-gradient(135deg, #2d0a4e 0%, #1a0a2e 100%)",
          border: "1.5px solid #cc44ff99",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 26,
          flexShrink: 0,
          boxShadow: "inset 0 0 8px #cc44ff44",
        }}
      >
        ✦
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className="text-base leading-none" style={{ ...VT323, color: "#cc44ff" }}>{name}</span>
          <span className="text-sm leading-none" style={{ ...VT323, color: "#9944cc" }}>Lv.{level}</span>
          <span className="text-sm leading-none" style={{ ...VT323, color: "#8877aa" }}>{role}</span>
        </div>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="flex-1 h-2 rounded-sm overflow-hidden" style={{ background: "#1a0a2e", border: "1px solid #cc44ff33" }}>
            <div className="h-full" style={{ width: "100%", background: "linear-gradient(90deg, #cc44ff, #ff44cc)" }} />
          </div>
          <span className="text-sm shrink-0" style={{ ...VT323, color: "#9944cc" }}>HP {hp}/{hp}</span>
        </div>
        <div className="text-sm leading-snug" style={{ ...VT323, color: "#8877aa" }}>
          特技: {skill}
        </div>
      </div>

      {/* Contribution badge */}
      <div className="flex flex-col items-center shrink-0">
        <span className="text-xl leading-none" style={{ ...VT323, color: "#cc44ff" }}>{contributor.contributions}</span>
        <span className="text-sm leading-none" style={{ ...VT323, color: "#9944cc" }}>コミット</span>
      </div>
    </div>
  );
}

function ContributorAvatar({ contributor }: { contributor: Contributor }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={contributor.avatarUrl}
          alt={contributor.login}
          style={{ imageRendering: "pixelated", width: 32, height: 32, borderRadius: 2 }}
        />
        <span
          className="absolute -top-1 -right-1 text-[10px] text-[#0a0a1a] bg-[#ffd700] px-0.5 leading-tight"
          style={{ ...VT323, fontSize: 10, minWidth: 14, textAlign: "center" }}
        >
          {contributor.contributions}
        </span>
      </div>
      <span className="text-[9px] text-[#8899aa] text-center leading-none max-w-[36px] truncate" style={VT323}>
        {contributor.login}
      </span>
    </div>
  );
}

export function StatusScreen({
  gameData,
  onChangeClass,
}: {
  gameData: GameData;
  onChangeClass?: () => void;
}) {
  const { skills, mcpServers, characterClass, primaryLanguage, openIssueCount, contributors, level, exp } = gameData;
  const hp = level * 80 + 100;
  const mp = skills.length * 20 || 20;

  const agents = contributors.filter((c) => isAiBot(c.login));
  const humans = contributors.filter((c) => !isAiBot(c.login)).slice(0, 8);

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
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-[#8899aa] text-lg" style={VT323}>
                {characterClass.name} / Lv.{level}
              </p>
              {onChangeClass && (
                <button
                  onClick={onChangeClass}
                  className="text-[8px] text-[#ffd700] border border-[#ffd70066] px-1.5 py-0.5 cursor-pointer hover:bg-[#ffd70022] transition-colors shrink-0"
                  style={PS2P}
                >
                  変更
                </button>
              )}
            </div>
            <p className="text-[#6677aa] text-sm mb-3" style={VT323}>
              {characterClass.description}
            </p>
            <div className="space-y-2">
              <Bar value={hp} max={hp} color="#00cc44" label="HP" />
              <Bar value={mp} max={mp} color="#4488ff" label="MP" />
              <Bar value={Math.round(exp)} max={100} color="#ffaa00" label="EXP" />
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-[#ffd70022] grid grid-cols-4 gap-2 text-center">
          {[
            { value: skills.length, label: "習得呪文" },
            { value: mcpServers.length, label: "装備MCP" },
            { value: openIssueCount, label: "クエスト" },
            { value: contributors.length, label: "仲間" },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-[#ffd700] text-xl" style={VT323}>{value}</div>
              <div className="text-[#8899aa] text-sm" style={VT323}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AI agents — party members */}
      {agents.length > 0 && (
        <div className="p-4 rounded" style={{ border: "2px solid #cc44ff66", background: "#0f1629" }}>
          <p className="text-[10px] mb-4" style={{ ...PS2P, color: "#cc44ff" }}>✦ パーティーメンバー</p>
          <div className="space-y-3">
            {agents.map((agent) => (
              <AgentCard key={agent.login} contributor={agent} />
            ))}
          </div>
        </div>
      )}

      {/* Human contributors */}
      {humans.length > 0 && (
        <div className="p-4 rounded" style={{ border: "2px solid #ffd70044", background: "#0f1629" }}>
          <p className="text-[#ffd700] text-[10px] mb-4" style={PS2P}>◆ 仲間</p>
          <div className="flex flex-wrap gap-3">
            {humans.map((contributor) => (
              <ContributorAvatar key={contributor.login} contributor={contributor} />
            ))}
          </div>
        </div>
      )}

      {/* Spell list */}
      <div className="p-4 rounded" style={{ border: "2px solid #ffd70044", background: "#0f1629" }}>
        <p className="text-[#ffd700] text-[10px] mb-4" style={PS2P}>◆ 習得済み呪文</p>
        {skills.length === 0 ? (
          <p className="text-[#8899aa] text-lg" style={VT323}>呪文が見つかりませんでした</p>
        ) : (
          <div className="space-y-3">
            {skills.map((skill) => (
              <div key={skill.name} className="flex items-start gap-3 border-b border-[#ffffff08] pb-2 last:border-0 last:pb-0">
                <span className="text-[#00ffcc] text-base shrink-0 w-36" style={VT323}>{skill.name}</span>
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
