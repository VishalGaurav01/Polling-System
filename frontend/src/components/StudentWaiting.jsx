// frontend/src/components/StudentWaiting.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { selectStudentName, selectWaitingForNextPoll } from '../features/pollSlice';

function StudentWaiting() {
  const studentName = useSelector(selectStudentName);
  const waitingForNextPoll = useSelector(selectWaitingForNextPoll);
  
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
      
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-indigo-500 mb-8"></div>
      
      {waitingForNextPoll ? (
        <h2 className="text-3xl font-bold mb-4 text-center">A poll is currently in progress.<br/>Please wait for the next poll.</h2>
      ) : (
        <h2 className="text-3xl font-bold mb-4">Wait for the teacher to ask questions..</h2>
      )}
      
      {studentName && (
        <p className="text-gray-600 dark:text-gray-400 mt-2">Logged in as: <span className="font-bold">{studentName}</span></p>
      )}
    </div>
  );
}

export default StudentWaiting;