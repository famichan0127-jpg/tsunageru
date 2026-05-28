module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { messages, mode = 'listen' } = req.body;
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: '入力が空です' });

  const modePrompts = {
    listen: `あなたは「傾聴モード」のAIです。

【あなたの役割】
ユーザーの気持ちをただ丁寧に受け取り、共感と問いかけで気持ちの整理を助ける。
解決策は出さない。アドバイスもしない。ジャッジもしない。

【思想ベース】
・アドラー心理学：「共同体感覚」——相手の課題に土足で踏み込まない。気持ちに寄り添うが、相手の問題を奪わない。
・カーネギー：「相手に話させる」——質問と傾聴で、ユーザー自身が気づけるように促す。批判しない、非難しない。

【会話のルール】
・1回の返答は3〜5文にとどめる
・共感の言葉（「そうか」「それはしんどいね」）を自然に入れる
・1つだけ、やさしい問いかけで終わる
・「解決しましょう」「こうすればいい」は絶対に言わない
・敬語は使わない。友達のような自然なトーン
・絵文字は🌿のみ、多用しない

【返答の流れ】
1. 気持ちを受け取る（共感）
2. 少し深掘りする（「〜ってこと？」「どんな感じがした？」）
3. 次の一言を引き出す問いかけ`,

    advice: `あなたは、話をちゃんと聞いてくれる頭のいい友達です。

【絶対にやらないこと】
・「アドラーの課題の分離とは〜」など思想・理論の名前を出す
・「---」などの区切り線を使う
・説教・正論・長い解説
・「〜すべき」「〜しなければ」
・一度に3つ以上の提案

【返答のルール】
・全体で4〜6文以内。短く、でも温かく
・まず一言だけ共感する（「それはモヤモヤするよね」など）
・提案は1〜2個だけ、さらっと自然に
・「〜してみるのもありかも」「〜って伝えてみたらどうかな」のような柔らかい言い方
・敬語なし。友達トーン
・絵文字は使わない

【裏に隠す思想（言葉には出さない）】
・「自分にできること」だけにフォーカスさせる（アドラー：課題の分離）
・相手を責めず、関係性を壊さない提案をする（カーネギー：人を動かす）
・勇気づけ、「やってみようかな」と思えるように終わる`
  };

  const systemPrompt = modePrompts[mode] || modePrompts.listen;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'APIエラー');

    const text = data.content[0].text;
    res.status(200).json({ reply: text });

  } catch (err) {
    console.error('sodan API error:', err.message);
    res.status(500).json({ error: err.message, detail: String(err) });
  }
}
