const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function analyzeStudentMessages(messages, question) {
  // Only analyze if we have enough messages
  if (messages.length < 2) return null;
  
  try {
    console.log('Constructing prompt with question:', question);
    
    const prompt = `Analyze these student chat messages during a poll:
    
Poll question: "${question}"

Chat messages:
${messages.map(m => `${m.user}: ${m.message}`).join('\n')}

Determine if students are showing signs of confusion, misunderstanding, or if they need help.
Also identify which specific student seems most confused.
Return a JSON with:
{
  "confusionDetected": true/false,
  "confidenceScore": 0-1,
  "confusedStudent": "name of the student who appears most confused",
  "specificIssue": "description of the confusion if detected",
  "recommendedAction": "what the teacher should do"
}`;

    console.log('Sending to Claude API...');
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 300,
      system: "You analyze educational interactions to detect student confusion.",
      messages: [{role: "user", content: prompt}]
    });
    
    console.log('Claude API response received');
    
    try {
      const jsonMatch = response.content[0].text.match(/({[\s\S]*})/);
      if (!jsonMatch) {
        console.error("No JSON found in response:", response.content[0].text);
        return null;
      }
      
      const parsed = JSON.parse(jsonMatch[1]);
      console.log('Parsed result:', parsed);
      return parsed;
    } catch (error) {
      console.error("Failed to parse response:", error);
      console.error("Raw response:", response.content[0].text);
      return null;
    }
  } catch (error) {
    console.error("Error with Claude API:", error);
    return null;
  }
}

module.exports = { analyzeStudentMessages };
