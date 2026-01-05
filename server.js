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
        const prompt = `あなたは創造的な小説家です。以下の形容詞と名詞を使って、短編小説を書いてください。

形容詞: ${adjective}
名詞: ${noun}

要件:
- 文字数は800〜1500字程度
- この形容詞と名詞が物語の中心となるように
- 読者を引き込む魅力的なストーリーにすること
- 日本語で書くこと
- タイトルは不要、本文のみを出力すること

小説:`;

        const message = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 2048,
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
