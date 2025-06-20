// frontend/src/features/pollSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Poll state
  activePoll: null,
  results: null,
  isPollCreating: false,
  pollHistory: [],
  
  // Student state
  studentName: null,
  selectedOption: null,
  hasAnswered: false,
  kicked: false,
  
  // UI state
  error: null,
  timeLeft: 60,
  waitingForNextPoll: false,

  // Chat state
  participants: [],
  chatMessages: []
};

const pollSlice = createSlice({
  name: 'poll',
  initialState,
  reducers: {
    // Poll actions
    pollCreated: (state) => {
      state.isPollCreating = false;
    },
    pollCreateStarted: (state) => {
      state.isPollCreating = true;
    },
    pollReceived: (state, action) => {
      state.activePoll = action.payload;
      state.selectedOption = null;
      state.hasAnswered = false;
      state.timeLeft = action.payload.timeLimit || 60;
      state.waitingForNextPoll = false;
    },
    pollCompleted: (state) => {
      if (state.results) {
        // Add to poll history when completed
        state.pollHistory.push({...state.results});
      }
      state.activePoll = null;
    },
    pollResultsReceived: (state, action) => {
      state.results = action.payload;
    },
    
    // Student actions
    studentRegistered: (state, action) => {
      state.studentName = action.payload;
      state.error = null;
      state.kicked = false;
    },
    optionSelected: (state, action) => {
      state.selectedOption = action.payload;
    },
    answerRecorded: (state) => {
      state.hasAnswered = true;
    },
    kickedOut: (state) => {
      state.studentName = null;
      state.activePoll = null;
      state.hasAnswered = false;
      state.kicked = true;
    },
    
    // Timer actions
    updateTimer: (state, action) => {
      state.timeLeft = action.payload;
    },
    decrementTimer: (state) => {
      if (state.timeLeft > 0) {
        state.timeLeft -= 1;
      }
    },
    resetTimer: (state) => {
      state.timeLeft = 60;
    },
    
    // Error handling
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    
    // Reset state
    resetState: (state) => {
      return {
        ...initialState,
        pollHistory: state.pollHistory, // Preserve poll history
        participants: state.participants // Preserve participants list
      };
    },

    // Participants
    setParticipants: (state, action) => {
      state.participants = action.payload;
    },
    
    // Chat
    messageReceived: (state, action) => {
      state.chatMessages.push(action.payload);
    },
    clearChat: (state) => {
      state.chatMessages = [];
    },

    waitForNextPoll: (state, action) => {
      state.waitingForNextPoll = true;
      state.error = action.payload.message;
    }
  }
});

export const {
  pollCreated,
  pollCreateStarted,
  pollReceived,
  pollCompleted,
  pollResultsReceived,
  studentRegistered,
  optionSelected,
  answerRecorded,
  kickedOut,
  updateTimer,
  decrementTimer,
  resetTimer,
  setError,
  clearError,
  resetState,
  setParticipants,
  messageReceived,
  clearChat,
  waitForNextPoll
} = pollSlice.actions;

// Action creators for socket events
export const createPoll = (pollData) => ({ 
  type: 'socket/createPoll',
  payload: pollData
});

export const registerStudent = (name) => ({
  type: 'socket/registerStudent',
  payload: name
});

export const submitAnswer = (answer) => ({
  type: 'socket/submitAnswer',
  payload: answer
});

export const getResults = () => ({
  type: 'socket/getResults'
});

export const checkTimeout = () => ({
  type: 'socket/checkTimeout'
});

export const kickStudent = (studentName) => ({
  type: 'socket/kickStudent',
  payload: studentName
});

export const initSocket = () => ({
  type: 'socket/init'
});

// Selectors
export const selectActivePoll = state => state.poll.activePoll;
export const selectResults = state => state.poll.results;
export const selectStudentName = state => state.poll.studentName;
export const selectSelectedOption = state => state.poll.selectedOption;
export const selectHasAnswered = state => state.poll.hasAnswered;
export const selectError = state => state.poll.error;
export const selectTimeLeft = state => state.poll.timeLeft;
export const selectIsPollCreating = state => state.poll.isPollCreating;
export const selectPollHistory = state => state.poll.pollHistory;
export const selectKicked = state => state.poll.kicked;
export const selectParticipants = state => state.poll.participants;
export const selectChatMessages = state => state.poll.chatMessages;
export const selectWaitingForNextPoll = state => state.poll.waitingForNextPoll;

export default pollSlice.reducer;