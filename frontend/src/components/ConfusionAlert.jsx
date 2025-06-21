import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectConfusionAlerts, selectHasUnreadAlerts, markAlertsAsRead, clearAlerts } from '../features/confusionSlice';

function ConfusionAlert() {
  const alerts = useSelector(selectConfusionAlerts);
  const hasUnread = useSelector(selectHasUnreadAlerts);
  const dispatch = useDispatch();
  
  if (alerts.length === 0) return null;
  
  return (
    <div className="fixed top-20 right-6 w-80 z-50 bg-white dark:bg-dark-bg shadow-xl rounded-lg overflow-hidden border-2 border-yellow-400">
      <div className="bg-yellow-100 dark:bg-yellow-800 px-4 py-3 flex justify-between items-center">
        <h3 className="font-bold text-yellow-800 dark:text-yellow-300 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Student Confusion Detected
          {hasUnread && <span className="ml-2 flex h-3 w-3">
            <span className="animate-ping absolute h-3 w-3 rounded-full bg-red-400 opacity-75"></span>
            <span className="relative rounded-full h-3 w-3 bg-red-500"></span>
          </span>}
        </h3>
        <button 
          onClick={() => dispatch(clearAlerts())}
          className="text-yellow-800 dark:text-yellow-300 hover:text-yellow-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto" onClick={() => dispatch(markAlertsAsRead())}>
        {alerts.map(alert => (
          <div key={alert.id} className="p-4 border-b">
            {/* Add student name section at the top */}
            {alert.studentName && (
              <div className="mb-3">
                <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-1">Student:</h4>
                <p className="text-gray-700 dark:text-gray-300 font-bold">{alert.studentName}</p>
              </div>
            )}
            
            <h4 className="font-medium text-red-600 dark:text-red-400 mb-1">Issue Detected:</h4>
            <p className="text-gray-700 dark:text-gray-300 mb-3">{alert.issue}</p>
            
            <h4 className="font-medium text-green-600 dark:text-green-400 mb-1">Recommended Action:</h4>
            <p className="text-gray-700 dark:text-gray-300">{alert.recommendation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ConfusionAlert;