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
};

export type RepoLanguage = "Go" | "TypeScript" | "Python" | "Rust" | "Java" | "Other";

export type CharacterClass = {
  name: string;
  emoji: string;
};

export type GameData = {
  org: string;
  repo: string;
  config: ClaudeQuestConfig;
  skills: Skill[];
  mcpServers: McpServer[];
  claudeMd: string | null;
  designMd: string | null;
  memberCount: number;
  primaryLanguage: RepoLanguage;
  characterClass: CharacterClass;
  openIssueCount: number;
};
