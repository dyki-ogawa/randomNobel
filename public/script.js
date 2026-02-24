// グローバル変数
let wordsData = {
    adjectives: [],
    nouns: []
};

// DOM要素
const adjectiveElement = document.getElementById('adjective');
const nounElement = document.getElementById('noun');
const rerollAdjectiveBtn = document.getElementById('reroll-adjective');
const rerollNounBtn = document.getElementById('reroll-noun');
const generateBtn = document.getElementById('generate-btn');
const loadingElement = document.getElementById('loading');
const storySection = document.getElementById('story-section');
const storyTitleElement = document.getElementById('story-title');
const storyElement = document.getElementById('story');
const errorElement = document.getElementById('error');
const copyBtn = document.getElementById('copy-btn');
const downloadBtn = document.getElementById('download-btn');

// 初期化
async function init() {
    try {
        const response = await fetch('/api/words');
        wordsData = await response.json();

        // 初期単語を設定
        adjectiveElement.textContent = getRandomWord(wordsData.adjectives);
        nounElement.textContent = getRandomWord(wordsData.nouns);
    } catch (error) {
        showError('単語データの読み込みに失敗しました');
    }
}

// ランダムな単語を取得
function getRandomWord(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// クリックで単語を編集可能にする
function makeEditable(element) {
    element.contentEditable = 'true';
    element.classList.add('editing');
    element.focus();
    const range = document.createRange();
    range.selectNodeContents(element);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}

function stopEditing(element, fallbackArray) {
    element.contentEditable = 'false';
    element.classList.remove('editing');
    if (!element.textContent.trim()) {
        element.textContent = getRandomWord(fallbackArray);
    }
}

adjectiveElement.addEventListener('click', () => makeEditable(adjectiveElement));
adjectiveElement.addEventListener('blur', () => stopEditing(adjectiveElement, wordsData.adjectives));
adjectiveElement.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        stopEditing(adjectiveElement, wordsData.adjectives);
    }
});

nounElement.addEventListener('click', () => makeEditable(nounElement));
nounElement.addEventListener('blur', () => stopEditing(nounElement, wordsData.nouns));
nounElement.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        stopEditing(nounElement, wordsData.nouns);
    }
});

// スロットアニメーション
async function slotAnimation(element, wordArray, duration = 1500) {
    element.contentEditable = 'false';
    element.classList.remove('editing');
    const btn = element.closest('.word-display').querySelector('.dice-btn');
    btn.disabled = true;

    const startTime = Date.now();
    let intervalTime = 50; // 初期スピード

    return new Promise((resolve) => {
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;

            // 徐々に減速
            if (progress > 0.7) {
                intervalTime = 150;
            } else if (progress > 0.5) {
                intervalTime = 100;
            }

            // 単語をランダムに変更
            element.classList.add('slot-animation');
            element.textContent = getRandomWord(wordArray);

            setTimeout(() => {
                element.classList.remove('slot-animation');
            }, 50);

            // 終了判定
            if (elapsed >= duration) {
                clearInterval(interval);
                btn.disabled = false;
                resolve();
            }
        }, intervalTime);
    });
}

// 形容詞の再抽選
rerollAdjectiveBtn.addEventListener('click', async () => {
    await slotAnimation(adjectiveElement, wordsData.adjectives);
});

// 名詞の再抽選
rerollNounBtn.addEventListener('click', async () => {
    await slotAnimation(nounElement, wordsData.nouns);
});

// 小説生成
generateBtn.addEventListener('click', async () => {
    const adjective = adjectiveElement.textContent;
    const noun = nounElement.textContent;

    // UI状態を変更
    generateBtn.disabled = true;
    loadingElement.classList.remove('hidden');
    storySection.classList.add('hidden');
    errorElement.classList.add('hidden');

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ adjective, noun })
        });

        if (!response.ok) {
            throw new Error('小説の生成に失敗しました');
        }

        const data = await response.json();

        // ローディングを非表示
        loadingElement.classList.add('hidden');

        // AIの出力からタイトルと本文を分離
        const lines = data.story.split('\n');
        const title = lines[0]; // 最初の行がタイトル
        const body = lines.slice(1).join('\n').trim(); // 残りが本文

        // タイトルと小説を表示（フェードインアニメーション）
        storyTitleElement.textContent = title;
        storyElement.textContent = body;
        storySection.classList.remove('hidden');

    } catch (error) {
        loadingElement.classList.add('hidden');
        showError(error.message || '小説の生成中にエラーが発生しました');
    } finally {
        generateBtn.disabled = false;
    }
});

// エラー表示
function showError(message) {
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');

    // 5秒後に自動で非表示
    setTimeout(() => {
        errorElement.classList.add('hidden');
    }, 5000);
}

// コピー機能
copyBtn.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(storyElement.textContent);

        // フィードバック
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✓ コピーしました';
        copyBtn.classList.add('copied');

        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.classList.remove('copied');
        }, 2000);
    } catch (error) {
        showError('コピーに失敗しました');
    }
});

// ダウンロード機能
downloadBtn.addEventListener('click', () => {
    try {
        // タイトルと本文を結合
        const title = storyTitleElement.textContent;
        const body = storyElement.textContent;
        const fullText = `${title}\n\n${body}`;

        // Blobを作成
        const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });

        // ダウンロードリンクを作成
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}.txt`;

        // ダウンロードを実行
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // フィードバック
        const originalText = downloadBtn.textContent;
        downloadBtn.textContent = '✓ ダウンロード完了';
        downloadBtn.classList.add('downloaded');

        setTimeout(() => {
            downloadBtn.textContent = originalText;
            downloadBtn.classList.remove('downloaded');
        }, 2000);
    } catch (error) {
        showError('ダウンロードに失敗しました');
    }
});

// ページ読み込み時に初期化
init();
