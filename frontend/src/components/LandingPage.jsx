// frontend/src/components/LandingPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '../hooks/useToast';

function LandingPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedRole, setSelectedRole] = useState(null);
  const studentName = useSelector(state => state.poll.studentName);
  const toast = useToast();
  
  // If already logged in as student, redirect to student page
  useEffect(() => {
    if (studentName) {
      navigate('/student');
    }
  }, [studentName, navigate]);
  
  // Reset state when visiting landing page
  useEffect(() => {
    dispatch({ type: 'poll/resetState' });
  }, [dispatch]);

  const handleContinue = () => {
    if (!selectedRole) {
      toast.warning('Please select a role to continue');
      return;
    }
    
    if (selectedRole === 'student') {
      // Navigate to student login in the same window
      navigate('/student/login');
    } else if (selectedRole === 'teacher') {
      navigate('/teacher');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 md:px-8 bg-white dark:bg-dark-bg text-black dark:text-white transition-colors duration-200">
      <div className="mb-8">
        <button className="bg-indigo-500 dark:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-full flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
          </svg>
          Intervue Poll
        </button>
      </div>
      
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-center">Welcome to the Live Polling System</h1>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-8 max-w-xl mx-auto">
          Please select the role that best describes you to begin using the live polling system
        </p>
        
        {/* Note about testing */}
        <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6 text-blue-800 dark:text-blue-200">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Testing Note:</span>
          </div>
          <p className="mt-1 ml-7">
            Clicking on "Student" will open in a new window, while "Teacher" remains in the current window. 
            This allows a single person to test both views simultaneously for demo purposes.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div 
            className={`border rounded-lg p-6 cursor-pointer transition-colors h-full ${
              selectedRole === 'student' 
                ? 'border-indigo-500 ring-2 ring-indigo-500 bg-white dark:bg-dark-surface' 
                : 'border-gray-300 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-700'
            }`}
            onClick={() => setSelectedRole('student')}
          >
            <h2 className="text-xl font-bold mb-2">I'm a Student</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Join live polls and submit your answers to participate in class activities
            </p>
            <div className="mt-2 text-sm text-indigo-600 dark:text-indigo-400">
              Opens in a new window
            </div>
          </div>

          <div 
            className={`border rounded-lg p-6 cursor-pointer transition-colors h-full ${
              selectedRole === 'teacher' 
                ? 'border-indigo-500 ring-2 ring-indigo-500 bg-white dark:bg-dark-surface' 
                : 'border-gray-300 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-700'
            }`}
            onClick={() => setSelectedRole('teacher')}
          >
            <h2 className="text-xl font-bold mb-2">I'm a Teacher</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Submit answers and view live poll results in real-time.
            </p>
            <div className="mt-2 text-sm text-indigo-600 dark:text-indigo-400">
              Opens in current window
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            className="w-full sm:w-auto px-12 py-3 bg-indigo-500 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-bold rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={!selectedRole}
            onClick={handleContinue}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;