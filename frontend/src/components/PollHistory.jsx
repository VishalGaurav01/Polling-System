// frontend/src/components/PollHistory.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectPollHistory } from '../features/pollSlice';

function PollHistory() {
  const navigate = useNavigate();
  const pollHistory = useSelector(selectPollHistory);
  
  return (
    <div className="max-w-3xl mx-auto p-4 bg-white dark:bg-dark-bg text-black dark:text-white">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate('/teacher')} 
          className="text-indigo-500 hover:text-indigo-700 font-semibold"
        >
          &larr; Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold">View Poll History</h1>
      </div>
      
      {pollHistory.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No poll history available yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {pollHistory.map((poll, pollIndex) => (
            <div key={poll.pollId} className="border rounded-lg shadow-sm bg-white dark:bg-dark-bg text-black dark:text-white">
              <div className="bg-gray-700 text-white p-4 rounded-t-lg">
                <h3 className="text-xl">Question {pollIndex + 1}</h3>
                <p>{poll.question}</p>
              </div>
              
              <div className="p-4 space-y-4">
                {poll.options.map((option, index) => {
                  const count = poll.counts[option] || 0;
                  const percentage = poll.totalResponses > 0 
                    ? Math.round((count / poll.totalResponses) * 100) 
                    : 0;
                  
                  return (
                    <div key={index} className="mb-4">
                      <div className="flex items-center mb-1">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center mr-3">
                          {index + 1}
                        </div>
                        <span className="text-lg">{option}</span>
                        <span className="ml-auto font-bold">{percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6">
                        <div 
                          className="bg-indigo-500 h-6 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PollHistory;