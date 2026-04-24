"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const go = () => {
    setError("");
    const match = url.match(/github\.com\/([^/]+)\/([^/\s]+)/);
    if (match) {
      router.push(`/${match[1]}/${match[2]}`);
      return;
    }
    const simple = url.trim().match(/^([^/\s]+)\/([^/\s]+)$/);
    if (simple) {
      router.push(`/${simple[1]}/${simple[2]}`);
      return;
    }
    setError("GitHub URL または org/repo 形式で入力してください");
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-[#e0e8ff] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* CRT overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50"
        style={{
          background:
            "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.08) 2px,rgba(0,0,0,0.08) 4px)",
        }}
      />

      <div className="relative z-10 w-full max-w-md text-center space-y-8">
        {/* Title */}
        <div>
          <h1
            className="text-[#ffd700] text-lg mb-2 leading-relaxed"
            style={{ fontFamily: "'Press Start 2P', monospace" }}
          >
            ⚔ CLAUDE
            <br />
            QUEST ⚔
          </h1>
          <p className="text-[#8899aa] text-xs leading-relaxed">
            あなたの組織の GitHub リポジトリを
            <br />
            ドラクエ風 RPG で体験しよう
          </p>
        </div>

        {/* Input */}
        <div
          className="p-6 rounded space-y-4"
          style={{ border: "2px solid #ffd700", background: "#0f1629" }}
        >
          <p
            className="text-[#ffd700] text-[10px]"
            style={{ fontFamily: "'Press Start 2P', monospace" }}
          >
            ◆ リポジトリを入力
          </p>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && go()}
            placeholder="org/repo または GitHub URL"
            className="w-full bg-[#1a1a2e] border border-[#ffd70044] text-[#e0e8ff] text-xs p-3 outline-none focus:border-[#ffd700] rounded-sm placeholder-[#8899aa44]"
          />
          {error && <p className="text-[#ff4444] text-[10px]">{error}</p>}
          <button
            onClick={go}
            className="w-full py-3 text-[10px] bg-[#ffd700] text-[#0a0a1a] cursor-pointer hover:opacity-90 transition-opacity"
            style={{ fontFamily: "'Press Start 2P', monospace" }}
          >
            ぼうけんにでる！
          </button>
        </div>

        {/* Demo links */}
        <div className="space-y-2">
          <p className="text-[#8899aa] text-[10px]">デモを試す:</p>
          <button
            onClick={() => router.push("/eng-nakamura-tetsu/claude-quest")}
            className="block w-full text-[10px] text-[#00ffcc] underline cursor-pointer hover:text-[#ffd700] transition-colors"
          >
            Claude Quest 自身のリポジトリ
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 text-center text-[10px] text-[#8899aa]">
          {[
            { emoji: "🔮", label: "スキルが呪文に" },
            { emoji: "⚒",  label: "MCPが装備に" },
            { emoji: "👾", label: "Issueがボスに" },
          ].map((f) => (
            <div key={f.label} className="space-y-1">
              <div className="text-xl">{f.emoji}</div>
              <div>{f.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
