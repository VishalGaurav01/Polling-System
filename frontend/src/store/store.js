import { configureStore } from '@reduxjs/toolkit';
import { io } from 'socket.io-client';
import pollReducer, { initSocket } from '../features/pollSlice';
import themeReducer from '../features/themeSlice';
import toastReducer from '../features/toastSlice';
import socketMiddleware from './socketMiddleware';

// Create socket instance
const socket = io('http://localhost:3000');

// Create store with middleware
const store = configureStore({
  reducer: {
    poll: pollReducer,
    theme: themeReducer,
    toast: toastReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(socketMiddleware(socket))
});

// Initialize socket connection
store.dispatch(initSocket());

export default store;