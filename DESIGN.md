# Claude Quest デザインシステム

## コンセプト

レトロ RPG（ドラクエ風）× モダン Web。
ピクセルアート感を持ちながら、実用的な Web サービスとして成立するデザイン。

## カラーパレット

| 用途 | カラー | Hex |
|------|--------|-----|
| 背景（メイン） | ダークネイビー | `#0a0a1a` |
| 背景（カード） | ダークブルー | `#0f1629` |
| ゴールド（見出し・強調） | ゴールド | `#ffd700` |
| テキスト（メイン） | ライトブルー | `#e0e8ff` |
| テキスト（サブ） | グレーブルー | `#8899aa` |
| HP バー | グリーン | `#00cc44` |
| MP バー | ブルー | `#4488ff` |
| EXP バー | イエロー | `#ffaa00` |
| ボーダー | ゴールド薄 | `#ffd70044` |
| アクセント（危険） | レッド | `#ff4444` |
| アクセント（成功） | シアン | `#00ffcc` |

## タイポグラフィ

| 用途 | フォント |
|------|---------|
| 見出し・UI ラベル | Press Start 2P（Google Fonts） |
| 本文・説明テキスト | VT323（Google Fonts） |
| コード | JetBrains Mono |

## コンポーネントスタイル

### RPG ウィンドウ
```css
border: 2px solid #ffd700;
border-radius: 4px;
background: #0f1629;
box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
```

### ボタン
```css
font-family: 'Press Start 2P';
border: 2px solid #ffd700;
background: transparent;
color: #ffd700;
cursor: pointer;
/* hover */
background: #ffd700;
color: #0a0a1a;
```

### CRT エフェクト（オーバーレイ）
```css
background: repeating-linear-gradient(
  0deg,
  transparent,
  transparent 2px,
  rgba(0, 0, 0, 0.1) 2px,
  rgba(0, 0, 0, 0.1) 4px
);
pointer-events: none;
```

## アニメーション

- マイクロインタラクション: 150-300ms
- タイプライター効果: 30ms/文字
- フラッシュ（レベルアップ）: 600ms
- ダメージ揺れ: 500ms

## レスポンシブ

- モバイル: 375px〜
- タブレット: 768px〜
- デスクトップ: 1024px〜
