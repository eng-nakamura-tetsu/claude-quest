"use client";

import { useState } from "react";
import type { GameData } from "@/types";

type Phase = "command" | "magic" | "casting" | "result";

export function BattleScreen({ gameData }: { gameData: GameData }) {
  const { skills, openIssueCount } = gameData;
  const [phase, setPhase] = useState<Phase>("command");
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [bossHp, setBossHp] = useState(100);
  const [damage, setDamage] = useState<number | null>(null);
  const [log, setLog] = useState<string[]>([`ボス「Issue #${openIssueCount || "??"}」があらわれた！`]);

  const cast = () => {
    if (!prompt.trim()) return;
    const dmg = Math.floor(30 + prompt.length * 0.5 + Math.random() * 20);
    const next = Math.max(0, bossHp - dmg);
    setBossHp(next);
    setDamage(dmg);
    setLog((l) => [
      ...l,
      `${selectedSkill} を唱えた！`,
      `${dmg} のダメージ！`,
      next <= 0 ? "ボスを倒した！ 🎉 PRを作成した！" : `ボスのHPが残り ${next}！`,
    ]);
    setPhase("result");
    setTimeout(() => setDamage(null), 1500);
  };

  const reset = () => {
    setPhase("command");
    setSelectedSkill(null);
    setPrompt("");
    setBossHp(100);
    setLog([`ボス「Issue #${openIssueCount || "??"}」があらわれた！`]);
  };

  return (
    <div className="space-y-4">
      {/* Boss area */}
      <div
        className="p-4 rounded text-center relative"
        style={{ border: "2px solid #ffd70044", background: "#0f1629" }}
      >
        <p className="text-[#8899aa] text-[10px] mb-2">
          ボス: Issue #{openIssueCount || "??"}
        </p>
        <div
          className="text-5xl mb-3 inline-block"
          style={{ animation: phase === "casting" ? "shake 0.5s" : "float 3s ease-in-out infinite" }}
        >
          👾
        </div>
        <div className="flex items-center gap-2 max-w-xs mx-auto">
          <span className="text-[10px] text-[#ff4444] w-6">HP</span>
          <div className="flex-1 h-3 bg-[#1a1a2e] border border-[#ffffff22] rounded-sm overflow-hidden">
            <div
              className="h-full transition-all duration-700"
              style={{ width: `${bossHp}%`, background: "#ff4444" }}
            />
          </div>
          <span className="text-[10px] text-[#8899aa]">{bossHp}</span>
        </div>

        {/* Floating damage */}
        {damage !== null && (
          <div
            className="absolute top-4 right-8 text-[#ffd700] font-bold text-lg pointer-events-none"
            style={{
              fontFamily: "'Press Start 2P', monospace",
              animation: "floatUp 1.5s forwards",
            }}
          >
            -{damage}
          </div>
        )}
      </div>

      {/* Command area */}
      <div
        className="p-4 rounded"
        style={{ border: "2px solid #ffd700", background: "#0f1629" }}
      >
        {phase === "command" && (
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "たたかう", action: () => setPhase("result") },
              { label: "まほう",   action: () => setPhase("magic") },
              { label: "どうぐ",   action: () => {} },
              { label: "にげる",   action: reset },
            ].map((cmd) => (
              <button
                key={cmd.label}
                onClick={cmd.action}
                className="py-3 text-[10px] border-2 border-[#ffd700] text-[#ffd700] hover:bg-[#ffd700] hover:text-[#0a0a1a] transition-colors cursor-pointer"
                style={{ fontFamily: "'Press Start 2P', monospace" }}
              >
                {cmd.label}
              </button>
            ))}
          </div>
        )}

        {phase === "magic" && (
          <div className="space-y-2">
            <p
              className="text-[#ffd700] text-[10px] mb-3"
              style={{ fontFamily: "'Press Start 2P', monospace" }}
            >
              ◆ 呪文を選べ
            </p>
            {skills.length === 0 ? (
              <p className="text-[#8899aa] text-xs">呪文がない！</p>
            ) : (
              skills.map((s) => (
                <button
                  key={s.name}
                  onClick={() => { setSelectedSkill(s.name); setPhase("casting"); }}
                  className="w-full text-left px-3 py-2 text-xs border border-[#ffd70044] text-[#00ffcc] hover:border-[#ffd700] transition-colors cursor-pointer"
                >
                  {s.name}
                </button>
              ))
            )}
            <button
              onClick={() => setPhase("command")}
              className="text-[10px] text-[#8899aa] mt-2 cursor-pointer"
            >
              ← もどる
            </button>
          </div>
        )}

        {phase === "casting" && (
          <div className="space-y-3">
            <p
              className="text-[#ffd700] text-[10px]"
              style={{ fontFamily: "'Press Start 2P', monospace" }}
            >
              ◆ {selectedSkill} を詠唱
            </p>
            <p className="text-[#8899aa] text-[10px]">プロンプトを入力してください:</p>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="例: /register で重複メール時に 400 を返したい"
              rows={3}
              className="w-full bg-[#1a1a2e] border border-[#ffd70044] text-[#e0e8ff] text-xs p-2 resize-none outline-none focus:border-[#ffd700] rounded-sm"
            />
            <button
              onClick={cast}
              className="w-full py-2 text-[10px] bg-[#ffd700] text-[#0a0a1a] cursor-pointer hover:opacity-90 transition-opacity"
              style={{ fontFamily: "'Press Start 2P', monospace" }}
            >
              詠唱する！
            </button>
          </div>
        )}

        {phase === "result" && (
          <div className="space-y-3">
            <div className="max-h-32 overflow-y-auto space-y-1">
              {log.map((l, i) => (
                <p key={i} className="text-xs text-[#e0e8ff]">
                  {l}
                </p>
              ))}
            </div>
            <button
              onClick={bossHp <= 0 ? reset : () => setPhase("command")}
              className="w-full py-2 text-[10px] border-2 border-[#ffd700] text-[#ffd700] hover:bg-[#ffd700] hover:text-[#0a0a1a] transition-colors cursor-pointer"
              style={{ fontFamily: "'Press Start 2P', monospace" }}
            >
              {bossHp <= 0 ? "つぎのボスへ" : "つづける"}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
        @keyframes floatUp { 0%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-40px)} }
      `}</style>
    </div>
  );
}
