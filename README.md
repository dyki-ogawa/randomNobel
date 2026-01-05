# 形容詞+名詞ランダム小説ジェネレーター

ランダムに選ばれた形容詞と名詞のペアから、AIが短編小説を生成するWebアプリケーション

## 特徴

- 🎲 **ランダム単語選択**: 形容詞と名詞をランダムに抽選
- ✨ **スロットアニメーション**: サイコロボタンで楽しい演出
- 🤖 **AI小説生成**: Claude AIが800〜1500字の短編小説を自動生成
- 📋 **コピー機能**: 生成された小説を簡単にコピー
- 💫 **スムーズなアニメーション**: フェードインやスロット演出

## デモ

1. 初期表示で形容詞と名詞がランダムに表示されます
2. 🎲ボタンをクリックして、個別に単語を再抽選できます
3. 「この内容で小説を生成」ボタンで小説を生成
4. 生成された小説は📋ボタンでコピー可能

## Vercelへのデプロイ（推奨）

このアプリケーションは**Vercel**で簡単にデプロイできます。GitHub Pagesは静的サイト専用のため、バックエンドが必要な本アプリには対応していません。

### デプロイ手順

1. **Vercelアカウントを作成**
   - [vercel.com](https://vercel.com) にアクセス
   - GitHubアカウントでサインアップ

2. **GitHubリポジトリと連携**
   - Vercelダッシュボードから「New Project」をクリック
   - このリポジトリを選択してインポート

3. **環境変数を設定**
   - プロジェクト設定で「Environment Variables」を選択
   - 以下を追加:
     ```
     ANTHROPIC_API_KEY=your_api_key_here
     ```

4. **デプロイ**
   - 「Deploy」ボタンをクリック
   - 数分後、公開URLが発行されます

5. **以降は自動デプロイ**
   - mainブランチへのpushで自動的に再デプロイされます

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/randomNobel)

## ローカルセットアップ

### 必要要件

- Node.js 18.0.0以上
- Claude API キー

### インストール

1. リポジトリをクローン
```bash
git clone <repository-url>
cd randomNobel
```

2. 依存パッケージをインストール
```bash
npm install
```

3. 環境変数を設定

`.env`ファイルを作成し、Claude APIキーを設定:
```bash
ANTHROPIC_API_KEY=your_api_key_here
PORT=3000
```

### 実行

開発モード（ホットリロード）:
```bash
npm run dev
```

本番モード:
```bash
npm start
```

アプリケーションは `http://localhost:3000` で起動します。

## プロジェクト構造

```
randomNobel/
├── public/              # フロントエンド
│   ├── index.html      # メインHTML
│   ├── style.css       # スタイルシート
│   └── script.js       # クライアントサイドJS
├── data/
│   └── words.json      # 単語データ（形容詞・名詞）
├── server.js           # Expressサーバー
├── vercel.json         # Vercel設定ファイル
├── package.json
├── .env.example        # 環境変数のサンプル
├── .gitignore
└── README.md
```

## 技術スタック

### フロントエンド
- HTML5
- CSS3（アニメーション、グラデーション）
- Vanilla JavaScript

### バックエンド
- Node.js
- Express.js
- Claude API（@anthropic-ai/sdk）

## API エンドポイント

### GET /api/words
単語データ（形容詞と名詞のリスト）を取得

### POST /api/generate
小説を生成

リクエストボディ:
```json
{
  "adjective": "美しい",
  "noun": "洗濯機"
}
```

レスポンス:
```json
{
  "story": "生成された小説の本文..."
}
```

### GET /api/health
ヘルスチェック

## カスタマイズ

### 単語リストの編集

`data/words.json`を編集して、独自の形容詞と名詞を追加できます:

```json
{
  "adjectives": ["美しい", "古い", "..."],
  "nouns": ["洗濯機", "冷蔵庫", "..."]
}
```

### スタイルのカスタマイズ

`public/style.css`でカラースキームやレイアウトを変更できます。

### 小説生成のカスタマイズ

`server.js`の`/api/generate`エンドポイント内のプロンプトを編集して、生成される小説のスタイルや長さを調整できます。

## ライセンス

MIT

## クレジット

Powered by Claude AI (Anthropic)
