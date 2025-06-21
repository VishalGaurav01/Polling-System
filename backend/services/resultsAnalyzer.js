const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

// Log the API key existence (not the actual key) for debugging
console.log('Anthropic API Key exists:', !!process.env.ANTHROPIC_API_KEY);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function analyzePollResults(pollData, results) {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("Anthropic API key is missing. Please check your .env file.");
    return null;
  }
  
  const correctCount = results.counts[pollData.correctAnswer] || 0;
  const totalResponses = results.totalResponses;
  const percentCorrect = totalResponses > 0 ? (correctCount / totalResponses) * 100 : 0;
  
  // Gather distribution of answers
  const distributionText = Object.entries(results.counts)
    .map(([option, count]) => `"${option}": ${count} students (${Math.round(count/totalResponses*100)}%)`)
    .join('\n');
  
  const prompt = `Analyze these polling results and provide insights:
  
Question: "${pollData.question}"
Correct answer: "${pollData.correctAnswer}"
Total responses: ${totalResponses}
Correct responses: ${correctCount} (${percentCorrect.toFixed(1)}%)

Distribution of answers:
${distributionText}

Provide a concise analysis with:
1. What the results reveal about student understanding
2. Specific misconceptions based on wrong answer patterns
3. Recommended next steps for the teacher
4. A follow-up question that would address any identified gaps

Format as JSON:
{
  "analysis": "brief analysis of results",
  "misconceptions": ["identified misconception 1", "misconception 2"],
  "recommendedNextSteps": ["step 1", "step 2", "step 3"],
  "followUpQuestion": "suggested follow-up question"
}`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 800,
      system: "You are an expert educational data analyst specializing in formative assessment.",
      messages: [{role: "user", content: prompt}]
    });
    
    const jsonMatch = response.content[0].text.match(/({[\s\S]*})/);
    return JSON.parse(jsonMatch[1]);
  } catch (error) {
    console.error("Error with Anthropic API:", error);
    return null;
  }
}

module.exports = { analyzePollResults };
