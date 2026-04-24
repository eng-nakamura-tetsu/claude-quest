import type { Metadata } from "next";
import { fetchGameData } from "@/lib/github/client";
import { GameScreen } from "@/components/game/GameScreen";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ org: string; repo: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { org, repo } = await params;
  const baseUrl = "https://claude-quest.vercel.app";
  const ogImage = `${baseUrl}/api/og/${org}/${repo}`;

  return {
    title: `${org}/${repo} — Claude Quest`,
    description: `${org}/${repo} のClaude Code セットアップをドラクエ風RPGで体験しよう`,
    openGraph: {
      title: `${org}/${repo} — Claude Quest ⚔`,
      description: `スキル・MCP・GitHub Issues をRPGで体験`,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      siteName: "Claude Quest",
    },
    twitter: {
      card: "summary_large_image",
      title: `${org}/${repo} — Claude Quest ⚔`,
      description: `スキル・MCP・GitHub Issues をRPGで体験`,
      images: [ogImage],
    },
  };
}

export default async function GamePage({ params }: Props) {
  const { org, repo } = await params;

  let gameData;
  try {
    gameData = await fetchGameData(org, repo);
  } catch {
    notFound();
  }

  return <GameScreen gameData={gameData} />;
}
