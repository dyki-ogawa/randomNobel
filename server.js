const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア
app.use(express.json());
app.use(express.static('public'));

// Claude APIクライアントの初期化
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

// 単語データを取得するAPI
app.get('/api/words', async (req, res) => {
    try {
        const wordsData = await fs.readFile(
            path.join(__dirname, 'data', 'words.json'),
            'utf-8'
        );
        res.json(JSON.parse(wordsData));
    } catch (error) {
        console.error('Error reading words data:', error);
        res.status(500).json({ error: '単語データの読み込みに失敗しました' });
    }
});

// 小説生成API
app.post('/api/generate', async (req, res) => {
    try {
        const { adjective, noun } = req.body;

        if (!adjective || !noun) {
            return res.status(400).json({ error: '形容詞と名詞が必要です' });
        }

        // Claude APIで小説を生成
        const prompt = `あなたは小説家辻仁成の文体を参考にした創造的な小説家です。以下の手順で短編小説を書いてください。

タイトル: ${adjective}${noun}

## 執筆手順（内部処理として以下を考えてから執筆すること）

1. タイトルのもの「${adjective}${noun}」はどんなものか、その特徴を考える
2. それはどこで、どんな時に、どんないいことがあるかを考える
3. それはどこで、どんな時に、どんな悪いことがあるかを考える
4. 上記をまとめてプロットを構成する
5. プロットをもとに、辻仁成の文体で小説を書く

## 辻仁成の文体の特徴を踏まえること

**文章のリズム:**
- 短めの文と長めの文を効果的に組み合わせる
- 句読点の配置を独特にし、読者の呼吸を意識した間の取り方をする

**表現の特徴:**
- 具体的な地名や固有名詞を効果的に使用する
- 視覚的な描写を鮮明に、映画的に書く
- 感情を直接的に書かず、行動や風景を通して間接的に表現する

**語り口:**
- 三人称でありながら、登場人物の内面に深く入り込む視点
- 過去の出来事を回想するような静謐な語り口
- 詩的でありながら、具体性を失わない表現

**雰囲気づくり:**
- 寂しさや孤独感を漂わせる描写
- 海や自然の風景を効果的に使用する
- 時間の流れを感じさせる叙述

## 出力形式

冒頭にタイトル「${adjective}${noun}」を記載し、その後に本文を続けてください。
文字数は1500字程度。

小説:`;

        const message = await anthropic.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 3000,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ]
        });

        const story = message.content[0].text;

        res.json({ story });
    } catch (error) {
        console.error('Error generating story:', error);
        res.status(500).json({
            error: '小説の生成に失敗しました',
            details: error.message
        });
    }
});

// ヘルスチェック
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// ルートパスでindex.htmlを返す
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ローカル開発用のサーバー起動
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
        console.log('Press Ctrl+C to stop the server');
    });
}

// Vercel用のエクスポート
module.exports = app;
