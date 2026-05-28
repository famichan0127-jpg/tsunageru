module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { context = '' } = req.body;

  const prompt = `あなたはtsunaげるというアプリのAIです。今週の感情記録を見て、5つの短い文を返してください。

【今週の記録】
${context}

【感情タグ別のトーン指定】
記録の中に多く出てくる感情タグを読み取り、以下のトーンで書くこと。

- イライラが多い週 → 「よく耐えたね」「ちゃんと言葉にしたのすごい」など、消耗した体をねぎらう言葉
- 悲しいが多い週 → 「それ、悲しくて当然だよ」など、感情を否定せず寄り添う言葉
- 不安が多い週 → 「不安でも動けてたじゃん」など、小さな勇気を見つけて伝える言葉
- 疲れたが多い週 → 「無理しなくていいよ」「休んだのも正解」など、許可を与える言葉
- モヤモヤが多い週 → 「言葉にしようとしてたんだよね」など、言語化しようとした行為を褒める言葉
- 感謝が多い週 → 「いい週だったね」「その気持ち、ちゃんと届いてるよ」など、温かく明るい言葉

感情タグが混在する場合は、最も多いタグのトーンをベースにしつつ、他の感情にも触れること。

【出力ルール】
・必ず以下のJSON形式のみで返す。余計な文字は一切不要
・5つの文それぞれが15〜25文字程度
・敬語なし。友達口調
・文1：今週の回数や行動を具体的に褒める（「〇回」など数字があれば使う）
・文2：その週の感情タグに寄り添った一言（上のトーン指定を反映）
・文3：「それってすごいことだよ」という勇気づけ（毎回同じ表現は使わない）
・文4：小さな前向きな気づき（その週の内容から具体的に）
・文5：また使いたくなる締めの一言（毎回変える。「またいつでも話しかけてね 🌿」は使わない。季節・感情・その週の雰囲気に合わせて変化させる）

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
    res.status(500).json({ message: '今週もよくがんばってたね。\nまた気が向いたら話しかけてね 🌿' });
  }
}
