#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const readline = require("readline");

// ── ANSI colors ──────────────────────────────────────────────
const gold = (s) => `\x1b[33m${s}\x1b[0m`;
const cyan = (s) => `\x1b[36m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;

function banner() {
  console.log(gold("⚔  CLAUDE QUEST  ⚔"));
  console.log(dim("Turn your Claude Code setup into a Dragon Quest RPG\n"));
}

function ask(rl, question, defaultValue) {
  return new Promise((resolve) => {
    const prompt = defaultValue
      ? `${question} ${dim(`[${defaultValue}]`)} `
      : `${question} `;
    rl.question(prompt, (answer) => {
      resolve(answer.trim() || defaultValue || "");
    });
  });
}

// ── Detect git remote → org/repo ─────────────────────────────
function detectOrgRepo() {
  try {
    const url = execSync("git remote get-url origin", { encoding: "utf8" }).trim();
    // SSH: git@github.com:org/repo.git
    // HTTPS: https://github.com/org/repo.git
    const match = url.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
    if (match) return { org: match[1], repo: match[2] };
  } catch { /* not a git repo or no remote */ }
  return null;
}

// ── Detect skills path ────────────────────────────────────────
function detectSkillsPath(cwd) {
  const candidates = [".claude/skills", "skills", ".claude/commands"];
  for (const p of candidates) {
    const full = path.join(cwd, p);
    if (fs.existsSync(full) && fs.statSync(full).isDirectory()) {
      const entries = fs.readdirSync(full);
      if (entries.length > 0) return p;
    }
  }
  return null;
}

// ── Count skills ──────────────────────────────────────────────
function countSkills(cwd, skillsPath) {
  if (!skillsPath) return 0;
  try {
    const full = path.join(cwd, skillsPath);
    return fs.readdirSync(full).filter((e) => {
      return fs.statSync(path.join(full, e)).isDirectory();
    }).length;
  } catch { return 0; }
}

// ── Strip sensitive env from MCP config ──────────────────────
function sanitizeMcpConfig(raw) {
  const config = JSON.parse(raw);
  const servers = config.mcpServers ?? config.servers ?? {};
  const sanitized = {};
  for (const [name, val] of Object.entries(servers)) {
    const { env: _env, ...rest } = val; // drop env (API keys)
    sanitized[name] = rest;
  }
  const key = config.mcpServers ? "mcpServers" : "servers";
  return { [key]: sanitized };
}

// ── Detect MCP config ─────────────────────────────────────────
function detectMcpConfig(cwd) {
  const candidates = [".mcp.json", ".claude/mcp.json"];
  for (const p of candidates) {
    const full = path.join(cwd, p);
    if (fs.existsSync(full)) return { path: p, full };
  }
  return null;
}

// ── Detect primary language from package.json / go.mod / etc ─
function detectLanguage(cwd) {
  if (fs.existsSync(path.join(cwd, "go.mod"))) return "Go";
  if (fs.existsSync(path.join(cwd, "package.json"))) return "TypeScript";
  if (fs.existsSync(path.join(cwd, "Cargo.toml"))) return "Rust";
  if (fs.existsSync(path.join(cwd, "requirements.txt")) || fs.existsSync(path.join(cwd, "pyproject.toml"))) return "Python";
  if (fs.existsSync(path.join(cwd, "pom.xml")) || fs.existsSync(path.join(cwd, "build.gradle"))) return "Java";
  return "Other";
}

// ── Main ──────────────────────────────────────────────────────
async function init() {
  const cwd = process.cwd();
  banner();

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  // Detect
  const remote = detectOrgRepo();
  const skillsPath = detectSkillsPath(cwd);
  const skillCount = countSkills(cwd, skillsPath);
  const mcpInfo = detectMcpConfig(cwd);
  const lang = detectLanguage(cwd);

  console.log(bold("📁 検出結果:"));
  console.log(`   リポジトリ : ${remote ? cyan(`${remote.org}/${remote.repo}`) : dim("検出できませんでした")}`);
  console.log(`   言語       : ${cyan(lang)}`);
  console.log(`   スキル     : ${skillsPath ? cyan(`${skillsPath}/ (${skillCount}個)`) : dim("見つかりませんでした")}`);
  console.log(`   MCP設定    : ${mcpInfo ? cyan(mcpInfo.path) : dim("見つかりませんでした")}`);
  console.log("");

  // Ask
  const defaultName = remote?.repo ?? path.basename(cwd);
  const name = await ask(rl, "ゲーム名（組織名）:", defaultName);
  const kingdom = await ask(rl, "王国名:", `${name}の王国`);

  // Build config
  let mcpConfigPath;
  if (mcpInfo) {
    // Sanitize and write public MCP config
    const publicMcpPath = ".claude/public-mcp.json";
    const publicMcpFull = path.join(cwd, publicMcpPath);
    try {
      const raw = fs.readFileSync(mcpInfo.full, "utf8");
      const sanitized = sanitizeMcpConfig(raw);
      fs.mkdirSync(path.dirname(publicMcpFull), { recursive: true });
      fs.writeFileSync(publicMcpFull, JSON.stringify(sanitized, null, 2) + "\n");
      console.log(`\n${green("✓")} ${cyan(publicMcpPath)} を作成しました ${dim("(APIキーを除去済み)")}`);
      mcpConfigPath = publicMcpPath;
    } catch (e) {
      console.log(`\n${dim("⚠  MCPの変換に失敗しました: " + e.message)}`);
    }
  }

  // Write claude-quest.json
  const config = {
    name,
    kingdom,
    ...(skillsPath ? { skills_path: skillsPath } : {}),
    ...(mcpConfigPath ? { mcp_config: mcpConfigPath } : {}),
    claude_md: fs.existsSync(path.join(cwd, "CLAUDE.md")) ? "CLAUDE.md" : undefined,
  };
  // Remove undefined keys
  Object.keys(config).forEach((k) => config[k] === undefined && delete config[k]);

  const configPath = path.join(cwd, "claude-quest.json");
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");
  console.log(`${green("✓")} ${cyan("claude-quest.json")} を作成しました`);

  rl.close();

  // Result
  console.log("");
  console.log(gold("━".repeat(50)));
  if (remote) {
    const url = `https://claude-quest.vercel.app/${remote.org}/${remote.repo}`;
    console.log(`\n${bold("🎮 あなたのゲームURL:")}`);
    console.log(`   ${gold(url)}\n`);
    console.log(dim("   ファイルをコミット・プッシュした後にアクセスしてください\n"));
    console.log(`   ${dim("git add claude-quest.json .claude/public-mcp.json")}`);
    console.log(`   ${dim(`git commit -m "feat: Claude Quest セットアップ"`)}`);
    console.log(`   ${dim("git push")}\n`);
  }
  console.log(gold("━".repeat(50)));
  console.log(`\n${dim("⚔  冒険の準備ができた！")}\n`);
}

// ── CLI entry ─────────────────────────────────────────────────
const cmd = process.argv[2];

if (!cmd || cmd === "init") {
  init().catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
} else if (cmd === "--help" || cmd === "-h") {
  banner();
  console.log("Usage:");
  console.log("  npx claude-quest init   # セットアップを実行\n");
  console.log("What it does:");
  console.log("  1. skills, MCP設定のパスを自動検出");
  console.log("  2. .mcp.json からAPIキーを除いた公開用ファイルを生成");
  console.log("  3. claude-quest.json を生成");
  console.log("  4. ゲームURLを表示\n");
} else if (cmd === "--version" || cmd === "-v") {
  const pkg = require("../package.json");
  console.log(pkg.version);
} else {
  console.error(`Unknown command: ${cmd}`);
  console.error("Run with --help for usage.");
  process.exit(1);
}
