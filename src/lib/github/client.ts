import type { ClaudeQuestConfig, GameData, McpServer, RepoLanguage, Skill } from "@/types";

const BASE = "https://api.github.com";

function headers(): Record<string, string> {
  const h: Record<string, string> = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

async function ghGet(path: string): Promise<unknown | null> {
  const res = await fetch(`${BASE}${path}`, {
    headers: headers(),
    next: { revalidate: 60 },
  });
  if (res.status === 404) return null;
  if (!res.ok) return null;
  return res.json();
}

async function fetchFile(org: string, repo: string, path: string): Promise<string | null> {
  const data = await ghGet(`/repos/${org}/${repo}/contents/${path}`);
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  if (typeof d.content === "string" && d.encoding === "base64") {
    return Buffer.from(d.content.replace(/\n/g, ""), "base64").toString("utf-8");
  }
  return null;
}

async function fetchDirectory(org: string, repo: string, path: string): Promise<string[]> {
  const data = await ghGet(`/repos/${org}/${repo}/contents/${path}`);
  if (!Array.isArray(data)) return [];
  return data
    .filter((f: Record<string, unknown>) => f.type === "dir")
    .map((f: Record<string, unknown>) => f.name as string);
}

async function fetchConfig(org: string, repo: string): Promise<ClaudeQuestConfig> {
  const raw = await fetchFile(org, repo, "claude-quest.json");
  if (raw) {
    try { return JSON.parse(raw); } catch { /* fall through */ }
  }
  return {};
}

async function fetchSkills(org: string, repo: string, config: ClaudeQuestConfig): Promise<Skill[]> {
  const paths = [config.skills_path, ".claude/skills", "skills"].filter(Boolean) as string[];
  for (const p of paths) {
    const dirs = await fetchDirectory(org, repo, p);
    if (dirs.length > 0) {
      const skills: Skill[] = [];
      await Promise.all(
        dirs.map(async (dir) => {
          const md = await fetchFile(org, repo, `${p}/${dir}/SKILL.md`);
          const secondLine = md?.split("\n").find((l) => l.trim() && !l.startsWith("#")) ?? "";
          skills.push({ name: `/${dir}`, description: secondLine.slice(0, 80), path: `${p}/${dir}` });
        })
      );
      return skills;
    }
  }
  return [];
}

async function fetchMcpServers(org: string, repo: string, config: ClaudeQuestConfig): Promise<McpServer[]> {
  const paths = [config.mcp_config, ".mcp.json", ".claude/mcp.json"].filter(Boolean) as string[];
  for (const p of paths) {
    const raw = await fetchFile(org, repo, p);
    if (raw) {
      try {
        const json = JSON.parse(raw);
        const servers = json.mcpServers ?? json.servers ?? {};
        return Object.entries(servers).map(([name, val]) => ({
          name,
          command: (val as Record<string, string>).command,
          description: (val as Record<string, string>).description,
        }));
      } catch { /* continue */ }
    }
  }
  return [];
}

function toLanguage(lang: string | null): RepoLanguage {
  const map: Record<string, RepoLanguage> = {
    Go: "Go", TypeScript: "TypeScript", JavaScript: "TypeScript",
    Python: "Python", Rust: "Rust", Java: "Java",
  };
  return map[lang ?? ""] ?? "Other";
}

function toCharacterClass(lang: RepoLanguage) {
  const map: Record<RepoLanguage, { name: string; emoji: string }> = {
    Go:         { name: "魔法剣士", emoji: "⚔️" },
    TypeScript: { name: "吟遊詩人", emoji: "🎵" },
    Python:     { name: "賢者",     emoji: "🔮" },
    Rust:       { name: "戦士",     emoji: "🛡️" },
    Java:       { name: "僧侶",     emoji: "✨" },
    Other:      { name: "冒険者",   emoji: "🗺️" },
  };
  return map[lang];
}

export async function fetchGameData(org: string, repo: string): Promise<GameData> {
  const [config, repoData] = await Promise.all([
    fetchConfig(org, repo),
    ghGet(`/repos/${org}/${repo}`),
  ]);

  const repo_ = repoData as Record<string, unknown> | null;

  const [skills, mcpServers, claudeMd, designMd, issuesData] = await Promise.all([
    fetchSkills(org, repo, config),
    fetchMcpServers(org, repo, config),
    fetchFile(org, repo, config.claude_md ?? "CLAUDE.md"),
    fetchFile(org, repo, config.design_md ?? "DESIGN.md"),
    ghGet(`/repos/${org}/${repo}/issues?state=open&per_page=1`),
  ]);

  const primaryLanguage = toLanguage((repo_?.language as string) ?? null);
  const openIssueCount = Array.isArray(issuesData)
    ? (repo_?.open_issues_count as number) ?? issuesData.length
    : 0;

  return {
    org,
    repo,
    config,
    skills,
    mcpServers,
    claudeMd,
    designMd,
    memberCount: 1,
    primaryLanguage,
    characterClass: toCharacterClass(primaryLanguage),
    openIssueCount,
  };
}
