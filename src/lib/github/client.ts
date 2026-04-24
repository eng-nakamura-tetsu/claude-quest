import { Octokit } from "@octokit/rest";
import type { ClaudeQuestConfig, GameData, McpServer, RepoLanguage, Skill } from "@/types";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

async function fetchFile(org: string, repo: string, path: string): Promise<string | null> {
  try {
    const res = await octokit.repos.getContent({ owner: org, repo, path });
    if ("content" in res.data && typeof res.data.content === "string") {
      return Buffer.from(res.data.content, "base64").toString("utf-8");
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchDirectory(org: string, repo: string, path: string): Promise<string[]> {
  try {
    const res = await octokit.repos.getContent({ owner: org, repo, path });
    if (Array.isArray(res.data)) {
      return res.data.filter((f) => f.type === "dir").map((f) => f.name);
    }
    return [];
  } catch {
    return [];
  }
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
          const firstLine = md?.split("\n")[0]?.replace(/^#+\s*/, "") ?? dir;
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
  const [config, repoInfo] = await Promise.all([
    fetchConfig(org, repo),
    octokit.repos.get({ owner: org, repo }).catch(() => null),
  ]);

  const [skills, mcpServers, claudeMd, designMd, issueCount] = await Promise.all([
    fetchSkills(org, repo, config),
    fetchMcpServers(org, repo, config),
    fetchFile(org, repo, config.claude_md ?? "CLAUDE.md"),
    fetchFile(org, repo, config.design_md ?? "DESIGN.md"),
    octokit.issues.listForRepo({ owner: org, repo, state: "open", per_page: 1 })
      .then((r) => r.headers["x-total-count"] ? parseInt(r.headers["x-total-count"] as string) : r.data.length)
      .catch(() => 0),
  ]);

  const primaryLanguage = toLanguage(repoInfo?.data.language ?? null);

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
    openIssueCount: issueCount,
  };
}
