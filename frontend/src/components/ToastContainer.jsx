// frontend/src/components/ToastContainer.jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectToasts, removeToast, cleanupTracker } from '../features/toastSlice';

function ToastContainer() {
  const toasts = useSelector(selectToasts);
  const dispatch = useDispatch();

  // Periodically clean up the message tracker
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      dispatch(cleanupTracker());
    }, 5000); // Every 5 seconds
    
    return () => clearInterval(cleanupInterval);
  }, [dispatch]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-2">
      {toasts.map(toast => (
        <Toast 
          key={toast.id} 
          toast={toast} 
          onClose={() => dispatch(removeToast(toast.id))}
        />
      ))}
    </div>
  );
}

function Toast({ toast, onClose }) {
  const { id, type, message, duration } = toast;
  
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // Toast style based on type
  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 border-green-600 dark:bg-green-600 dark:border-green-700';
      case 'error':
        return 'bg-red-500 border-red-600 dark:bg-red-600 dark:border-red-700';
      case 'warning':
        return 'bg-yellow-500 border-yellow-600 dark:bg-yellow-600 dark:border-yellow-700';
      case 'info':
      default:
        return 'bg-blue-500 border-blue-600 dark:bg-blue-600 dark:border-blue-700';
    }
  };

  // Icon based on type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'warning':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div 
      className={`flex items-center p-4 rounded-lg shadow-lg border-l-4 text-white min-w-80 max-w-md animate-fade-in-up transition-all ${getToastStyles()}`}
      role="alert"
    >
      <div className="mr-3">
        {getIcon()}
      </div>
      <div className="flex-grow">{message}</div>
      <button 
        onClick={onClose}
        className="ml-auto p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
        aria-label="Close"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}

export default ToastContainer;