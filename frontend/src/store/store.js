import { configureStore } from '@reduxjs/toolkit';
import { io } from 'socket.io-client';
import pollReducer, { initSocket } from '../features/pollSlice';
import themeReducer from '../features/themeSlice';
import toastReducer from '../features/toastSlice';
import confusionReducer from '../features/confusionSlice';
import socketMiddleware from './socketMiddleware';

// Create socket instance
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const socket = io(BACKEND_URL);

// Create store with middleware
const store = configureStore({
  reducer: {
    poll: pollReducer,
    theme: themeReducer,
    toast: toastReducer,
    confusion: confusionReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(socketMiddleware(socket))
});

// Initialize socket connection
store.dispatch(initSocket());

export default store;