"use client";

import { useEffect, useState } from "react";
import type { CharacterClass, GameData } from "@/types";
import { StatusScreen } from "./StatusScreen";
import { BattleScreen } from "./BattleScreen";
import { ShopScreen } from "./ShopScreen";
import { LevelUpScreen } from "./LevelUpScreen";
import { ClassSelectScreen } from "./ClassSelectScreen";

type Tab = "status" | "battle" | "shop" | "levelup";

export function GameScreen({ gameData }: { gameData: GameData }) {
  const [tab, setTab] = useState<Tab>("status");
  const [showClassSelect, setShowClassSelect] = useState(false);
  const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(null);

  const classKey = `claude-quest-class-${gameData.org}-${gameData.repo}`;

  // On mount: read saved class or show selection on first visit
  useEffect(() => {
    try {
      const saved = localStorage.getItem(classKey);
      if (saved) {
        setSelectedClass(JSON.parse(saved) as CharacterClass);
      } else {
        setShowClassSelect(true);
      }
    } catch {
      setShowClassSelect(true);
    }
  }, [classKey]);

  const handleSelectClass = (cls: CharacterClass) => {
    try {
      localStorage.setItem(classKey, JSON.stringify(cls));
    } catch { /* ignore */ }
    setSelectedClass(cls);
    setShowClassSelect(false);
  };

  const effectiveClass = selectedClass ?? gameData.characterClass;
  const enrichedData: GameData = { ...gameData, characterClass: effectiveClass };

  const tabs: { id: Tab; label: string }[] = [
    { id: "status", label: "ステータス" },
    { id: "battle", label: "バトル" },
    { id: "shop", label: "ショップ" },
    { id: "levelup", label: "レベルアップ" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-[#e0e8ff] font-mono relative overflow-hidden">
      {/* CRT scanline overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-40"
        style={{
          background:
            "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.08) 2px,rgba(0,0,0,0.08) 4px)",
        }}
      />

      {/* Stars */}
      <div className="fixed inset-0 z-0 opacity-30">
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-px h-px bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random(),
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 pb-24 pt-6">
        {/* Title */}
        <h1
          className="text-center text-[#ffd700] mb-1 text-xs tracking-widest"
          style={{ fontFamily: "'Press Start 2P', monospace" }}
        >
          ⚔ CLAUDE QUEST ⚔
        </h1>
        <p className="text-center text-[#8899aa] text-xs mb-6">
          {gameData.config.kingdom ?? `${gameData.org}の王国`}
        </p>

        {/* Tab navigation */}
        <div className="flex gap-2 mb-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 py-2 text-[10px] border-2 transition-colors cursor-pointer"
              style={{
                fontFamily: "'Press Start 2P', monospace",
                borderColor: "#ffd700",
                background: tab === t.id ? "#ffd700" : "transparent",
                color: tab === t.id ? "#0a0a1a" : "#ffd700",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Screen content */}
        {tab === "status" && (
          <StatusScreen
            gameData={enrichedData}
            onChangeClass={() => setShowClassSelect(true)}
          />
        )}
        {tab === "battle" && <BattleScreen gameData={enrichedData} />}
        {tab === "shop" && <ShopScreen gameData={enrichedData} />}
        {tab === "levelup" && (
          <LevelUpScreen gameData={enrichedData} onClose={() => setTab("status")} />
        )}
      </div>

      {/* Class selection overlay */}
      {showClassSelect && (
        <ClassSelectScreen
          recommended={gameData.characterClass}
          onSelect={handleSelectClass}
        />
      )}
    </div>
  );
}
