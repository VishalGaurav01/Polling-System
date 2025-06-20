// frontend/src/features/toastSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Generate unique IDs for toasts
const generateId = () => Math.random().toString(36).substr(2, 9);

const initialState = {
  toasts: [],
  messageTracker: {} // Track messages to prevent duplicates
};

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    addToast: (state, action) => {
      const { type = 'info', message, duration = 3000 } = action.payload;
      
      // Create a unique key for this message type combination
      const messageKey = `${type}:${message}`;
      
      // Check if this exact message is already being displayed
      if (state.messageTracker[messageKey]) {
        // Skip adding duplicate toast
        return;
      }
      
      // Add to tracker with timestamp
      state.messageTracker[messageKey] = Date.now();
      
      // Add toast
      const id = generateId();
      state.toasts.push({
        id,
        type,
        message,
        duration,
        messageKey
      });
    },
    removeToast: (state, action) => {
      // Find the toast to remove
      const toastToRemove = state.toasts.find(toast => toast.id === action.payload);
      
      // If found, also remove from message tracker
      if (toastToRemove) {
        delete state.messageTracker[toastToRemove.messageKey];
      }
      
      // Remove from toasts array
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
    clearToasts: (state) => {
      state.toasts = [];
      state.messageTracker = {};
    },
    // Clean up old entries in the message tracker (call periodically)
    cleanupTracker: (state) => {
      const now = Date.now();
      const keys = Object.keys(state.messageTracker);
      
      // Remove tracker entries older than 5 seconds
      keys.forEach(key => {
        if (now - state.messageTracker[key] > 5000) {
          delete state.messageTracker[key];
        }
      });
    }
  }
});

export const { addToast, removeToast, clearToasts, cleanupTracker } = toastSlice.actions;

// Selector
export const selectToasts = state => state.toast.toasts;

// Action creators
export const showToast = (message, type = 'info', duration = 3000) => 
  addToast({ message, type, duration });

export const showSuccessToast = (message, duration = 3000) => 
  showToast(message, 'success', duration);

export const showErrorToast = (message, duration = 3000) => 
  showToast(message, 'error', duration);

export const showInfoToast = (message, duration = 3000) => 
  showToast(message, 'info', duration);

export const showWarningToast = (message, duration = 3000) => 
  showToast(message, 'warning', duration);

export default toastSlice.reducer;