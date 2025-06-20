// Simple data model for a poll
class Poll {
  constructor(question, options, timeLimit = 60) {
    this.id = Date.now();
    this.question = question;
    this.options = options;
    this.startTime = Date.now();
    this.timeLimit = timeLimit; // Allow custom time limit
    this.answers = new Map(); // Map of student name to their answer
  }

  recordAnswer(studentName, answer) {
    this.answers.set(studentName, answer);
  }

  getResults() {
    const results = {
      pollId: this.id,
      question: this.question,
      options: this.options,
      totalResponses: this.answers.size,
      counts: {}
    };

    // Initialize counts for each option
    this.options.forEach(option => {
      results.counts[option] = 0;
    });

    // Count answers
    this.answers.forEach(answer => {
      if (results.counts[answer] !== undefined) {
        results.counts[answer]++;
      }
    });

    return results;
  }

  isExpired() {
    const currentTime = Date.now();
    // Add a small buffer (5 seconds) to ensure we don't end prematurely
    const elapsedTime = (currentTime - this.startTime) / 1000; // in seconds
    return elapsedTime > this.timeLimit; // Changed from >= to > for more precise timing
  }
}

module.exports = Poll;