"use client";

import { useState } from "react";
import type { GameData, Issue } from "@/types";

const VT323 = { fontFamily: "'VT323', monospace" };
const PS2P = { fontFamily: "'Press Start 2P', monospace" };

const BOSS_EMOJIS = ["👾", "🐉", "💀", "🦇", "🧟", "🕷️", "👹", "🤖"];
const DIFF_STARS = (d: number) => "★".repeat(d) + "☆".repeat(5 - d);

type Phase = "select" | "command" | "magic" | "casting" | "result" | "victory";

export function BattleScreen({ gameData }: { gameData: GameData }) {
  const { skills, issues } = gameData;

  const [phase, setPhase] = useState<Phase>(issues.length > 0 ? "select" : "command");
  const [currentIssue, setCurrentIssue] = useState<Issue | null>(null);
  const [bossEmoji] = useState(() => BOSS_EMOJIS[Math.floor(Math.random() * BOSS_EMOJIS.length)]);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [bossHp, setBossHp] = useState(100);
  const [bossMaxHp, setBossMaxHp] = useState(100);
  const [damage, setDamage] = useState<number | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [shaking, setShaking] = useState(false);

  const selectIssue = (issue: Issue) => {
    setCurrentIssue(issue);
    setBossHp(issue.hp);
    setBossMaxHp(issue.hp);
    setLog([`ボス「Issue #${issue.number}: ${issue.title.slice(0, 24)}...」があらわれた！`]);
    setPhase("command");
  };

  const cast = () => {
    if (!prompt.trim() || !currentIssue) return;
    const baseDmg = Math.floor(10 + prompt.length * 0.4 + Math.random() * 15);
    const dmg = Math.min(baseDmg, bossHp);
    const next = bossHp - dmg;
    setBossHp(next);
    setDamage(dmg);
    setShaking(true);
    setTimeout(() => setShaking(false), 600);

    const newLog = [
      ...log,
      `${selectedSkill} を唱えた！`,
      `${dmg} のダメージ！`,
    ];
    if (next <= 0) {
      newLog.push(`🎉 Issue #${currentIssue.number} を倒した！ PR を作成せよ！`);
      setLog(newLog);
      setTimeout(() => setPhase("victory"), 800);
    } else {
      newLog.push(`ボスのHPが残り ${next}！`);
      setLog(newLog);
      setPhase("result");
    }
    setTimeout(() => setDamage(null), 1500);
  };

  const nextBoss = () => {
    setPhase("select");
    setCurrentIssue(null);
    setSelectedSkill(null);
    setPrompt("");
    setLog([]);
  };

  return (
    <div className="space-y-4">
      {/* Boss area */}
      {phase !== "select" && (
        <div
          className="p-4 rounded text-center relative overflow-hidden"
          style={{ border: "2px solid #ffd70044", background: "#0f1629" }}
        >
          {currentIssue && (
            <div className="mb-2">
              <p className="text-[#ffd700] text-sm truncate" style={VT323}>
                Issue #{currentIssue.number}: {currentIssue.title}
              </p>
              <p className="text-[#ff4444] text-xs" style={VT323}>
                難易度: {DIFF_STARS(currentIssue.difficulty)}
              </p>
            </div>
          )}

          <div
            className="text-6xl mb-3 inline-block"
            style={{
              animation: shaking
                ? "shake 0.6s"
                : phase === "victory"
                ? "none"
                : "float 3s ease-in-out infinite",
              filter: phase === "victory" ? "grayscale(1) opacity(0.4)" : "none",
              transition: "filter 0.5s",
            }}
          >
            {bossEmoji}
          </div>

          <div className="flex items-center gap-2 max-w-xs mx-auto">
            <span className="text-sm text-[#ff4444] w-6" style={VT323}>HP</span>
            <div className="flex-1 h-3 bg-[#1a1a2e] border border-[#ffffff22] rounded-sm overflow-hidden">
              <div
                className="h-full transition-all duration-700"
                style={{ width: `${(bossHp / bossMaxHp) * 100}%`, background: "#ff4444" }}
              />
            </div>
            <span className="text-sm text-[#8899aa]" style={VT323}>{bossHp}/{bossMaxHp}</span>
          </div>

          {damage !== null && (
            <div
              className="absolute top-4 right-6 text-[#ffd700] pointer-events-none"
              style={{ ...PS2P, fontSize: 14, animation: "floatUp 1.5s forwards" }}
            >
              -{damage}
            </div>
          )}
        </div>
      )}

      {/* Main panel */}
      <div className="p-4 rounded" style={{ border: "2px solid #ffd700", background: "#0f1629" }}>

        {/* Issue select */}
        {phase === "select" && (
          <div className="space-y-3">
            <p className="text-[#ffd700] text-[10px] mb-3" style={PS2P}>◆ クエストを選べ</p>
            {issues.length === 0 ? (
              <p className="text-[#8899aa] text-lg" style={VT323}>オープンなIssueが見つかりませんでした</p>
            ) : (
              issues.map((issue) => (
                <button
                  key={issue.number}
                  onClick={() => selectIssue(issue)}
                  className="w-full text-left p-3 border border-[#ffd70044] hover:border-[#ffd700] hover:bg-[#ffd70011] transition-colors cursor-pointer rounded-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <span className="text-[#00ffcc] text-base" style={VT323}>#{issue.number} </span>
                      <span className="text-[#e0e8ff] text-base" style={VT323}>{issue.title}</span>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-[#ff4444] text-sm" style={VT323}>{DIFF_STARS(issue.difficulty)}</div>
                      <div className="text-[#8899aa] text-sm" style={VT323}>HP:{issue.hp}</div>
                    </div>
                  </div>
                  {issue.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {issue.labels.map((l) => (
                        <span key={l} className="text-[10px] text-[#8899aa] border border-[#ffffff22] px-1" style={VT323}>{l}</span>
                      ))}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        )}

        {/* Command */}
        {phase === "command" && (
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "たたかう", action: () => { setLog((l) => [...l, "たたかう！ 普通攻撃をした！ 5のダメージ！"]); setBossHp((h) => Math.max(0, h - 5)); setPhase("result"); } },
              { label: "まほう",   action: () => setPhase("magic") },
              { label: "ようすをみる", action: () => { setLog((l) => [...l, `Issue #${currentIssue?.number} — ${currentIssue?.title}`]); setPhase("result"); } },
              { label: "にげる",   action: nextBoss },
            ].map((cmd) => (
              <button
                key={cmd.label}
                onClick={cmd.action}
                className="py-3 text-[10px] border-2 border-[#ffd700] text-[#ffd700] hover:bg-[#ffd700] hover:text-[#0a0a1a] transition-colors cursor-pointer"
                style={PS2P}
              >
                {cmd.label}
              </button>
            ))}
          </div>
        )}

        {/* Magic selection */}
        {phase === "magic" && (
          <div className="space-y-2">
            <p className="text-[#ffd700] text-[10px] mb-3" style={PS2P}>◆ 呪文を選べ</p>
            {skills.length === 0 ? (
              <p className="text-[#8899aa] text-lg" style={VT323}>呪文がない！</p>
            ) : (
              skills.map((s) => (
                <button
                  key={s.name}
                  onClick={() => { setSelectedSkill(s.name); setPhase("casting"); setPrompt(""); }}
                  className="w-full text-left px-3 py-2 text-lg border border-[#ffd70044] text-[#00ffcc] hover:border-[#ffd700] hover:bg-[#ffd70011] transition-colors cursor-pointer"
                  style={VT323}
                >
                  {s.name}
                  {s.description && <span className="text-[#8899aa] ml-2 text-base">— {s.description.slice(0, 40)}</span>}
                </button>
              ))
            )}
            <button onClick={() => setPhase("command")} className="text-sm text-[#8899aa] mt-2 cursor-pointer" style={VT323}>
              ← もどる
            </button>
          </div>
        )}

        {/* Casting */}
        {phase === "casting" && (
          <div className="space-y-3">
            <p className="text-[#ffd700] text-[10px]" style={PS2P}>◆ {selectedSkill} を詠唱</p>
            <p className="text-[#8899aa] text-lg" style={VT323}>プロンプトを入力（長いほど威力UP）:</p>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`${currentIssue?.title ?? "タスク"} を解決するには...`}
              rows={3}
              className="w-full bg-[#1a1a2e] border border-[#ffd70044] text-[#e0e8ff] text-base p-2 resize-none outline-none focus:border-[#ffd700] rounded-sm"
              style={VT323}
            />
            <p className="text-[#8899aa] text-sm text-right" style={VT323}>
              威力予測: {Math.floor(10 + prompt.length * 0.4)}〜{Math.floor(25 + prompt.length * 0.4)}
            </p>
            <button
              onClick={cast}
              className="w-full py-2 text-[10px] bg-[#ffd700] text-[#0a0a1a] cursor-pointer hover:opacity-90 transition-opacity"
              style={PS2P}
            >
              詠唱する！
            </button>
            <button onClick={() => setPhase("magic")} className="text-sm text-[#8899aa] cursor-pointer" style={VT323}>← もどる</button>
          </div>
        )}

        {/* Result / battle log */}
        {phase === "result" && (
          <div className="space-y-3">
            <div className="max-h-36 overflow-y-auto space-y-1 p-2 bg-[#1a1a2e] rounded-sm">
              {log.map((l, i) => (
                <p key={i} className="text-lg text-[#e0e8ff]" style={VT323}>{l}</p>
              ))}
            </div>
            <button
              onClick={() => { setSelectedSkill(null); setPrompt(""); setPhase("command"); }}
              className="w-full py-2 text-[10px] border-2 border-[#ffd700] text-[#ffd700] hover:bg-[#ffd700] hover:text-[#0a0a1a] transition-colors cursor-pointer"
              style={PS2P}
            >
              つづける
            </button>
          </div>
        )}

        {/* Victory */}
        {phase === "victory" && (
          <div className="text-center space-y-4 py-4">
            <p className="text-[#ffd700] text-[10px]" style={PS2P}>⚔ QUEST CLEAR ⚔</p>
            <p className="text-[#e0e8ff] text-xl" style={VT323}>
              Issue #{currentIssue?.number} を倒した！
            </p>
            <p className="text-[#ffaa00] text-2xl" style={VT323}>
              +{(currentIssue?.difficulty ?? 1) * 50} EXP 獲得！
            </p>
            <button
              onClick={nextBoss}
              className="px-6 py-2 text-[10px] bg-[#ffd700] text-[#0a0a1a] cursor-pointer hover:opacity-90 transition-opacity"
              style={PS2P}
            >
              つぎのクエストへ
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(6px)} }
        @keyframes floatUp { 0%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-50px)} }
      `}</style>
    </div>
  );
}
