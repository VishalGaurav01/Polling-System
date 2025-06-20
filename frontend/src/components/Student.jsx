// frontend/src/components/Student.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  optionSelected,
  submitAnswer,
  checkTimeout,
  updateTimer,
  selectActivePoll,
  selectStudentName,
  selectSelectedOption,
  selectHasAnswered,
  selectResults,
  selectError,
  selectTimeLeft,
  selectParticipants,
  selectChatMessages,
  selectWaitingForNextPoll,
  clearError
} from '../features/pollSlice';
import PollQuestion from './PollQuestion';
import PollResults from './PollResults';
import StudentWaiting from './StudentWaiting';
import ChatBox from './ChatBox';

function Student() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const activePoll = useSelector(selectActivePoll);
  const studentName = useSelector(selectStudentName);
  const selectedOption = useSelector(selectSelectedOption);
  const hasAnswered = useSelector(selectHasAnswered);
  const results = useSelector(selectResults);
  const error = useSelector(selectError);
  const timeLeft = useSelector(selectTimeLeft);
  const kicked = useSelector(state => state.poll.kicked);
  const participants = useSelector(selectParticipants);
  const chatMessages = useSelector(selectChatMessages);
  const waitingForNextPoll = useSelector(selectWaitingForNextPoll);
  const [showChat, setShowChat] = useState(false);
  
  // Redirect if kicked
  useEffect(() => {
    if (kicked) {
      navigate('/kicked-out');
    }
  }, [kicked, navigate]);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!studentName && !kicked) {
      navigate('/student/login');
    }
  }, [studentName, kicked, navigate]);
  
  // Clear error message after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);
  
  // Check for poll timeout
  useEffect(() => {
    if (activePoll && timeLeft === 0) {
      dispatch(checkTimeout());
    }
  }, [activePoll, timeLeft, dispatch]);

  const handleSendMessage = (msg) => {
    dispatch({ type: 'socket/sendMessage', payload: msg });
  };
  
  if (!studentName) {
    return null; // Will redirect in useEffect
  }
  
  // If no active poll and no results, show waiting screen
  if (!activePoll && !results) {
    return (
      <div className="bg-white dark:bg-dark-bg text-black dark:text-white">
        <StudentWaiting />
        {showChat && (
          <div className="fixed bottom-20 right-6 w-80 z-10 shadow-xl">
            <ChatBox isTeacher={false} />
          </div>
        )}
        <button 
          className="fixed bottom-6 right-6 bg-indigo-500 text-white rounded-full p-4 shadow-lg z-20"
          onClick={() => setShowChat(!showChat)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      </div>
    );
  }
  
  // If no active poll but has results, show results with waiting message
  if (!activePoll && results) {
    return (
      <div className="bg-white dark:bg-dark-bg text-black dark:text-white">
        <div>
          <PollResults results={results} />
          <div className="mt-8 text-center text-xl text-gray-600">
            <p>Wait for the teacher to ask a new question.</p>
          </div>
        </div>
        
        {showChat && (
          <div className="fixed bottom-20 right-6 w-80 z-10 shadow-xl">
            <ChatBox isTeacher={false} />
          </div>
        )}
        <button 
          className="fixed bottom-6 right-6 bg-indigo-500 text-white rounded-full p-4 shadow-lg z-20"
          onClick={() => setShowChat(!showChat)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      </div>
    );
  }
  
  // Active poll and hasn't answered yet
  if (activePoll && !hasAnswered) {
    return (
      <div className="bg-white dark:bg-dark-bg text-black dark:text-white">
        <PollQuestion 
          poll={activePoll} 
          selectedOption={selectedOption} 
          timeLeft={timeLeft} 
          onOptionSelect={(option) => dispatch(optionSelected(option))}
          onSubmit={() => dispatch(submitAnswer(selectedOption))}
        />
        
        {showChat && (
          <div className="fixed bottom-20 right-6 w-80 z-10 shadow-xl">
            <ChatBox isTeacher={false} />
          </div>
        )}
        <button 
          className="fixed bottom-6 right-6 bg-indigo-500 text-white rounded-full p-4 shadow-lg z-20"
          onClick={() => setShowChat(!showChat)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      </div>
    );
  }
  
  // Active poll and has answered
  return (
    <div className="bg-white dark:bg-dark-bg text-black dark:text-white">
      {results && (
        <PollResults results={results} timeLeft={timeLeft} />
      )}
      
      {showChat && (
        <div className="fixed bottom-20 right-6 w-80 z-10 shadow-xl">
          <ChatBox isTeacher={false} />
        </div>
      )}
      <button 
        className="fixed bottom-6 right-6 bg-indigo-500 text-white rounded-full p-4 shadow-lg z-20"
        onClick={() => setShowChat(!showChat)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>
    </div>
  );
}

export default Student;