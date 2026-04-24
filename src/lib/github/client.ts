import type { ClaudeQuestConfig, Contributor, GameData, Issue, McpServer, RepoLanguage, RepoStats, Skill } from "@/types";

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

async function ghGetWithResponse(path: string): Promise<{ data: unknown | null; response: Response | null }> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: headers(),
      next: { revalidate: 60 },
    });
    if (res.status === 404) return { data: null, response: res };
    if (!res.ok) return { data: null, response: res };
    const data = await res.json();
    return { data, response: res };
  } catch {
    return { data: null, response: null };
  }
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

async function fetchRepoTree(org: string, repo: string): Promise<string[]> {
  const repoData = await ghGet(`/repos/${org}/${repo}`);
  const defaultBranch = (repoData as Record<string, unknown> | null)?.default_branch as string ?? "main";
  const treeData = await ghGet(`/repos/${org}/${repo}/git/trees/${defaultBranch}?recursive=1`);
  if (!treeData || typeof treeData !== "object") return [];
  const tree = (treeData as Record<string, unknown>).tree;
  if (!Array.isArray(tree)) return [];
  return tree
    .filter((f: Record<string, unknown>) => f.type === "blob")
    .map((f: Record<string, unknown>) => f.path as string);
}

async function fetchConfig(org: string, repo: string): Promise<ClaudeQuestConfig> {
  const raw = await fetchFile(org, repo, "claude-quest.json");
  if (raw) {
    try { return JSON.parse(raw); } catch { /* fall through */ }
  }
  return {};
}

