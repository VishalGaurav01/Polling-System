// frontend/src/components/PollQuestion.jsx
import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { optionSelected, submitAnswer } from '../features/pollSlice';
import { useToast } from '../hooks/useToast';

function PollQuestion({ poll, selectedOption, timeLeft, onOptionSelect, onSubmit }) {
  const dispatch = useDispatch();
  const toast = useToast();
  
  // Use refs to track which warnings have been shown
  const warningsShown = useRef({
    thirty: false,
    ten: false,
    five: false,
  });
  
  // Use ref to prevent duplicate submission toasts
  const hasSubmitted = useRef(false);
  
  const handleOptionSelect = (option) => {
    dispatch(optionSelected(option));
  };

  // Reset warnings when a new poll is received
  useEffect(() => {
    if (poll) {
      warningsShown.current = {
        thirty: false,
        ten: false,
        five: false,
      };
      hasSubmitted.current = false;
    }
  }, [poll?.id]);

  useEffect(() => {
    if (timeLeft === 30 && !warningsShown.current.thirty) {
      toast.warning('30 seconds remaining to answer!');
      warningsShown.current.thirty = true;
    } else if (timeLeft === 10 && !warningsShown.current.ten) {
      toast.warning('Only 10 seconds left!');
      warningsShown.current.ten = true;
    } else if (timeLeft === 5 && !warningsShown.current.five) {
      toast.error('Hurry up! 5 seconds left!');
      warningsShown.current.five = true;
    }
  }, [timeLeft, toast]);
  
  const handleSubmit = () => {
    if (!selectedOption) {
      toast.error('Please select an option before submitting');
      return;
    }
    
    if (onSubmit && !hasSubmitted.current) {
      onSubmit();
      hasSubmitted.current = true;
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto p-4 bg-white dark:bg-dark-bg text-black dark:text-white">
      <div className="flex items-center mb-4">
        <h2 className="text-2xl font-bold mr-4">Question</h2>
        {timeLeft !== undefined && (
          <div className="flex items-center text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold text-red-500">
              {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
            </span>
          </div>
        )}
      </div>
      
      <div className="bg-gray-700 text-white p-4 rounded-t-lg">
        <h3 className="text-xl">{poll.question}</h3>
      </div>
      
      <div className="space-y-3 mt-4">
        {poll.options.map((option, index) => (
          <div 
            key={index}
            className={`
              border rounded-lg p-4 cursor-pointer transition-colors
              ${selectedOption === option 
                ? 'bg-indigo-500 border-indigo-600' 
                : 'hover:bg-gray-100 border-gray-300 bg-white dark:bg-gray-900 dark:border-gray-600 dark:hover:bg-gray-800'}
            `}
            onClick={() => handleOptionSelect(option)}
          >
            <div className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center mr-3
                ${selectedOption === option 
                  ? 'bg-white text-indigo-500' 
                  : 'bg-indigo-100 text-indigo-500 dark:bg-indigo-900'}
              `}>
                {index + 1}
              </div>
              <span className={`text-lg ${
                selectedOption === option 
                  ? 'text-white' 
                  : 'text-gray-800 dark:text-gray-200'
              }`}>
                {option}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 flex justify-center">
        <button
          onClick={handleSubmit}
          className="bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full disabled:opacity-50 disabled:cursor-not-allowed w-full max-w-xs"
          disabled={!selectedOption || timeLeft === 0 || hasSubmitted.current}
        >
          Submit
        </button>
      </div>
    </div>
  );
}

export default PollQuestion;