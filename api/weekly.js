module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { context = '' } = req.body;

  const prompt = `あなたはtsunaげるというアプリのAIです。今週の感情記録を見て、5つの短い文を返してください。

【今週の記録】
${context}

【出力ルール】
・必ず以下のJSON形式のみで返す。余計な文字は一切不要
・5つの文それぞれが15〜25文字程度
・敬語なし。友達口調
・文1：今週の回数を具体的に褒める
・文2：感情の変化（整理できた・伝えやすくなった等）を褒める
・文3：「それってすごいことだよ」という勇気づけ
・文4：小さな前向きな気づき
・文5：「またいつでも話しかけてね 🌿」で締める

{"sentences":["文1","文2","文3","文4","文5"]}`;

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
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'APIエラー');

    const text = data.content[0].text;
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    const message = parsed.sentences.join('\n');
    res.status(200).json({ message });

  } catch (err) {
    res.status(500).json({ message: '今週もよくがんばってたね。\nまたいつでも話しかけてね 🌿' });
  }
}