async function fetchSkills(org: string, repo: string, config: ClaudeQuestConfig, allPaths: string[]): Promise<Skill[]> {
  const prefixes = [config.skills_path, ".claude/skills", "skills"].filter(Boolean) as string[];

  for (const prefix of prefixes) {
    const skillPaths = allPaths.filter((p) => {
      if (!p.startsWith(prefix + "/")) return false;
      const rel = p.slice(prefix.length + 1);
      const relParts = rel.split("/");
      return relParts.length === 2 && relParts[1].toLowerCase() === "skill.md";
    });

    if (skillPaths.length > 0) {
      const skills: Skill[] = [];
      await Promise.all(
        skillPaths.map(async (skillPath) => {
          const dir = skillPath.split("/").at(-2)!;
          const md = await fetchFile(org, repo, skillPath);
          const rawLine = md?.split("\n").find((l) => l.trim() && !l.startsWith("#")) ?? "";
          const clean = rawLine
            .replace(/\*\*([^*]+)\*\*/g, "$1")
            .replace(/`([^`]+)`/g, "$1")
            .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
            .replace(/^\s*[-*>]\s*/, "")
            .trim();
          skills.push({ name: `/${dir}`, description: clean.slice(0, 100), path: `${prefix}/${dir}` });
        })
      );
      return skills.sort((a, b) => a.name.localeCompare(b.name));
    }
  }
  return [];
}

function classifyMcpCategory(name: string): McpServer["category"] {
  const lower = name.toLowerCase();
  if (["github", "git", "gitlab", "jira", "linear"].some((k) => lower.includes(k))) return "code";
  if (["slack", "gmail", "email", "notion", "discord", "teams"].some((k) => lower.includes(k))) return "communication";
  if (["context7", "search", "fetch", "web", "browser", "firecrawl"].some((k) => lower.includes(k))) return "search";
  if (["database", "postgres", "mysql", "sqlite", "supabase", "mongo"].some((k) => lower.includes(k))) return "data";
  return "other";
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
          category: classifyMcpCategory(name),
        }));
      } catch { /* continue */ }
    }
  }
  return [];
}

async function fetchContributors(org: string, repo: string): Promise<Contributor[]> {
  const data = await ghGet(`/repos/${org}/${repo}/contributors?per_page=8`);
  if (!Array.isArray(data)) return [];
  return data.map((c: Record<string, unknown>) => ({
    login: c.login as string,
    avatarUrl: c.avatar_url as string,
    contributions: c.contributions as number,
  }));
}

async function fetchStats(
  org: string,
  repo: string,
  repo_: Record<string, unknown> | null,
  openIssueCount: number,
): Promise<RepoStats> {
  // Fetch commit activity and closed issues count in parallel
  const [commitData, closedResult] = await Promise.all([
    ghGet(`/repos/${org}/${repo}/stats/commit_activity`),
    ghGetWithResponse(`/repos/${org}/${repo}/issues?state=closed&per_page=1`),
  ]);

  // Sum total commits across all weeks
  let commits = 0;
  if (Array.isArray(commitData)) {
    for (const week of commitData as Record<string, unknown>[]) {
      commits += (week.total as number) ?? 0;
    }
  }

  // Derive closed issues count from Link header last page
  let closedIssues = 0;
  if (closedResult.response) {
    const link = closedResult.response.headers.get("link") ?? "";
    const match = link.match(/[?&]page=(\d+)>;\s*rel="last"/);
    if (match) {
      closedIssues = parseInt(match[1], 10);
    } else if (closedResult.data !== null) {
      // Only one page of results — count the items
      closedIssues = Array.isArray(closedResult.data) ? closedResult.data.length : 0;
    } else {
      closedIssues = openIssueCount * 2;
    }
  } else {
    // Fallback: use closed_issues_count if available, else proxy
    const repoClosedCount = repo_?.closed_issues_count;
    closedIssues = typeof repoClosedCount === "number" ? repoClosedCount : openIssueCount * 2;
  }

  return { commits, closedIssues };
}

function toLanguage(lang: string | null): RepoLanguage {
  const map: Record<string, RepoLanguage> = {
    Go: "Go", TypeScript: "TypeScript", JavaScript: "TypeScript",
    Python: "Python", Rust: "Rust", Java: "Java",
  };
  return map[lang ?? ""] ?? "Other";
}

function deriveCharacterClass(
  lang: RepoLanguage,
  skills: Skill[],
  mcpServers: McpServer[],
  claudeMd: string | null,
  contributorCount: number,
): { name: string; emoji: string; description: string } {
  const text = claudeMd ?? "";
  const agentCount = (text.toLowerCase().match(/\b(agent|subagent)\b/g) ?? []).length;
  const hasParallel = /parallel|並行/i.test(text);

  if (contributorCount >= 5) return { name: "パーティーリーダー", emoji: "👑", description: "仲間と共に戦う王" };
  if (agentCount >= 8) return { name: "召喚師", emoji: "🌟", description: "エージェントを召喚する者" };
  if (mcpServers.length >= 6) return { name: "エンチャンター", emoji: "💎", description: "装備で力を増幅する魔術師" };
  if (skills.length >= 12) return { name: "大魔道士", emoji: "🔮", description: "無数の呪文を操る者" };
  if (hasParallel && lang === "Go") return { name: "並行魔法剣士", emoji: "⚔️✨", description: "並列で斬る剣士" };
  if (lang === "Go") return { name: "魔法剣士", emoji: "⚔️", description: "剣と魔法を操る者" };
  if (lang === "TypeScript" && skills.length >= 8) return { name: "吟遊詩人マスター", emoji: "🎵", description: "言葉で世界を操る" };
  if (lang === "TypeScript") return { name: "吟遊詩人", emoji: "🎵", description: "物語と音楽の使い手" };
  if (lang === "Python") return { name: "賢者", emoji: "🔮", description: "古の知識を持つ者" };
  if (lang === "Rust") return { name: "不死身の戦士", emoji: "🛡️", description: "鋼の意志を持つ者" };
  if (lang === "Java") return { name: "僧侶", emoji: "✨", description: "秩序と型を司る者" };
  return { name: "冒険者", emoji: "🗺️", description: "未知を切り拓く者" };
}

function computeLevel(rawXP: number): { level: number; exp: number; expToNext: number } {
  let level = 1;
  let threshold = 100;
  let remaining = rawXP;
  while (remaining >= threshold) {
    remaining -= threshold;
    level++;
    threshold = Math.floor(threshold * 1.5);
  }
  const exp = Math.round((remaining / threshold) * 100);
  return { level, exp, expToNext: threshold };
}

export async function fetchGameData(org: string, repo: string): Promise<GameData> {
  const [config, repoData, allPaths] = await Promise.all([
    fetchConfig(org, repo),
    ghGet(`/repos/${org}/${repo}`),
    fetchRepoTree(org, repo),
  ]);

  const repo_ = repoData as Record<string, unknown> | null;

  const [skills, mcpServers, claudeMd, designMd, issues, contributors] = await Promise.all([
    fetchSkills(org, repo, config, allPaths),
    fetchMcpServers(org, repo, config),
    fetchFile(org, repo, config.claude_md ?? "CLAUDE.md"),
    fetchFile(org, repo, config.design_md ?? "DESIGN.md"),
    fetchIssues(org, repo),
    fetchContributors(org, repo),
  ]);

  const primaryLanguage = toLanguage((repo_?.language as string) ?? null);
  const openIssueCount = (repo_?.open_issues_count as number) ?? issues.length;

  const stats = await fetchStats(org, repo, repo_, openIssueCount);

  const characterClass = deriveCharacterClass(primaryLanguage, skills, mcpServers, claudeMd, contributors.length);

  const rawXP = stats.commits * 0.5 + stats.closedIssues * 5 + skills.length * 10 + mcpServers.length * 15;
  const { level, exp, expToNext } = computeLevel(rawXP);

  return {
    org,
    repo,
    config,
    skills,
    mcpServers,
    claudeMd,
    designMd,
    contributors,
    stats,
    primaryLanguage,
    characterClass,
    openIssueCount,
    issues,
    level,
    exp,
    expToNext,
  };
}
