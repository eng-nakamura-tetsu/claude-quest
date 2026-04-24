import { fetchGameData } from "@/lib/github/client";
import { GameScreen } from "@/components/game/GameScreen";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ org: string; repo: string }>;
};

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
