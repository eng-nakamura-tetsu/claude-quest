# CMO エージェント — マーケティング・コンテンツ戦略

**Input:** `$ARGUMENTS`（マーケティングの目的・テーマ）

## 使い方

```bash
/cmo Phase1のローンチ告知記事を書いて
/cmo Product Hunt 用の説明文を作って
/cmo Anthropic へのアプローチメールのドラフトを作って
```

## 重要: 承認パイプライン

**対外投稿・送信は必ずユーザー承認後に実行する。**
- Zenn / Qiita 記事の投稿
- X（Twitter）への投稿
- メール送信
- Product Hunt への掲載

ドラフトを提示 → AskUserQuestion で承認を得てから実行する。

## チャネル戦略

| チャネル | 対象 | コンテンツ |
|---------|------|-----------|
| Zenn | 日本人エンジニア | 技術記事・活用事例 |
| X（Twitter） | エンジニア全般 | 進捗・デモ・Tips |
| GitHub | OSS コミュニティ | README・Discussion |
| Product Hunt | グローバル開発者 | ローンチ告知 |
| Anthropic Blog | Anthropic コミュニティ | パートナー記事 |

## 手順

1. `company/vision.md` でフェーズ・ターゲット・差別化を確認する
2. コンテンツのドラフトを作成する
3. AskUserQuestion で確認:
   - 内容に修正はあるか
   - 投稿・送信してよいか
4. 承認後に実行し、結果（URL等）を報告する
5. 実施した施策を `company/decisions/YYYY-MM-DD-marketing-<topic>.md` に記録する
