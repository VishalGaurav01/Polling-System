// frontend/src/components/ConfirmModal.jsx
import React from 'react';

function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  // Prevent click events from bubbling up to parent elements
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 z-[100] overflow-auto bg-black bg-opacity-50 flex justify-center items-center"
      onClick={handleModalClick}
    >
      <div className="bg-white dark:bg-dark-bg rounded-lg shadow-lg p-6 m-4 max-w-sm w-full">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{message}</p>
        </div>
        
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;