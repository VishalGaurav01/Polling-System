import { 
  pollCreated, 
  pollReceived, 
  pollCompleted, 
  pollResultsReceived,
  answerRecorded,
  studentRegistered,
  kickedOut,
  setError,
  setParticipants,
  messageReceived,
  waitForNextPoll,
  updateTimer, // Add this import
} from '../features/pollSlice';
import { 
  showSuccessToast, 
  showErrorToast, 
  showInfoToast 
} from '../features/toastSlice';

// Track server events to prevent duplicate toasts
const eventTracker = {
  answerRecorded: false,
  registered: false
};

// Socket.io middleware for Redux
const socketMiddleware = socket => store => next => action => {
  const { dispatch } = store;
  
  // Listen for socket events once when middleware is set up
  if (action.type === 'socket/init') {
    // Poll events
    socket.on('new_poll', (pollData) => {
      dispatch(pollReceived(pollData));
      dispatch(showInfoToast('New poll is available!'));
    });
    
    socket.on('poll_completed', () => {
      dispatch(pollCompleted());
      dispatch(showInfoToast('Poll has been completed'));
    });
    
    socket.on('poll_results', (resultsData) => {
      dispatch(pollResultsReceived(resultsData));
    });
    
    // Add this event listener for timer updates
    socket.on('timer_update', (data) => {
      dispatch(updateTimer(data.timeRemaining));
    });
    
    socket.on('student_confusion_alert', (data) => {
      dispatch({
        type: 'confusion/alertReceived',
        payload: data
      });
      
      // Include student name in the toast
      const studentName = data.studentName || 'A student';
      dispatch(showInfoToast(`${studentName} appears to be confused`));
    });
    
    // Student events
    socket.on('registration_success', (data) => {
      dispatch(studentRegistered(data.name));
      
      // Prevent duplicate welcome messages
      if (!eventTracker.registered) {
        dispatch(showSuccessToast(`Welcome, ${data.name}!`));
        eventTracker.registered = true;
        
        // Reset after some time
        setTimeout(() => {
          eventTracker.registered = false;
        }, 3000);
      }
    });
    
    socket.on('answer_recorded', () => {
      dispatch(answerRecorded());
      
      // Prevent duplicate answer recorded messages
      if (!eventTracker.answerRecorded) {
        dispatch(showSuccessToast('Your answer has been recorded'));
        eventTracker.answerRecorded = true;
        
        // Reset after some time
        setTimeout(() => {
          eventTracker.answerRecorded = false;
        }, 3000);
      }
    });
    
    // Error events
    socket.on('poll_error', (data) => {
      dispatch(setError(data.message));
      dispatch(showErrorToast(data.message));
    });
    
    socket.on('registration_error', (data) => {
      dispatch(setError(data.message));
      dispatch(showErrorToast(data.message));
    });

    socket.on('kicked_out', () => {
      dispatch(kickedOut());
      dispatch(showErrorToast('You have been kicked out by the teacher'));
    });
    
    socket.on('answer_error', (data) => {
      dispatch(setError(data.message));
      dispatch(showErrorToast(data.message));
    });

    socket.on('update_participants', (participants) => {
      dispatch(setParticipants(participants));
    });

    socket.on('chat_message', (message) => {
      dispatch(messageReceived(message));
      
      // Get current user
      const currentUser = store.getState().poll.studentName || 'Teacher';
      
      // Only show toast notifications for messages from the Teacher to students
      if (message.user === 'Teacher' && currentUser !== 'Teacher') {
        // Special case: if this user is a student and the message is from the teacher
        dispatch(showInfoToast(`New message from Teacher`));
      }
      // No toast notifications for messages from students
    });

    socket.on('wait_for_next_poll', (data) => {
      dispatch(waitForNextPoll(data));
      dispatch(showInfoToast(data.message));
    });
    
    // Request the current participants list when initializing
    socket.emit('request_participants');
    
    return next(action);
  }
  
  // Handle outgoing socket events
  if (action.type === 'socket/createPoll') {
    socket.emit('create_poll', action.payload);
    dispatch(pollCreated());
    dispatch(showSuccessToast('New poll has been created'));
    return next(action);
  }
  
  if (action.type === 'socket/registerStudent') {
    socket.emit('register_student', action.payload);
    return next(action);
  }
  
  if (action.type === 'socket/submitAnswer') {
    socket.emit('submit_answer', action.payload);
    // Don't show toast here, wait for server confirmation
    return next(action);
  }
  
  if (action.type === 'socket/getResults') {
    socket.emit('get_results');
    return next(action);
  }
  
  if (action.type === 'socket/checkTimeout') {
    socket.emit('check_poll_timeout');
    return next(action);
  }
  
  if (action.type === 'socket/kickStudent') {
    socket.emit('kick_student', action.payload);
    // Toast is shown in the Teacher component instead
    return next(action);
  }

  if (action.type === 'socket/sendMessage') {
    socket.emit('send_message', action.payload);
    return next(action);
  }

  if (action.type === 'socket/requestParticipants') {
    socket.emit('request_participants');
    return next(action);
  }

  if (action.type === 'socket/identifyAsTeacher') {
    socket.emit('i_am_teacher');
    return next(action);
  }
  
  return next(action);
};

export default socketMiddleware;