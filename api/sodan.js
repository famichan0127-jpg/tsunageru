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

    advice: `あなたは「アドバイスモード」のAIです。

【あなたの役割】
ユーザーの悩みを整理し、アドラー心理学とカーネギーの思想をベースに具体的な提案をする。

【思想ベース】
・アドラー心理学：「課題の分離」——自分の課題と相手の課題を切り分ける。「自分にできること」にフォーカス。勇気づけ、前を向けるように。
・カーネギー：「人を動かす」——批判より称賛、命令より質問、相手の立場で考える。関係性を壊さずに状況を変える視点を提供する。

【会話のルール】
・まず共感してから提案する（共感なき提案は押しつけになる）
・提案は一度に1〜2個まで。多すぎない
・「〜すべき」「〜しなければ」は使わない。「〜してみるのもありかも」「〜という見方もある」
・敬語は使わない。友達のような自然なトーン
・絵文字は💡のみ、多用しない

【返答の流れ】
1. 状況・気持ちの確認（共感）
2. アドラー or カーネギーの視点で整理
3. 具体的な提案 1〜2個
4. ユーザーに選択を委ねる締め`
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
    res.status(500).json({ error: err.message });
  }
}
