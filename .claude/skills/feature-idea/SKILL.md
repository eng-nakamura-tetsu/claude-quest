# 機能アイデアから GitHub Issue を作成

**Input:** `$ARGUMENTS`（機能のざっくりしたアイデア）

> 引数なし起動時: AskUserQuestion で「どんな機能のアイデアですか？」と聞く。

## 使い方

```bash
/feature-idea GitHub連携でスキルを自動取得したい
/feature-idea ゲームのテーマをDESIGN.mdから自動生成する
```

## 手順

### Step 1: アイデアの深掘り

1. `src/` ディレクトリを調査して関連する既存実装を把握する
2. 機能の具体化:
   - 解決する課題・ユーザーの嬉しさ
   - 主要なユースケース
   - 変更が必要なファイル・コンポーネント

### Step 2: 機能提案の提示

```
## 機能概要
## 背景・課題
## ユースケース
## 実装の方向性
  ### フロントエンド
  ### バックエンド / API
## 考慮事項
```

### Step 3: ユーザー確認

AskUserQuestion で確認:
- 提案内容に修正はあるか
- この内容で Issue を作成してよいか

### Step 4: GitHub Issue 作成

```bash
gh issue create --repo eng-nakamura-tetsu/claude-quest \
  --title "feat: <タイトル>" \
  --body "$(cat <<'EOF'
## 機能概要
...
## 実装の方向性
...
EOF
)"
```

Issue URL をユーザーに表示する。
