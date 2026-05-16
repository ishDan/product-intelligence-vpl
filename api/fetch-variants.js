const Groq = require('groq-sdk')

const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { brand, model } = req.body
  if (!brand || !model) return res.status(400).json({ error: 'brand and model required' })

  try {
    const response = await client.chat.completions.create({
      model: 'compound-beta',
      max_tokens: 1024,
      messages: [
        {
          role: 'system',
          content: 'You are a product spec lookup assistant. Return only valid JSON, no markdown, no explanation.',
        },
        {
          role: 'user',
          content: `List all official color, size, and edition/material variants for the ${brand} ${model}.
DO NOT include connectivity variants like LTE vs Wi-Fi — only physical variants (color, size, special edition).
Return ONLY a JSON array where each item has:
- "color": color name or null
- "variant": special edition or material name or null (e.g. "Titanium", "Stephen Curry Edition")
- "size": physical size like "41mm" or "Size 6" or null

Example for a watch:
[
  {"color": "Obsidian", "variant": null, "size": "41mm"},
  {"color": "Porcelain", "variant": null, "size": "41mm"},
  {"color": "Obsidian", "variant": null, "size": "45mm"}
]

Example for a ring:
[
  {"color": "Silver", "variant": null, "size": "Size 6"},
  {"color": "Silver", "variant": null, "size": "Size 7"},
  {"color": "Black", "variant": null, "size": "Size 6"}
]

Return ONLY the JSON array, no markdown, no explanation.`,
        },
      ],
    })

    const raw = response.choices[0]?.message?.content?.trim() ?? '[]'
    const jsonStr = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    const variants = JSON.parse(jsonStr)

    return res.status(200).json({ variants })
  } catch (err) {
    console.error('fetch-variants error:', err)
    return res.status(500).json({ error: err.message })
  }
}
