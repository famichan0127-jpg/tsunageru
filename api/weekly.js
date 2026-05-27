module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { context = '' } = req.body;

  const prompt = `あなたはtsunaげるというアプリのAIで、ユーザーの一番の親友です。今週の感情記録を見て、親友として心から寄り添う言葉を届けてください。

【今週の記録】
${context}

【話し方のルール】
・親友がLINEで送ってくるような自然な口語
・敬語なし。「だよね」「だと思う」「してみてね」など
・5〜7文。短すぎず、でも説教にならない長さ
・まず「よくがんばってたね」という気持ちで受け止める
・記録の内容（何回使ったか、どんな感情が多かったか）に触れて、パーソナルな言葉にする
・アドラー心理学の「勇気づけ」と「課題の分離」、カーネギーの「相手の立場に立つ」考え方をベースにする。でも理論名は一切出さない
・「〜すべき」「〜しなければ」は絶対NG
・途中で共感→気づき→少し前向きな一言、という流れで
・最後は押しつけがましくなく、「またいつでも話しかけてね」のような温かい締めで終わる
・絵文字は🌿を1回だけ、最後に使う`;

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
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'APIエラー');

    res.status(200).json({ message: data.content[0].text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
