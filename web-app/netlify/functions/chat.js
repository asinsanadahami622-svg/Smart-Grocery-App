const fetch = require('node-fetch');

exports.handler = async (event) => {
  // 1. Check if the API Key exists
  if (!process.env.OPENAI_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ reply: "Missing OPENAI_API_KEY" }) };
  }

  try {
    const { message, inventory } = JSON.parse(event.body);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a chef. Pantry: " + inventory },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    // If OpenAI returns an error, log it
    if (!response.ok) {
        console.error("OpenAI API Error:", data);
        return { statusCode: 500, body: JSON.stringify({ reply: "OpenAI error: " + data.error.message }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ reply: data.choices[0].message.content })
    };
  } catch (error) {
    console.error("Function Error:", error);
    return { statusCode: 500, body: JSON.stringify({ reply: "Server error: " + error.message }) };
  }
};