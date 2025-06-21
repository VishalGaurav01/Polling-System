// backend/services/questionEnhancer.js
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

// Log the API key existence (not the actual key) for debugging
console.log('Anthropic API Key exists:', !!process.env.ANTHROPIC_API_KEY);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function enhanceQuestion(originalQuestion, options) {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("Anthropic API key is missing. Please check your .env file.");
    return null;
  }
  
  const prompt = `I have a polling question that might need improvement:
  
Question: "${originalQuestion}"
Options: ${options.join(', ')}

Please enhance this question by:
1. Improving clarity and precision
2. Ensuring it tests understanding rather than memorization
3. Making it more engaging

Return ONLY a JSON with:
{
  "enhancedQuestion": "improved question text",
  "enhancedOptions": ["option1", "option2", "option3", "option4"],
  "suggestedCorrectAnswer": "the best correct answer"
}`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 400,
      system: "You are an expert in educational assessment design.",
      messages: [{role: "user", content: prompt}]
    });
    
    // Extract JSON from response
    const jsonMatch = response.content[0].text.match(/({[\s\S]*})/);
    return JSON.parse(jsonMatch[1]);
  } catch (error) {
    console.error("Error with Anthropic API:", error);
    return null;
  }
}

module.exports = { enhanceQuestion };
