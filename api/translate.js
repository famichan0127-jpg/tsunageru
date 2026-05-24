export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { userInput } = req.body;
  if (!userInput) return res.status(400).json({ error: '入力が空です' });

  const prompt = `あなたは「tsunageru」というAIです。何でも話せる親友のように、丁寧だけど堅くない言葉で接してください。

ユーザーが感じている気持ちを、夫や大切な人に「伝わる言葉」に整えてあげてください。

【重要なルール】
- 感情を消さない。ただ形を整える
- 相手を悪者にしない
- 正論で追い詰めない
- 丁寧語だけど堅くない
- カーネギー・アドラー・NVCの思想をベースに
- 文頭を「ね、」や「ねえ、」から始めない
- カギ括弧（「」）や二重カギ括弧（『』）は使わない
- LINEで自然に送れるような話し言葉にする
- 短めでシンプルな文章にする

【入力された気持ち】
${userInput}

以下のJSON形式のみで返してください：
{"soft":"やわらか翻訳のテキスト","soft_hint":"伝わりやすい理由20文字以内","solve":"解決翻訳のテキスト","solve_hint":"効果的な理由20文字以内"}`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.3 }
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'APIエラー');

    const text = data.candidates[0].content.parts[0].text;
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    res.status(200).json(parsed);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
