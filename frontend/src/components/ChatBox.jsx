// frontend/src/components/ChatBox.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearChat, selectParticipants, selectChatMessages } from '../features/pollSlice';
import { showInfoToast } from '../features/toastSlice';

function ChatBox({ onKickStudent, isTeacher = false }) {
  const [activeTab, setActiveTab] = useState('chat');
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  const dispatch = useDispatch();
  
  // Get current user and all participants from Redux store
  const currentUser = useSelector(state => state.poll.studentName) || 'Teacher';
  const participants = useSelector(selectParticipants);
  const storedMessages = useSelector(selectChatMessages);
  
  // Debug - log participants when they change
  useEffect(() => {
    console.log('Participants:', participants);
  }, [participants]);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [storedMessages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        user: currentUser,
        message: message.trim()
      };
      
      // Send message via socket
      dispatch({
        type: 'socket/sendMessage',
        payload: newMessage
      });
      
      setMessage('');
    }
  };

  const handleClearChat = () => {
    dispatch(clearChat());
    dispatch(showInfoToast('Chat history has been cleared'));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-dark-border">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-dark-border">
        <button
          className={`flex-1 py-3 text-center font-medium ${
            activeTab === 'chat' 
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500 dark:border-indigo-400' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('chat')}
        >
          Chat
        </button>
        <button
          className={`flex-1 py-3 text-center font-medium ${
            activeTab === 'participants' 
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500 dark:border-indigo-400' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('participants')}
        >
          Participants
        </button>
      </div>

      {/* Chat Content */}
      {activeTab === 'chat' && (
        <>
          <div className="flex justify-between items-center px-4 py-2 border-b">
            <h3 className="font-medium text-gray-800 dark:text-gray-200">Chat Messages</h3>
            <button
              onClick={handleClearChat}
              className="text-sm text-red-500 hover:text-red-700 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear Chat
            </button>
          </div>
          <div className="p-4 h-72 overflow-y-auto">
            {storedMessages.length > 0 ? (
              storedMessages.map((msg, index) => (
                <div key={index} className={`mb-4 ${msg.user === currentUser ? 'flex justify-end' : ''}`}>
                  <div className={`
                    max-w-xs px-4 py-2 rounded-lg 
                    ${msg.user === currentUser 
                      ? 'bg-indigo-500 text-white' 
                      : msg.user === 'Teacher'
                        ? 'bg-purple-600 text-white border-l-4 border-yellow-400' // Special styling for teacher messages
                        : 'bg-gray-700 dark:bg-gray-800 text-white'
                    }
                  `}>
                    <div className={`
                      text-xs mb-1 font-medium flex items-center
                      ${msg.user === currentUser 
                        ? 'text-indigo-200' 
                        : msg.user === 'Teacher'
                          ? 'text-yellow-200' 
                          : 'text-gray-300'
                      }
                    `}>
                      {msg.user === 'Teacher' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                        </svg>
                      )}
                      {msg.user}
                    </div>
                    <p>{msg.message}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                No messages yet. Start a conversation!
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="border-t p-3 flex">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-grow border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-dark-surface text-gray-800 dark:text-gray-200"
            />
            <button
              onClick={handleSendMessage}
              className="ml-2 bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition"
            >
              Send
            </button>
          </div>
        </>
      )}

      {/* Participants Content */}
      {activeTab === 'participants' && (
        <div className="h-80 overflow-y-auto">
          <div className="px-4 py-3 border-b flex justify-between text-gray-500 dark:text-gray-400">
            <span>Name</span>
            {isTeacher && <span>Action</span>}
          </div>
          {Array.isArray(participants) && participants.length > 0 ? (
            participants.map((name, index) => (
              <div key={index} className="px-4 py-3 border-b flex justify-between items-center text-gray-800 dark:text-gray-200">
                <span className="font-medium">{name}</span>
                {isTeacher && onKickStudent && (
                  <button
                    onClick={() => {
                      // Call the onKickStudent function with the student name
                      // Ensure the event doesn't get stopped or prevented
                      onKickStudent(name);
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Kick out
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-center">
              No participants available
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ChatBox;