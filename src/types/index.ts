export type ClaudeQuestConfig = {
  name?: string;
  kingdom?: string;
  skills_path?: string;
  mcp_config?: string;
  claude_md?: string;
  hooks_path?: string;
  design_md?: string;
  repos?: string[];
};

export type Skill = {
  name: string;
  description: string;
  path: string;
};

export type McpServer = {
  name: string;
  command?: string;
  description?: string;
  category: "search" | "code" | "data" | "communication" | "other";
};

export type Contributor = {
  login: string;
  avatarUrl: string;
  contributions: number;
};

export type RepoStats = {
  commits: number;
  closedIssues: number;
};

export type RepoLanguage = "Go" | "TypeScript" | "Python" | "Rust" | "Java" | "Other";

export type CharacterClass = {
  name: string;
  emoji: string;
  description: string;
};

export type Issue = {
  number: number;
  title: string;
  labels: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  hp: number;
};

export type GameData = {
  org: string;
  repo: string;
  config: ClaudeQuestConfig;
  skills: Skill[];
  mcpServers: McpServer[];
  claudeMd: string | null;
  designMd: string | null;
  contributors: Contributor[];
  stats: RepoStats;
  primaryLanguage: RepoLanguage;
  characterClass: CharacterClass;
  openIssueCount: number;
  issues: Issue[];
  level: number;
  exp: number;
  expToNext: number;
};
