# Issue を受けて実装 → レビュー → PR

**Input:** `$ARGUMENTS`（GitHub Issue の URL または番号）

## 使い方

```bash
/develop-issue #12
/develop-issue https://github.com/eng-nakamura-tetsu/claude-quest/issues/12
```

## Step 1: Issue 取得

```bash
gh issue view <番号> --repo eng-nakamura-tetsu/claude-quest --json title,body,labels,comments
```

## Step 2: 実装方針の提示 & ユーザー承認

以下をユーザーに提示:
```
## 実装方針
### 変更ファイル
- <ファイル1>: <変更内容>
### 推定工数
```

AskUserQuestion で確認してから進む。

## Step 3: ブランチ作成 & 実装

```bash
git checkout -b feature/issue-<番号>-<slug>
```

実装後:
```bash
npm run typecheck && npm run lint
```

## Step 4: PR 作成

```bash
git add <変更ファイル>
git commit -m "feat: <変更の要約>（Issue #<番号>）"
git push origin feature/issue-<番号>-<slug>

gh pr create --base main --title "feat: <変更の要約>" --body "$(cat <<'EOF'
## Summary
<変更内容>

Closes #<番号>

## Test plan
- [ ] <テスト項目>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

## Step 5: 自動レビュー

Agent tool で以下を並列起動:
- **コード品質**: バグ・ロジックエラー・パターン整合性
- **セキュリティ**: 脆弱性・API キー漏洩リスク
- **型安全性**: TypeScript 型の整合性

CRITICAL / WARNING の指摘を修正してから PR URL を報告する。
