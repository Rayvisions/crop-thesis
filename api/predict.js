// api/predict.js
// Vercel serverless function — proxies Gemini API call
// Keeps your API key out of the browser

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  // As requested: Variable name Gemini_API_Key and the specific key provided
  const Gemini_API_Key = "AIzaSyDSssKJJdhulgW0WnRYW7pLMXWVJI_xlIk";

  try {
    // Google Gemini API uses the key as a query parameter
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${Gemini_API_Key}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt }
              ]
            }
          ]
        }),
      }
    );

    const data = await response.json();

    // Handle Gemini-specific error structure
    if (data.error) {
      return res.status(data.error.code || 500).json({ error: data.error.message });
    }

    // Extract text from Gemini response structure: candidates -> content -> parts -> text
    if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
      const text = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ text });
    } else {
      return res.status(500).json({ error: "Unexpected response format from API" });
    }

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
