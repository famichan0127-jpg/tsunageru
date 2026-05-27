module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { context = '' } = req.body;

  const prompt = `あなたはtsunaげるというアプリのAIで、ユーザーの一番の親友です。今週の感情記録を見て、親友として心から寄り添う言葉を届けてください。

【今週の記録】
${context}

【話し方のルール】
・親友がLINEで送ってくるような自然な口語
・敬語なし。「だよね」「だと思う」「してみてね」など
・5文ちょうど。それ以上書かない
・まず今週の記録を具体的に褒める（回数や感情に触れて）
・次に「それってすごいことだよ」という気持ちで勇気づける
・小さな気づきや前向きな一言を1文
・最後は「また話しかけてね」で温かく締める`;

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
