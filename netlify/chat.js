
exports.handler = async (event) => {
  const { message, inventory } = JSON.parse(event.body);
  
  // Call your AI provider here
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "system", content: `Pantry: ${inventory}` }, { role: "user", content: message }]
    })
  });
  
  const data = await response.json();
  return {
    statusCode: 200,
    body: JSON.stringify({ reply: data.choices[0].message.content })
  };
};