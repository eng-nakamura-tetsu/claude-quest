"use client";

import { useEffect, useState } from "react";

const VT323 = { fontFamily: "'VT323', monospace" };

interface StreakData {
  count: number;
  lastDate: string;
}

function today(): string {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function streakKey(org: string, repo: string): string {
  return `claude-quest-streak-${org}-${repo}`;
}

function readStreak(org: string, repo: string): StreakData {
  try {
    const raw = localStorage.getItem(streakKey(org, repo));
    if (raw) {
      return JSON.parse(raw) as StreakData;
    }
  } catch {
    /* ignore */
  }
  return { count: 0, lastDate: "" };
}

function writeStreak(org: string, repo: string, data: StreakData): void {
  try {
    localStorage.setItem(streakKey(org, repo), JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function recordBattleWin(org: string, repo: string): number {
  const data = readStreak(org, repo);
  const t = today();

  if (data.lastDate === t) {
    // Already counted today
    return data.count;
  }

  if (data.lastDate === yesterday()) {
    // Streak continues
    const updated: StreakData = { count: data.count + 1, lastDate: t };
    writeStreak(org, repo, updated);
    return updated.count;
  }

  // Streak broken (or first win)
  const updated: StreakData = { count: 1, lastDate: t };
  writeStreak(org, repo, updated);
  return updated.count;
}

interface StreakIndicatorProps {
  org: string;
  repo: string;
  onStreakUpdate?: (count: number) => void;
}

export function StreakIndicator({ org, repo, onStreakUpdate }: StreakIndicatorProps) {
  const [count, setCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const data = readStreak(org, repo);
    const t = today();

    let displayCount = data.count;

    if (data.lastDate !== "" && data.lastDate < yesterday()) {
      // Streak broken — show 0 but don't reset yet (reset on next battle win)
      displayCount = 0;
    }

    setCount(displayCount);
    setMounted(true);
    onStreakUpdate?.(displayCount);
  }, [org, repo, onStreakUpdate]);

  if (!mounted) return null;

  const isHighStreak = count >= 30;
  const isMediumStreak = count >= 7;

  const color = count === 0 ? "#555566" : "#ffd700";
  const label = isHighStreak
    ? `🔥🔥🔥 ${count}日連続!!`
    : count === 0
    ? "🔥 0"
    : `🔥 ${count}日連続`;

  return (
    <>
      <span
        style={{
          ...VT323,
          color,
          fontSize: 18,
          animation: isMediumStreak ? "streakPulse 2s ease-in-out infinite" : "none",
        }}
      >
        {label}
      </span>
      <style>{`
        @keyframes streakPulse {
          0%, 100% { opacity: 1; text-shadow: 0 0 4px #ffd700; }
          50% { opacity: 0.7; text-shadow: 0 0 12px #ffd700, 0 0 24px #ff8800; }
        }
      `}</style>
    </>
  );
}
