// export default PollResults;
import React from 'react';

function PollResults({ results, timeLeft }) {
  return (
    <div className="max-w-2xl mx-auto p-6 rounded-lg bg-white dark:bg-dark-bg text-black dark:text-white">
      {/* Header with question number and timer */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Question</h2>
        {timeLeft !== undefined && (
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

      {/* Options and bars */}
      <div className="bg-white dark:bg-dark-bg border border-purple-300 dark:border-purple-600 rounded-b-lg p-6 space-y-6">
        {results.options.map((option, index) => {
          const count = results.counts[option] || 0;
          const percentage = results.totalResponses > 0
            ? Math.round((count / results.totalResponses) * 100)
            : 0;

          return (
            <div key={index}>
              <div className="relative w-full h-12 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-indigo-500">
                {/* Progress bar */}
                <div
                  className="absolute left-0 top-0 h-full bg-indigo-500 dark:bg-indigo-600 transition-all duration-500 ease-out"
                  style={{ width: `${percentage}%` }}
                />
                
                {/* Text overlay - uncolored background part */}
                <div
                  className="absolute left-0 top-0 h-full w-full flex items-center px-4"
                  style={{ clipPath: `polygon(${percentage}% 0%, 100% 0%, 100% 100%, ${percentage}% 100%)` }}
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-full mr-4 text-base font-medium bg-indigo-500 dark:bg-indigo-600 text-white">
                    {index + 1}
                  </div>
                  <span className="font-medium text-lg truncate flex-grow text-gray-700 dark:text-gray-300">
                    {option}
                  </span>
                  <span className="font-medium text-lg text-indigo-500 dark:text-indigo-400">
                    {percentage}%
                  </span>
                </div>
                
                {/* Text overlay - colored progress part */}
                <div
                  className="absolute left-0 top-0 h-full w-full flex items-center px-4"
                  style={{ clipPath: `polygon(0% 0%, ${percentage}% 0%, ${percentage}% 100%, 0% 100%)` }}
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-full mr-4 text-base font-medium bg-white dark:bg-gray-200 text-indigo-500">
                    {index + 1}
                  </div>
                  <span className="font-medium text-lg truncate flex-grow text-white">
                    {option}
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
    </div>
  );
}

export default PollResults;