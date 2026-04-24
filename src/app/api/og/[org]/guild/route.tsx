import { ImageResponse } from "@vercel/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

const BASE = "https://api.github.com";

interface GhOrg {
  name: string | null;
  avatar_url: string;
  public_repos: number;
}

interface GhContributor {
  login: string;
  avatar_url: string;
  contributions: number;
}

interface GhRepo {
  name: string;
  stargazers_count: number;
}

function ghHeaders(token?: string): Record<string, string> {
  const h: Record<string, string> = { Accept: "application/vnd.github+json" };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

async function getOrgData(
  org: string,
  token?: string
): Promise<{
  orgInfo: GhOrg | null;
  topContributors: { login: string; avatar_url: string; total: number; level: number }[];
}> {
  const headers = ghHeaders(token);
  const opts = { headers, next: { revalidate: 60 } };

  const orgRes = await fetch(`${BASE}/orgs/${org}`, opts);
  if (!orgRes.ok) return { orgInfo: null, topContributors: [] };
  const orgInfo = (await orgRes.json()) as GhOrg;

  const reposRes = await fetch(
    `${BASE}/orgs/${org}/repos?sort=updated&per_page=8&type=public`,
    opts
  );
  if (!reposRes.ok) return { orgInfo, topContributors: [] };

  const repos = (await reposRes.json()) as GhRepo[];
  const sortedRepos = repos
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 3);

  const allLists = await Promise.all(
    sortedRepos.map(async (r) => {
      const res = await fetch(
        `${BASE}/repos/${org}/${r.name}/contributors?per_page=10`,
        opts
      );
      if (!res.ok) return [];
      const data = await res.json();
      if (!Array.isArray(data)) return [];
      return data as GhContributor[];
    })
  );

  const map = new Map<string, { login: string; avatar_url: string; total: number }>();
  for (const list of allLists) {
    for (const c of list) {
      const existing = map.get(c.login);
      if (existing) {
        existing.total += c.contributions;
      } else {
        map.set(c.login, { login: c.login, avatar_url: c.avatar_url, total: c.contributions });
      }
    }
  }

  const sorted = Array.from(map.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);

  const topContributors = sorted.map((c) => ({
    ...c,
    level: Math.max(1, Math.floor(Math.sqrt(c.total * 0.8))),
  }));

  return { orgInfo, topContributors };
}

const RANK_LABELS = [
  { emoji: "👑", label: "パーティーリーダー" },
  { emoji: "🌟", label: "召喚師" },
  { emoji: "⚔️", label: "魔法剣士" },
];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ org: string }> }
) {
  const { org } = await params;
  const token = process.env.GITHUB_TOKEN;

  const { orgInfo, topContributors } = await getOrgData(org, token);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: 1200,
          height: 630,
          background: "#0a0a1a",
          color: "#e0e8ff",
          fontFamily: "monospace",
          padding: "48px 56px",
          position: "relative",
          border: "8px solid #ffd700",
          boxSizing: "border-box",
        }}
      >
        {/* Scanline */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 6px)",
            pointerEvents: "none",
          }}
        />

        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 40,
          }}
        >
          <div style={{ color: "#ffd700", fontSize: 28, letterSpacing: 6 }}>
            ⚔ CLAUDE QUEST ⚔
          </div>
          <div style={{ color: "#8899aa", fontSize: 20 }}>{org} ギルド</div>
        </div>

        {/* Guild title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginBottom: 40,
          }}
        >
          {orgInfo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={orgInfo.avatar_url}
              width={72}
              height={72}
              style={{
                borderRadius: 8,
                border: "3px solid #ffd700",
                imageRendering: "pixelated",
              }}
              alt={org}
            />
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ color: "#ffd700", fontSize: 42, fontWeight: "bold" }}>
              {orgInfo?.name ?? org}
            </div>
            {orgInfo && (
              <div style={{ color: "#8899aa", fontSize: 22 }}>
                公開リポジトリ: {orgInfo.public_repos}
              </div>
            )}
          </div>
        </div>

        {/* Top contributors */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
          <div style={{ color: "#ffd700", fontSize: 18, letterSpacing: 3, marginBottom: 4 }}>
            ◆ TOP MEMBERS
          </div>

          {topContributors.length === 0 ? (
            <div style={{ color: "#8899aa", fontSize: 22 }}>データなし</div>
          ) : (
            topContributors.map((c, i) => (
              <div
                key={c.login}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  padding: "12px 20px",
                  background: "#0f1629",
                  border: `2px solid ${i === 0 ? "#ffd700" : i === 1 ? "#c0c0c0" : "#cd7f32"}`,
                  borderRadius: 6,
                }}
              >
                <span style={{ color: "#ffd700", fontSize: 24, minWidth: 28 }}>
                  {i + 1}
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.avatar_url}
                  width={48}
                  height={48}
                  style={{ borderRadius: 4, imageRendering: "pixelated" }}
                  alt={c.login}
                />
                <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
                  <span style={{ color: "#e0e8ff", fontSize: 26 }}>{c.login}</span>
                  <span style={{ color: "#8899aa", fontSize: 18 }}>
                    {RANK_LABELS[i]?.emoji} {RANK_LABELS[i]?.label}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 2,
                  }}
                >
                  <span style={{ color: "#ffd700", fontSize: 22, fontWeight: "bold" }}>
                    Lv.{c.level}
                  </span>
                  <span style={{ color: "#8899aa", fontSize: 16 }}>
                    {c.total.toLocaleString()} EXP
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #ffd70033",
            paddingTop: 16,
            marginTop: 24,
          }}
        >
          <div style={{ color: "#8899aa", fontSize: 18 }}>
            claude-quest.vercel.app/{org}
          </div>
          <div style={{ color: "#ffd70088", fontSize: 16 }}>#ClaudeQuest</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
