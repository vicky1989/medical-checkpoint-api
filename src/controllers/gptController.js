const axios = require('axios');

exports.askChatGPT = async (req, res) => {
  const { messages } = req.body;
  console.log('Loaded Key:', process.env.OPENAI_API_KEY?.substring(0, 10));


  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages array' });
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: messages,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.status(200).json({ reply: response.data.choices[0].message.content });
  } catch (err) {
    console.error('GPT Error:', err.response?.data || err.message);
    res.status(500).json({ error: 'ChatGPT request failed' });
  }
};
