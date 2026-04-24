# CLAUDE.md

## プロジェクト概要

**Claude Quest** — Claude Code の使い方をドラクエ風 RPG ゲームで学べる Web サービス。
組織の GitHub リポジトリ（`.claude/skills/`、MCP 設定、`DESIGN.md` 等）を読み取り、
その組織専用のゲームを自動生成する。

## サービスアーキテクチャ

```
[利用組織の GitHub リポジトリ]
  claude-quest.json  ←── 設定ファイル（省略可、自動検出）
  .claude/skills/    ←── 呪文リスト
  .mcp.json          ←── 武器屋アイテム
  CLAUDE.md          ←── 世界観・王国の掟
  DESIGN.md          ←── ゲームのビジュアルテーマ
        ↓ GitHub API
[claude-quest Web サービス]
  URL: claude-quest.app/<org>/<repo>
  組織専用のドラクエ風ゲームを生成・表示
```

## ディレクトリ構成

```
/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── page.tsx      # トップページ
│   │   ├── [org]/[repo]/ # 組織別ゲーム画面
│   │   └── setup/        # セットアップガイド
│   ├── components/
│   │   ├── game/         # ゲームUIコンポーネント
│   │   └── ui/           # 共通UIコンポーネント
│   ├── lib/
│   │   ├── github/       # GitHub API クライアント
│   │   ├── parser/       # claude-quest.json / DESIGN.md パーサー
│   │   └── ai/           # Claude API 連携（DESIGN.md 解析等）
│   └── types/            # TypeScript 型定義
├── .claude/
│   ├── skills/           # 開発加速スキル
│   └── settings.json     # Claude Code 設定
├── claude-quest.json     # このリポジトリ自身の設定（デモ）
└── DESIGN.md             # ゲームのデザインシステム
```

## 技術スタック

- **フレームワーク**: Next.js 15（App Router）
- **スタイル**: Tailwind CSS v4
- **言語**: TypeScript
- **API**: GitHub REST API / Claude API（Anthropic SDK）
- **デプロイ**: Vercel

## 開発コマンド

```bash
npm run dev       # 開発サーバー起動（port 3000）
npm run build     # 本番ビルド
npm run lint      # Lint チェック
npm run typecheck # 型チェック
```

## `claude-quest.json` 仕様

```json
{
  "name": "組織名 Claude Quest",
  "kingdom": "王国名（任意）",
  "skills_path": ".claude/skills/",
  "mcp_config": ".mcp.json",
  "claude_md": "CLAUDE.md",
  "hooks_path": ".claude/hooks/",
  "design_md": "DESIGN.md",
  "repos": ["repo1", "repo2"]
}
```

すべてのフィールドは省略可能。省略時は以下の順で自動検出する:

| フィールド | 自動検出パス |
|-----------|------------|
| `skills_path` | `.claude/skills/` → `skills/` |
| `mcp_config` | `.mcp.json` → `.claude/mcp.json` → `claude_desktop_config.json` |
| `claude_md` | `CLAUDE.md` |
| `design_md` | `DESIGN.md` |

## コーディング規約

- コンポーネントは `src/components/` に配置し、機能単位でディレクトリを切る
- GitHub API 呼び出しは `src/lib/github/` に集約する
- Claude API 呼び出しは `src/lib/ai/` に集約する
- 型定義は `src/types/` に集約する
- コミットメッセージは英語 prefix 付き（`feat:`, `fix:`, `docs:` 等）

## ゲーム要素マッピング

| リポジトリのデータ | ゲーム要素 |
|-------------------|-----------|
| `.claude/skills/` のスキル | 習得済み呪文リスト |
| MCP サーバー設定 | 武器屋のアイテム |
| `CLAUDE.md` の内容 | 世界観・王国の掟 |
| GitHub Issues | クエスト・ボス |
| Issue ラベル | ボスの難易度 |
| GitHub Org members | パーティメンバー |
| リポジトリ言語 | キャラクタークラス |
| `DESIGN.md` の配色 | ゲームのビジュアルテーマ |

## AIエージェント活用方針

このリポジトリ自体が Claude Quest のデモ。
`.claude/skills/` のスキルを使って開発を加速する。

### スキル一覧

| スキル | 用途 |
|--------|------|
| `/feature-idea` | アイデア → Issue → モック作成 |
| `/develop-issue` | Issue → 実装 → PR |
| `/quick-fix` | 小規模修正 → 漏れチェック → PR |
