import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

type Props = {
  params: Promise<{ org: string }>;
};

const BASE = "https://api.github.com";

function ghHeaders(): Record<string, string> {
  const h: Record<string, string> = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

const fetchOpts = { headers: ghHeaders(), next: { revalidate: 60 } } as const;

interface GhOrg {
  name: string | null;
  description: string | null;
  avatar_url: string;
  public_repos: number;
  public_members_url: string;
}

interface GhRepo {
  name: string;
  stargazers_count: number;
  language: string | null;
  description: string | null;
}

interface GhContributor {
  login: string;
  avatar_url: string;
  contributions: number;
}

interface AggregatedContributor {
  login: string;
  avatar_url: string;
  totalContributions: number;
  level: number;
  rank: number;
  jobClass: string;
  jobEmoji: string;
}

async function fetchOrg(org: string): Promise<GhOrg | null> {
  const res = await fetch(`${BASE}/orgs/${org}`, fetchOpts);
  if (res.status === 404) return null;
  if (!res.ok) return null;
  return res.json() as Promise<GhOrg>;
}

async function fetchOrgRepos(org: string): Promise<GhRepo[]> {
  const res = await fetch(
    `${BASE}/orgs/${org}/repos?sort=updated&per_page=12&type=public`,
    fetchOpts
  );
  if (!res.ok) return [];
  const data = (await res.json()) as GhRepo[];
  return data.sort((a, b) => b.stargazers_count - a.stargazers_count);
}

async function fetchRepoContributors(org: string, repo: string): Promise<GhContributor[]> {
  const res = await fetch(
    `${BASE}/repos/${org}/${repo}/contributors?per_page=20`,
    fetchOpts
  );
  if (!res.ok) return [];
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data as GhContributor[];
}

function computeJobClass(rank: number): { emoji: string; name: string } {
  if (rank === 1) return { emoji: "👑", name: "パーティーリーダー" };
  if (rank <= 3) return { emoji: "🌟", name: "召喚師" };
  if (rank <= 6) return { emoji: "⚔️", name: "魔法剣士" };
  return { emoji: "🗺️", name: "冒険者" };
}

function computeLevel(totalContributions: number): number {
  return Math.max(1, Math.floor(Math.sqrt(totalContributions * 0.8)));
}

async function fetchGuildData(org: string): Promise<{
  orgInfo: GhOrg;
  repos: GhRepo[];
  contributors: AggregatedContributor[];
} | null> {
  const orgInfo = await fetchOrg(org);
  if (!orgInfo) return null;

  const allRepos = await fetchOrgRepos(org);
  const top8Repos = allRepos.slice(0, 8);
  const top5Repos = allRepos.slice(0, 5);

  const allContributorLists = await Promise.all(
    top5Repos.map((r) => fetchRepoContributors(org, r.name))
  );

  // Aggregate contributions per login
  const contributionMap = new Map<string, { login: string; avatar_url: string; total: number }>();
  for (const list of allContributorLists) {
    for (const c of list) {
      const existing = contributionMap.get(c.login);
      if (existing) {
        existing.total += c.contributions;
      } else {
        contributionMap.set(c.login, {
          login: c.login,
          avatar_url: c.avatar_url,
          total: c.contributions,
        });
      }
    }
  }

  const sorted = Array.from(contributionMap.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 15);

  const contributors: AggregatedContributor[] = sorted.map((c, i) => {
    const rank = i + 1;
    const job = computeJobClass(rank);
    return {
      login: c.login,
      avatar_url: c.avatar_url,
      totalContributions: c.total,
      level: computeLevel(c.total),
      rank,
      jobClass: job.name,
      jobEmoji: job.emoji,
    };
  });

  return { orgInfo, repos: top8Repos, contributors };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { org } = await params;
  return {
    title: `${org} ギルド — Claude Quest`,
    openGraph: {
      images: [`https://claude-quest.vercel.app/api/og/${org}/guild`],
    },
    twitter: { card: "summary_large_image" },
  };
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f7df1e",
  Go: "#00acd7",
  Python: "#3572a5",
  Rust: "#dea584",
  Java: "#b07219",
  Ruby: "#701516",
  Swift: "#f05138",
  Kotlin: "#a97bff",
  "C++": "#f34b7d",
  "C#": "#178600",
  PHP: "#4f5d95",
  Shell: "#89e051",
};

function LangBadge({ lang }: { lang: string | null }) {
  if (!lang) return null;
  const color = LANG_COLORS[lang] ?? "#8899aa";
  return (
    <span
      style={{
        display: "inline-block",
        padding: "1px 6px",
        borderRadius: 3,
        fontSize: 10,
        color: "#0a0a1a",
        background: color,
        fontFamily: "'VT323', monospace",
        lineHeight: 1.5,
      }}
    >
      {lang}
    </span>
  );
}

function ExpBar({
  value,
  max,
  rank,
}: {
  value: number;
  max: number;
  rank: number;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const barColor = rank === 1 ? "#ffd700" : rank <= 3 ? "#aaaaff" : "#4488ff";
  return (
    <div
      style={{
        width: 100,
        height: 8,
        background: "#1a1a3a",
        border: "1px solid #ffd70044",
        borderRadius: 2,
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          background: barColor,
        }}
      />
    </div>
  );
}

export default async function GuildPage({ params }: Props) {
  const { org } = await params;

  const data = await fetchGuildData(org);
  if (!data) notFound();

  const { orgInfo, repos, contributors } = data;
  const maxExp = contributors[0]?.totalContributions ?? 1;

  const rankBorderColor = (rank: number) => {
    if (rank === 1) return "#ffd700";
    if (rank === 2) return "#c0c0c0";
    if (rank === 3) return "#cd7f32";
    return "transparent";
  };

  return (
    <div
      className="min-h-screen bg-[#0a0a1a] text-[#e0e8ff]"
      style={{ fontFamily: "'VT323', monospace" }}
    >
      {/* CRT scanline overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50"
        style={{
          background:
            "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.07) 2px,rgba(0,0,0,0.07) 4px)",
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-10 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1
            className="text-[#ffd700] text-base leading-relaxed"
            style={{ fontFamily: "'Press Start 2P', monospace" }}
          >
            ⚔ CLAUDE QUEST ⚔
          </h1>
          <p className="text-[#8899aa] text-sm mt-1">{org} ギルド</p>
        </div>

        {/* Guild Info Box */}
        <div
          className="p-4 rounded"
          style={{ border: "2px solid #ffd700", background: "#0f1629" }}
        >
          <p
            className="text-[#ffd700] text-[10px] mb-3"
            style={{ fontFamily: "'Press Start 2P', monospace" }}
          >
            ◆ GUILD INFO
          </p>
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={orgInfo.avatar_url}
              alt={org}
              width={48}
              height={48}
              className="rounded"
              style={{ imageRendering: "pixelated", border: "2px solid #ffd70066" }}
            />
            <div className="flex flex-col gap-1">
              <span
                className="text-[#ffd700] text-base"
                style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 12 }}
              >
                {orgInfo.name ?? org}
              </span>
              {orgInfo.description && (
                <span className="text-[#8899aa] text-sm">{orgInfo.description}</span>
              )}
              <div className="flex gap-4 text-sm text-[#8899aa]">
                <span>公開リポジトリ: <span className="text-[#e0e8ff]">{orgInfo.public_repos}</span></span>
                <span>コントリビューター: <span className="text-[#e0e8ff]">{contributors.length}</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div>
          <p
            className="text-[#ffd700] text-[10px] mb-4"
            style={{ fontFamily: "'Press Start 2P', monospace" }}
          >
            ◆ ギルドランキング
          </p>

          {contributors.length === 0 ? (
            <div
              className="p-6 text-center text-[#8899aa] text-sm"
              style={{ border: "1px solid #ffd70033", background: "#0f1629" }}
            >
              コントリビューターデータを取得できませんでした
            </div>
          ) : (
            <div className="space-y-2">
              {contributors.map((c) => (
                <div
                  key={c.login}
                  className="flex items-center gap-3 px-3 py-2 rounded"
                  style={{
                    background: "#0f1629",
                    border: "1px solid #ffd70022",
                    borderLeft: `3px solid ${rankBorderColor(c.rank)}`,
                  }}
                >
                  {/* Rank */}
                  <span
                    className="text-[#ffd700] w-5 text-right flex-shrink-0"
                    style={{
                      fontFamily: "'Press Start 2P', monospace",
                      fontSize: 9,
                    }}
                  >
                    {c.rank}
                  </span>

                  {/* Avatar */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.avatar_url}
                    alt={c.login}
                    width={32}
                    height={32}
                    className="rounded flex-shrink-0"
                    style={{ imageRendering: "pixelated", border: "1px solid #ffd70044" }}
                  />

                  {/* Name + job */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[#e0e8ff] text-base leading-tight truncate">
                      {c.login}
                    </span>
                    <span className="text-[#8899aa] text-xs leading-tight">
                      {c.jobEmoji} {c.jobClass}
                    </span>
                  </div>

                  {/* Level */}
                  <span
                    className="text-[#ffd700] flex-shrink-0"
                    style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8 }}
                  >
                    Lv.{c.level}
                  </span>

                  {/* EXP bar */}
                  <div className="flex-shrink-0">
                    <ExpBar value={c.totalContributions} max={maxExp} rank={c.rank} />
                  </div>

                  {/* EXP number */}
                  <span className="text-[#8899aa] text-sm flex-shrink-0 w-20 text-right">
                    {c.totalContributions.toLocaleString()} EXP
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Repos */}
        {repos.length > 0 && (
          <div>
            <p
              className="text-[#ffd700] text-[10px] mb-4"
              style={{ fontFamily: "'Press Start 2P', monospace" }}
            >
              ◆ 対応リポジトリ
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {repos.map((r) => (
                <Link
                  key={r.name}
                  href={`/${org}/${r.name}`}
                  className="block p-3 rounded hover:border-[#ffd700] transition-colors"
                  style={{
                    background: "#0f1629",
                    border: "1px solid #ffd70033",
                  }}
                >
                  <div
                    className="text-[#e0e8ff] text-sm truncate mb-1"
                    style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8 }}
                  >
                    {r.name}
                  </div>
                  <div className="flex items-center justify-between gap-1 mt-1">
                    <LangBadge lang={r.language} />
                    {r.stargazers_count > 0 && (
                      <span className="text-[#8899aa] text-xs">⭐ {r.stargazers_count}</span>
                    )}
                  </div>
                  {r.description && (
                    <p className="text-[#8899aa] text-xs mt-1 line-clamp-2">{r.description}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Footer CTA */}
        <div
          className="p-4 text-center space-y-2"
          style={{ border: "1px solid #ffd70033", background: "#0f1629" }}
        >
          <p
            className="text-[#ffd700] text-[10px]"
            style={{ fontFamily: "'Press Start 2P', monospace" }}
          >
            ⚔ あなたの組織も参加しよう
          </p>
          <p className="text-[#8899aa] text-sm">リポジトリに Claude Code スキルを追加して冒険を始めよう</p>
          <code
            className="block text-[#00ffcc] text-sm mt-2 px-3 py-2 rounded"
            style={{ background: "#1a1a2e", border: "1px solid #ffd70044" }}
          >
            npx claude-quest init
          </code>
        </div>
      </div>
    </div>
  );
}
