# ちょい修正 → 漏れチェック → PR

**Input:** `$ARGUMENTS`（修正内容の説明、または Issue 番号）

小規模な fix・挙動変更・設定修正を対象とする。1〜3ファイル程度の局所修正に特化し、
修正後に「変更種別に応じた漏れチェック」を自動で行う。

## 使い方

```bash
/quick-fix GitHub APIのレート制限エラーハンドリングを追加したい
/quick-fix #12 の修正
```

## Step 1: 修正内容の把握

`$ARGUMENTS` が Issue 番号の場合:
```bash
gh issue view <番号> --repo eng-nakamura-tetsu/claude-quest --json title,body,comments
```

以下を確定してから進む:
- 対象ファイル
- 修正の概要

## Step 2: 実装

対象ファイルを修正する。修正後:
```bash
npm run typecheck
npm run lint
```

## Step 3: 漏れチェック

| 種別 | 確認内容 |
|------|---------|
| 型定義 | `src/types/` に型の追加・変更が必要か |
| テスト | `__tests__/` に対応するテストがあるか |
| ドキュメント | README や CLAUDE.md の更新が必要か |

## Step 4: コミット & PR

```bash
git add <変更ファイル>
git commit -m "fix: <変更の要約>"
git push origin <ブランチ名>

gh pr create --base main --title "fix: <変更の要約>" --body "$(cat <<'EOF'
## Summary
- <変更内容>

## Test plan
- [ ] <テスト項目>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```
