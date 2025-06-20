// frontend/src/components/StudentLogin.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  registerStudent,
  selectStudentName,
  selectError,
  clearError
} from '../features/pollSlice';
import { useToast } from '../hooks/useToast';

function StudentLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const studentName = useSelector(selectStudentName);
  const error = useSelector(selectError);
  const kicked = useSelector(state => state.poll.kicked);
  const toast = useToast();
  
  const [name, setName] = useState('');
  
  // Reset kicked state when visiting login page
  useEffect(() => {
    if (kicked) {
      dispatch({ type: 'poll/resetState' });
    }
  }, [kicked, dispatch]);
  
  // If already logged in, redirect to student page
  useEffect(() => {
    if (studentName) {
      navigate('/student');
    }
  }, [studentName, navigate]);
  
  // Clear error message after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    
    dispatch(registerStudent(name.trim()));
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
      
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Let's Get Started</h1>
        <p className="text-gray-600 dark:text-gray-400">
          If you're a student, you'll be able to <strong>submit your answers</strong>, participate in live 
          polls, and see how your responses compare with your classmates
        </p>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 w-full max-w-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2" htmlFor="name">
            Enter your Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="shadow-sm appearance-none border rounded-md w-full py-3 px-4 text-gray-700 dark:text-gray-300 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Your name"
          />
        </div>
        
        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-8 rounded-full w-full"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
}

export default StudentLogin;