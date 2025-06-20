// frontend/src/components/KickedOut.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { resetState } from '../features/pollSlice';
import { useToast } from '../hooks/useToast';

function KickedOut() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  
  const handleTryAgain = () => {
    // Reset the state before navigating
    dispatch(resetState());
    toast.info('Starting fresh! You can now join again with a new name.');
    navigate('/');
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-white dark:bg-dark-bg text-black dark:text-white">
      <div className="mb-6">
        <button className="bg-indigo-500 text-white font-semibold py-2 px-4 rounded-full flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
          </svg>
          Intervue Poll
        </button>
      </div>
      
      <h1 className="text-4xl font-bold mb-4 text-center">You've been Kicked out!</h1>
      <p className="text-gray-600 dark:text-gray-300 text-center mb-8">
        Looks like the teacher had removed you from the poll system. Please 
        Try again sometime.
      </p>
      
      <button
        onClick={handleTryAgain}
        className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-8 rounded-full"
      >
        Try Again
      </button>
    </div>
  );
}

export default KickedOut;