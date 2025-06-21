import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectSelectedOption, selectActivePoll } from '../features/pollSlice';
import { useToast } from '../hooks/useToast';

function PollResults({ results, timeLeft, setQuestion, handleNewQuestion, teacher }) {
  const userAnswer = useSelector(selectSelectedOption);
  const activePoll = useSelector(selectActivePoll); // Get the active poll state
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const toast = useToast();
  
  // Only show correct answer when there's no active poll (poll is finished)
  const isPollFinished = !activePoll;

  const getResultsAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      // Get the backend URL from the environment variable or use the default
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      
      const response = await fetch(`${BACKEND_URL}/api/analyze-results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          pollData: {
            question: results.question,
            correctAnswer: results.correctAnswer,
          },
          results
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setAnalysis(data.analysis);
      } else {
        toast.error('Failed to analyze results');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error connecting to AI service');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto p-6 rounded-lg bg-white dark:bg-dark-bg text-black dark:text-white">
      {/* Header with question number and timer */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Question</h2>
        {timeLeft !== undefined && timeLeft > 0 && (
          <div className="flex items-center text-red-600 dark:text-red-400 text-lg font-semibold">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span>
              {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
            </span>
          </div>
        )}
      </div>

      {/* Question box */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white p-6 rounded-t-lg font-medium text-xl">
        {results.question}
      </div>

      {/* Show correct answer notification ONLY if poll is finished */}
      {isPollFinished && results.correctAnswer && (
        <div className="my-2 p-3 bg-indigo-100 dark:bg-indigo-900 rounded-md">
          <div className="text-center font-bold text-green-600 dark:text-green-400">
            Correct Answer: {results.correctAnswer}
          </div>
          {userAnswer && (
            <div className="text-center mt-1">
              {userAnswer === results.correctAnswer ? (
                <span className="text-green-600 dark:text-green-400 font-semibold">Your answer was correct ✓</span>
              ) : (
                <span className="text-red-600 dark:text-red-400 font-semibold">Your answer was incorrect ✗</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Options and bars */}
      <div className="bg-white dark:bg-dark-bg border border-purple-300 dark:border-purple-600 rounded-b-lg p-6 space-y-6">
        {results.options.map((option, index) => {
          const count = results.counts[option] || 0;
          const percentage = results.totalResponses > 0
            ? Math.round((count / results.totalResponses) * 100)
            : 0;
          
          // Determine if this option is the correct answer, but only if poll is finished
          const isCorrect = isPollFinished && results.correctAnswer === option;

          return (
            <div key={index}>
              <div className={`relative w-full h-12 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border ${
                isCorrect 
                  ? 'border-green-500 dark:border-green-400' 
                  : 'border-indigo-500 dark:border-indigo-400'
              }`}>
                {/* Progress bar */}
                <div
                  className={`absolute left-0 top-0 h-full transition-all duration-500 ease-out ${
                    isCorrect 
                      ? 'bg-green-500 dark:bg-green-600' 
                      : 'bg-indigo-500 dark:bg-indigo-600'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
                
                {/* Text overlay - uncolored background part */}
                <div
                  className="absolute left-0 top-0 h-full w-full flex items-center px-4"
                  style={{ clipPath: `polygon(${percentage}% 0%, 100% 0%, 100% 100%, ${percentage}% 100%)` }}
                >
                  <div className={`w-10 h-10 flex items-center justify-center rounded-full mr-4 text-base font-medium ${
                    isCorrect 
                      ? 'bg-green-500 dark:bg-green-600' 
                      : 'bg-indigo-500 dark:bg-indigo-600'
                  } text-white`}>
                    {index + 1}
                  </div>
                  <span className="font-medium text-lg truncate flex-grow text-gray-700 dark:text-gray-300">
                    {option} {isCorrect && <span className="text-green-500 ml-2">✓</span>}
                  </span>
                  <span className={`font-medium text-lg ${
                    isCorrect 
                      ? 'text-green-500 dark:text-green-400' 
                      : 'text-indigo-500 dark:text-indigo-400'
                  }`}>
                    {percentage}%
                  </span>
                </div>
                
                {/* Text overlay - colored progress part */}
                <div
                  className="absolute left-0 top-0 h-full w-full flex items-center px-4"
                  style={{ clipPath: `polygon(0% 0%, ${percentage}% 0%, ${percentage}% 100%, 0% 100%)` }}
                >
                  <div className={`w-10 h-10 flex items-center justify-center rounded-full mr-4 text-base font-medium bg-white dark:bg-gray-200 ${
                    isCorrect 
                      ? 'text-green-500' 
                      : 'text-indigo-500'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="font-medium text-lg truncate flex-grow text-white">
                    {option} {isCorrect && <span className="text-white ml-2">✓</span>}
                  </span>
                  <span className="font-medium text-lg text-white">
                    {percentage}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 border-t pt-6">
        {!analysis && teacher ? (
          <button
            onClick={getResultsAnalysis}
            disabled={isAnalyzing}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-full"
          >
            {isAnalyzing ? 'Analyzing...' : 'Get AI Analysis'}
          </button>
        ) : analysis && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-3">AI Analysis</h3>
            
            <div className="mb-4">
              <h4 className="font-medium">Key Insights:</h4>
              <p className="text-gray-700 dark:text-gray-300">{analysis.analysis}</p>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium">Potential Misconceptions:</h4>
              <ul className="list-disc pl-5">
                {analysis.misconceptions.map((item, i) => (
                  <li key={i} className="text-gray-700 dark:text-gray-300">{item}</li>
                ))}
              </ul>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium">Recommended Next Steps:</h4>
              <ul className="list-disc pl-5">
                {analysis.recommendedNextSteps.map((item, i) => (
                  <li key={i} className="text-gray-700 dark:text-gray-300">{item}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium">Suggested Follow-up Question:</h4>
              <p className="text-gray-700 dark:text-gray-300 italic">
                "{analysis.followUpQuestion}"
              </p>
              <button
                onClick={() => {
                  // Store the follow-up question
                  setQuestion(analysis.followUpQuestion);
                  // Use options from the analysis if available, otherwise create empty options
                  if (analysis.options && analysis.options.length > 0) {
                    // If the analysis provides options, use them
                    handleNewQuestion(false); // Don't reset the question
                  } else {
                    // If there are no options in the analysis, just clear the current poll state
                    // but keep the question we just set
                    handleNewQuestion(false); // Don't reset the question
                  }
                }}
                className="mt-2 text-indigo-500 hover:text-indigo-700 text-sm underline"
              >
                Use this question
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PollResults;