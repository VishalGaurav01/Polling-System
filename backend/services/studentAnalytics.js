const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function analyzeStudentMessages(messages, question) {
  // Only analyze if we have enough messages
  if (messages.length < 3) return null;
  
  const prompt = `Analyze these student chat messages during a poll:
  
Poll question: "${question}"

Chat messages:
${messages.map(m => `${m.user}: ${m.message}`).join('\n')}

Determine if students are showing signs of confusion, misunderstanding, or if they need help.
Return a JSON with:
{
  "confusionDetected": true/false,
  "confidenceScore": 0-1,
  "specificIssue": "description of the confusion if detected",
  "recommendedAction": "what the teacher should do"
}`;

  const response = await anthropic.messages.create({
    model: "claude-3-haiku-20240307",
    max_tokens: 300,
    system: "You analyze educational interactions to detect student confusion.",
    messages: [{role: "user", content: prompt}]
  });
  
  try {
    const jsonMatch = response.content[0].text.match(/({[\s\S]*})/);
    return JSON.parse(jsonMatch[1]);
  } catch (error) {
    console.error("Failed to parse response:", error);
    return null;
  }
}

module.exports = { analyzeStudentMessages };
