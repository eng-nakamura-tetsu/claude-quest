import type { ClaudeQuestConfig, GameData, Issue, McpServer, RepoLanguage, Skill } from "@/types";

const LABEL_DIFFICULTY: Record<string, Issue["difficulty"]> = {
  "good first issue": 1, easy: 1,
  "help wanted": 2,
  enhancement: 3, feature: 3,
  bug: 3,
  "breaking change": 4,
  epic: 5,
};

function issueToDifficulty(labels: string[]): Issue["difficulty"] {
  for (const l of labels) {
    const d = LABEL_DIFFICULTY[l.toLowerCase()];
    if (d) return d;
  }
  return 2;
}

async function fetchIssues(org: string, repo: string): Promise<Issue[]> {
  const data = await ghGet(`/repos/${org}/${repo}/issues?state=open&per_page=20&sort=created&direction=desc`);
  if (!Array.isArray(data)) return [];
  return data
    .filter((i: Record<string, unknown>) => !i.pull_request)
    .slice(0, 10)
    .map((i: Record<string, unknown>) => {
      const labels = (i.labels as { name: string }[]).map((l) => l.name);
      const diff = issueToDifficulty(labels);
      return {
        number: i.number as number,
        title: i.title as string,
        labels,
        difficulty: diff,
        hp: diff * 20,
      };
    });
}

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
          const rawLine = md?.split("\n").find((l) => l.trim() && !l.startsWith("#")) ?? "";
          // Markdownの記法を除去して読みやすくする
          const clean = rawLine
            .replace(/\*\*([^*]+)\*\*/g, "$1")
            .replace(/`([^`]+)`/g, "$1")
            .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
            .replace(/^\s*[-*>]\s*/, "")
            .trim();
          skills.push({ name: `/${dir}`, description: clean.slice(0, 100), path: `${p}/${dir}` });
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

  const [skills, mcpServers, claudeMd, designMd, issues] = await Promise.all([
    fetchSkills(org, repo, config),
    fetchMcpServers(org, repo, config),
    fetchFile(org, repo, config.claude_md ?? "CLAUDE.md"),
    fetchFile(org, repo, config.design_md ?? "DESIGN.md"),
    fetchIssues(org, repo),
  ]);

  const primaryLanguage = toLanguage((repo_?.language as string) ?? null);
  const openIssueCount = (repo_?.open_issues_count as number) ?? issues.length;

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
    issues,
  };
}
