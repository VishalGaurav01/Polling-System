// frontend/src/components/Teacher.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  createPoll, 
  getResults,
  pollCreateStarted,
  kickStudent,
  selectActivePoll,
  selectResults,
  selectError,
  clearError,
  selectIsPollCreating,
  selectParticipants,
  selectChatMessages
} from '../features/pollSlice';
import ChatBox from './ChatBox';
import PollResults from './PollResults';
import {useToast} from '../hooks/useToast';
import MCQImageParser from './MCQImageParser';
import ConfirmModal from './ConfirmModal';

function Teacher() {
  // Add new state for the confirm modal
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    studentName: '',
    message: ''
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  const activePoll = useSelector(selectActivePoll);
  const results = useSelector(selectResults);
  const error = useSelector(selectError);
  const isPollCreating = useSelector(selectIsPollCreating);
  const participants = useSelector(selectParticipants);
  const chatMessages = useSelector(selectChatMessages);

  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [timeLimit, setTimeLimit] = useState(60);
  const [showChat, setShowChat] = useState(false);
  const [correctOptionIndex, setCorrectOptionIndex] = useState(null);
  
  useEffect(() => {
    dispatch({ type: 'socket/identifyAsTeacher' });
    dispatch({ type: 'socket/requestParticipants' });
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  useEffect(() => {
    // Request participants list periodically
    const participantsInterval = setInterval(() => {
      dispatch({ type: 'socket/requestParticipants' });
    }, 5000); // Every 5 seconds
    
    return () => clearInterval(participantsInterval);
  }, [dispatch]);

  const handleQuestionParsed = ({question: parsedQuestion, options: parsedOptions}) => {
    setQuestion(parsedQuestion);
    setOptions(parsedOptions);
    toast.success('Question and options extracted from image');
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      const newOptions = [...options];
      newOptions.splice(index, 1);
      setOptions(newOptions);
      if (correctOptionIndex === index) {
        setCorrectOptionIndex(null);
      } else if (correctOptionIndex > index) {
        setCorrectOptionIndex(correctOptionIndex - 1);
      }
    }
  };

  const handleCreatePoll = () => {
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }
    
    const validOptions = options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      toast.error('Please provide at least two answer options');
      return;
    }
    
    // Add this constraint - check if a correct answer is selected
    if (correctOptionIndex === null) {
      toast.error('Please mark at least one option as correct');
      return;
    }

    const correctAnswer = options[correctOptionIndex];
    
    dispatch(pollCreateStarted());
    dispatch(createPoll({
      question: question.trim(),
      options: validOptions,
      timeLimit,
      correctAnswer
    }));
  };

  const handleKickStudent = (studentName) => {
    setConfirmModal({
      isOpen: true,
      studentName,
      message: `Are you sure you want to kick out ${studentName}?`
    });
  };
  
  // Add handlers for confirm modal actions
  const handleConfirmKick = () => {
    dispatch(kickStudent(confirmModal.studentName));
    setConfirmModal({ isOpen: false, studentName: '', message: '' });
  };
  
  const handleCancelKick = () => {
    setConfirmModal({ isOpen: false, studentName: '', message: '' });
  };

  const handleGetResults = () => {
    dispatch(getResults());
  };

  const handleNewQuestion = () => {
    setQuestion('');
    setOptions(['', '']);
    setTimeLimit(60);
    setCorrectOptionIndex(null);
    dispatch({ type: 'poll/resetState' });
    setTimeout(() => {
      dispatch({ type: 'socket/requestParticipants' });
    }, 100); 
  };

  const handleSendMessage = (message) => {
    dispatch({
      type: 'socket/sendMessage',
      payload: {
        user: 'Teacher',
        message: message.trim()
      }
    });
  };

  if (results) {
    return (
      <div className="max-w-3xl mx-auto p-4 bg-white dark:bg-dark-bg text-black dark:text-white">
        <div className="flex justify-end mb-4">
          <button 
            onClick={() => navigate('/poll-history')}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-full flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            View Poll history
          </button>
        </div>
        
        <PollResults results={results} />

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleNewQuestion}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-8 rounded-full flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Ask a new question
          </button>
        </div>

        {showChat && (
          <div className="fixed bottom-20 right-6 w-80 z-10 shadow-xl">
            <ChatBox 
              isTeacher={true}
              onKickStudent={handleKickStudent}
              onSendMessage={handleSendMessage}
              key={`chat-${participants.length}`} // Force re-render when participants change
            />
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
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={handleCancelKick}
          onConfirm={handleConfirmKick}
          title="Confirm Action"
          message={confirmModal.message}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white dark:bg-dark-bg text-black dark:text-white">
      <div className="mb-6">
        <button className="bg-indigo-500 text-white font-semibold py-2 px-4 rounded-full flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
          </svg>
          Intervue Poll
        </button>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Let's Get Started</h1>
        <p className="text-gray-600 dark:text-gray-400">
          you'll have the ability to create and manage polls, ask questions, and monitor 
          your students' responses in real-time.
        </p>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-6">
        <MCQImageParser onQuestionParsed={handleQuestionParsed} />
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
          Enter your question
        </label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="shadow-sm appearance-none border rounded-md w-full py-3 px-4 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-dark-bg"
          placeholder="Type your question here..."
          rows={4}
          disabled={isPollCreating}
        ></textarea>
        <div className="flex justify-end mt-1">
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            {question.length}/100
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <label className="block text-gray-700 dark:text-gray-300 font-semibold">
          Time Limit
        </label>
        <div className="relative inline-block">
          <select
            value={timeLimit}
            onChange={(e) => setTimeLimit(Number(e.target.value))}
            className="shadow-sm appearance-none bg-gray-100 dark:bg-gray-800 border rounded-md py-2 px-4 pr-8 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isPollCreating}
          >
            <option value={30}>30 seconds</option>
            <option value={60}>60 seconds</option>
            <option value={90}>90 seconds</option>
            <option value={120}>120 seconds</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="text-gray-700 dark:text-gray-300 font-semibold">
            Edit Options
          </label>
          <label className="text-gray-700 dark:text-gray-300 font-semibold">
            Is it Correct?
          </label>
        </div>
        
        {options.map((option, index) => (
          <div key={index} className="flex items-center mb-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center mr-3">
              {index + 1}
            </div>
            <input
              type="text"
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              className="shadow-sm appearance-none border rounded-md flex-grow py-3 px-4 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 mr-4 bg-white dark:bg-dark-bg"
              placeholder={`Option ${index + 1}`}
              disabled={isPollCreating}
            />
            
            <div className="flex items-center ml-4">
              {/* <span className="mr-2 text-gray-700 dark:text-gray-300">Is it Correct?</span> */}
              <label className="inline-flex items-center mr-2">
                <input
                  type="radio"
                  name={`correct-${index}`}
                  checked={correctOptionIndex === index}
                  onChange={() => setCorrectOptionIndex(index)}
                  className="form-radio h-4 w-4 text-blue-600"
                  disabled={isPollCreating}
                />
                <span className="ml-1">Yes</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name={`correct-${index}`}
                  checked={correctOptionIndex !== index}
                  onChange={() => setCorrectOptionIndex(null)}
                  className="form-radio h-4 w-4 text-blue-600"
                  disabled={isPollCreating}
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">No</span>
              </label>
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="ml-4 text-red-500 hover:text-red-700"
                  disabled={isPollCreating}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
        
        <button
          type="button"
          onClick={addOption}
          className="mt-2 text-indigo-500 hover:text-indigo-700 font-semibold py-2 px-4 border border-indigo-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={isPollCreating || options.length >= 8}
        >
          + Add More option
        </button>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={handleCreatePoll}
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-8 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isPollCreating}
        >
          Ask Question
        </button>
      </div>

      {showChat && (
        <div className="fixed bottom-20 right-6 w-80 z-10 shadow-xl">
          <ChatBox 
            isTeacher={true}
            onKickStudent={handleKickStudent}
          />
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

      {/* Add the confirmation modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={handleCancelKick}
        onConfirm={handleConfirmKick}
        title="Confirm Action"
        message={confirmModal.message}
      />
    </div>
  );
}

export default Teacher;