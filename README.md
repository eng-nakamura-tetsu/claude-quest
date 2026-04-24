# ⚔ Claude Quest

> Learn Claude Code through a Dragon Quest-style RPG — powered by your own GitHub repository.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**[▶ Try the Demo](https://claude-quest-831u3lavs-engnakamuratetsus-projects.vercel.app/eng-nakamura-tetsu/claude-quest)**

---

## What is this?

Enter any GitHub repository URL and instantly get a Dragon Quest-style RPG built from that repo's Claude Code setup.

| Your repo | In the game |
|-----------|-------------|
| `.claude/skills/` | Spells you've learned |
| `.mcp.json` MCP servers | Weapon shop items |
| GitHub Issues | Boss monsters (difficulty = labels) |
| Repo language | Character class (Go→Swordmage, TypeScript→Bard...) |
| `DESIGN.md` colors | Game visual theme |

```
https://claude-quest.vercel.app/<org>/<repo>
```

---

## Screens

### Status Screen
Your character stats, learned spells (skills), and party members at a glance.

### Battle Screen
Open Issues appear as boss monsters. Choose a spell (skill), write your prompt as an incantation, and deal damage. Longer, more specific prompts hit harder.

### Shop Screen
MCP servers line the shelves of the weapon shop. Equip them to power up.

---

## Add your organization

### 1. Add `claude-quest.json` to your repo root

```json
{
  "name": "Your Org Claude Quest",
  "kingdom": "Kingdom of Acme Corp",
  "skills_path": ".claude/skills/",
  "mcp_config": ".mcp.json",
  "claude_md": "CLAUDE.md",
  "design_md": "DESIGN.md"
}
```

All fields are optional — Claude Quest auto-detects common paths if the file is missing.

### 2. Visit your URL

```
https://claude-quest.vercel.app/<your-org>/<your-repo>
```

That's it.

---

## Auto-detection

No config file? Claude Quest scans these paths automatically:

| Element | Paths checked |
|---------|--------------|
| Skills | `.claude/skills/` → `skills/` |
| MCP config | `.mcp.json` → `.claude/mcp.json` |
| CLAUDE.md | `CLAUDE.md` |
| DESIGN.md | `DESIGN.md` |

---

## Run locally

```bash
git clone https://github.com/eng-nakamura-tetsu/claude-quest.git
cd claude-quest
npm install
cp .env.example .env.local
# Add your GITHUB_TOKEN to .env.local
npm run dev
```

Get a `GITHUB_TOKEN` from [GitHub Settings → Personal Access Tokens](https://github.com/settings/tokens) (`public_repo` scope is enough for public repos).

---

## Why this exists

Learning Claude Code feels exactly like leveling up in an RPG:

- You **learn spells** (skills like `/quick-fix`, `/develop-issue`)
- The same spell does **more damage** depending on how well you cast it (prompt quality)
- You can **form a party** (run agents in parallel)
- You get **stronger over time** as complex tasks become automated

Claude Quest makes this metaphor literal — so teams can actually see and explore their Claude Code setup as a game.

---

## Stack

- **Next.js 15** (App Router, server components)
- **TypeScript + Tailwind CSS v4**
- **GitHub REST API** (no auth required for public repos)
- **Press Start 2P / VT323** — Google Fonts

---

## Roadmap

- [ ] Private repository support (OAuth)
- [ ] Auto-generate game theme from `DESIGN.md` via Claude API
- [ ] Team progress dashboard (who learned which spells)
- [ ] EXP & level-up system
- [ ] One-click deploy to Vercel

---

## Contributing

PRs and Issues welcome.

---

## License

MIT

---

<details>
<summary>日本語版 README</summary>

## Claude Quest とは

GitHub リポジトリの URL を入れるだけで、その組織専用のドラクエ風ゲームが生成されます。

Claude Code での開発体験はドラクエに似ています：
- スキルを「**呪文として覚える**」感覚
- 同じ呪文でも**プロンプトの精度**で威力が全く違う
- **パーティ編成**（エージェント並列起動）で強敵を攻略
- **レベルアップ**するほど複雑なタスクが自動化できる

Claude Quest はこのメタファーをそのままゲームにします。

## あなたの組織を対応させる

リポジトリのルートに `claude-quest.json` を置くだけ（省略可能）：

```json
{
  "name": "組織名 Claude Quest",
  "kingdom": "王国名",
  "skills_path": ".claude/skills/",
  "mcp_config": ".mcp.json"
}
```

アクセス：`https://claude-quest.vercel.app/<org>/<repo>`

</details>
