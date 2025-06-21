// Make sure dotenv is loaded first
require('dotenv').config();

// For debugging
console.log('Environment variables loaded. API key exists:', !!process.env.ANTHROPIC_API_KEY);

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const Poll = require('./models/poll');
const { enhanceQuestion } = require('./services/questionEnhancer');
const { analyzePollResults } = require('./services/resultsAnalyzer');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);

// Configure CORS for Express
app.use(cors({
  origin: ['https://polling-system-1-d56x.onrender.com', 'http://localhost:5173'],
  methods: ['GET', 'POST'],
  credentials: true
}));

// Add body parser middleware
app.use(bodyParser.json());

// Configure Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: ['https://polling-system-1-d56x.onrender.com', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Store state
const state = {
  activePoll: null,
  connectedStudents: new Map(), // socketId -> name
  studentAnswers: new Map(), // studentName -> answer
  timerInterval: null, // Add this to track the timer interval
};

// Track connected students and their socket IDs
const connectedUsers = new Map(); // socketId -> username

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // If this is a teacher connecting (no registration needed)
  socket.on('i_am_teacher', () => {
    // Set a flag on the socket to identify it as a teacher
    socket.data = { isTeacher: true };
    
    // Send current participants list to the teacher
    const participants = [...connectedUsers.values()];
    console.log('Sending participants update:', participants);
    socket.emit('update_participants', participants);
  });

  // Teacher creates a new poll
  socket.on('create_poll', (pollData) => {
    if (state.activePoll && state.studentAnswers.size > 0 && 
        state.studentAnswers.size < state.connectedStudents.size) {
      // If there's an active poll with some but not all answers, don't allow creating a new one
      socket.emit('poll_error', { message: 'Cannot create a new poll while students are answering' });
      return;
    }
    
    // Reset answers for new poll
    state.studentAnswers.clear();
    
    // Clear any existing timer
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
    
    // Create new poll with the timeLimit from the client (default to 60 if not provided)
    const timeLimit = pollData.timeLimit || 60;
    state.activePoll = new Poll(
      pollData.question,
      pollData.options,
      timeLimit,
      pollData.correctAnswer
    );
    
    // Broadcast the new poll to all connected clients
    io.emit('new_poll', {
      id: state.activePoll.id,
      question: state.activePoll.question,
      options: state.activePoll.options,
      timeLimit: timeLimit
    });
    
    console.log('New poll created:', state.activePoll);

    // Start with the full time limit
    let timeRemaining = timeLimit;
    
    // Broadcast the initial time
    io.emit('timer_update', { timeRemaining });
    
    // Create a server-side interval to broadcast the timer updates every second
    state.timerInterval = setInterval(() => {
      timeRemaining -= 1;
      
      // Broadcast the updated time to all clients
      io.emit('timer_update', { timeRemaining });
      
      // When time is up, complete the poll
      if (timeRemaining <= 0) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
        
        // Only complete the poll if it hasn't been completed already
        if (state.activePoll) {
          const results = state.activePoll.getResults();
          results.totalStudents = state.connectedStudents.size;
          io.emit('poll_results', results);
          
          state.activePoll = null;
          io.emit('poll_completed');
          console.log('Poll timeout reached, poll completed automatically by server');
        }
      }
    }, 1000);
  });

  // Student registers with a name
  socket.on('register_student', (name) => {
    // Check if name is already in use by another student
    let nameInUse = false;
    state.connectedStudents.forEach((studentName) => {
      if (studentName === name) nameInUse = true;
    });
    
    if (nameInUse) {
      socket.emit('registration_error', { message: 'Name already in use' });
      return;
    }
    
    state.connectedStudents.set(socket.id, name);
    socket.emit('registration_success', { name });
    
    // Add to connected users
    connectedUsers.set(socket.id, name);
    
    // Update all clients with new participant list
    const participants = [...connectedUsers.values()];
    console.log('Sending participants update:', participants);
    io.emit('update_participants', participants);
    
    // If there's an active poll, send waiting message instead of the poll
    if (state.activePoll) {
      socket.emit('wait_for_next_poll', {
        message: 'A poll is currently in progress. Please wait for the next poll.'
      });
    }
    
    console.log(`Student registered: ${name}`);
  });

  // Student submits an answer
  socket.on('submit_answer', (answer) => {
    if (!state.activePoll) {
      socket.emit('answer_error', { message: 'No active poll to answer' });
      return;
    }
    
    const studentName = state.connectedStudents.get(socket.id);
    if (!studentName) {
      socket.emit('answer_error', { message: 'You need to register first' });
      return;
    }
    
    // Record student's answer
    state.studentAnswers.set(studentName, answer);
    state.activePoll.recordAnswer(studentName, answer);
    
    // Emit to this student that their answer was recorded
    socket.emit('answer_recorded', { success: true });
    
    // Check if all connected students have answered
    const allStudentsAnswered = [...state.connectedStudents.values()].every(
      name => state.studentAnswers.has(name)
    );
    
    // Update results for all clients
    const results = state.activePoll.getResults();
    results.totalStudents = state.connectedStudents.size;
    io.emit('poll_results', results);
    
    // If all students have answered, mark poll as completed
    if (allStudentsAnswered) {
      state.activePoll = null;
      console.log('All students have answered, poll completed');
      io.emit('poll_completed');
    }
  });

  // Check if poll time limit is reached
  socket.on('check_poll_timeout', () => {
    if (state.activePoll && state.activePoll.isExpired()) {
      // Time limit reached, complete the poll
      const results = state.activePoll.getResults();
      results.totalStudents = state.connectedStudents.size;
      io.emit('poll_results', results);
      
      state.activePoll = null;
      io.emit('poll_completed');
      console.log('Poll timeout reached, poll completed');
    }
  });

  // Teacher requests current results
  socket.on('get_results', () => {
    if (state.activePoll) {
      const results = state.activePoll.getResults();
      results.totalStudents = state.connectedStudents.size;
      socket.emit('poll_results', results);
    }
  });

  // Teacher kicks a student
  socket.on('kick_student', (studentName) => {
    // Find the socket ID for this student
    let socketId = null;
    state.connectedStudents.forEach((name, id) => {
      if (name === studentName) {
        socketId = id;
      }
    });
    
    if (socketId) {
      // Notify the student they've been kicked
      io.to(socketId).emit('kicked_out');
      
      // Remove them from connected students
      state.connectedStudents.delete(socketId);
      
      // Remove from connected users Map
      connectedUsers.delete(socketId);
      
      // Update all clients with new participant list
      const participants = [...connectedUsers.values()];
      console.log('Sending participants update:', participants);
      io.emit('update_participants', participants);
      
      // If they had submitted an answer, remove it
      if (state.studentAnswers.has(studentName)) {
        state.studentAnswers.delete(studentName);
        
        // If there's an active poll, update the results
        if (state.activePoll) {
          const results = state.activePoll.getResults();
          results.totalStudents = state.connectedStudents.size;
          io.emit('poll_results', results);
        }
      }
      
      console.log(`Student kicked: ${studentName}`);
    }
  });

  // Handle chat messages
  const recentMessages = [];

  socket.on('send_message', async (message) => {
    console.log('Chat message received:', message);
    
    // Store recent messages for analysis
    recentMessages.push(message);
    if (recentMessages.length > 10) recentMessages.shift();
    
    console.log(`Messages collected: ${recentMessages.length}, Active poll: ${!!state.activePoll}, User: ${message.user}`);
    
    // Only analyze non-teacher messages when we have enough messages and there's an active poll
    if (recentMessages.length >= 3 && message.user !== 'Teacher' && state.activePoll) {
      try {
        console.log('Analyzing student messages for confusion...');
        const { analyzeStudentMessages } = require('./services/studentAnalytics');
        const analysis = await analyzeStudentMessages(
          recentMessages, 
          state.activePoll.question
        );
        
        console.log('Analysis result:', analysis);
        
        if (analysis && analysis.confusionDetected && analysis.confidenceScore > 0.7) {
          console.log('Confusion detected! Finding teacher socket...');
          
          // Get all sockets and find the teacher
          let teacherSocket = null;
          for (const [id, s] of io.sockets.sockets.entries()) {
            if (state.connectedStudents.get(id) === undefined || s.data?.isTeacher) {
              console.log('Found teacher socket!');
              teacherSocket = s;
              break;
            }
          }
          
          if (teacherSocket) {
            console.log('Sending confusion alert to teacher');
            
            // Use the AI-identified confused student if available, otherwise use the most recent message sender
            const confusedStudent = analysis.confusedStudent || message.user;
            
            teacherSocket.emit('student_confusion_alert', {
              studentName: confusedStudent,
              issue: analysis.specificIssue,
              recommendation: analysis.recommendedAction
            });
          } else {
            console.log('No teacher socket found to send alert to');
          }
        } else {
          console.log('No confusion detected or confidence too low');
        }
      } catch (error) {
        console.error('Error analyzing student messages:', error);
      }
    } else {
      console.log('Skipping analysis: not enough messages, from teacher, or no active poll');
    }
    
    // Broadcast message to all clients
    io.emit('chat_message', message);
  });

  // Request for participants list
  socket.on('request_participants', () => {
    const participants = [...connectedUsers.values()];
    console.log('Sending participants update:', participants);
    socket.emit('update_participants', participants);
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    const studentName = state.connectedStudents.get(socket.id);
    if (studentName) {
      console.log(`Student disconnected: ${studentName}`);
      state.connectedStudents.delete(socket.id);
      
      // If the student had submitted an answer, remove it
      if (state.studentAnswers.has(studentName)) {
        state.studentAnswers.delete(studentName);
        
        // If there's an active poll, update the results
        if (state.activePoll) {
          const results = state.activePoll.getResults();
          results.totalStudents = state.connectedStudents.size;
          io.emit('poll_results', results);
        }
      }

      // Remove from connected users
      if (connectedUsers.has(socket.id)) {
        connectedUsers.delete(socket.id);
        
        // Update all clients with new participant list
        const participants = [...connectedUsers.values()];
        console.log('Sending participants update:', participants);
        io.emit('update_participants', participants);
      }
    } else {
      console.log(`User disconnected: ${socket.id}`);
    }

    // If this was the last client and there's an active timer, clean up
    if (connectedUsers.size === 0 && state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
      state.activePoll = null;
    }
  });
});

// Endpoint for enhancing questions with AI
app.post('/api/enhance-question', async (req, res) => {
  try {
    const { question, options } = req.body;
    
    if (!question || !options || !Array.isArray(options)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid request. Question and options array required.' 
      });
    }
    
    const result = await enhanceQuestion(question, options);
    
    if (result) {
      return res.json({ 
        success: true, 
        enhancedQuestion: result.enhancedQuestion,
        enhancedOptions: result.enhancedOptions,
        suggestedCorrectAnswer: result.suggestedCorrectAnswer
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to enhance question' 
      });
    }
  } catch (error) {
    console.error('Error in enhance-question endpoint:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error while enhancing question' 
    });
  }
});

// Endpoint for analyzing poll results with AI
app.post('/api/analyze-results', async (req, res) => {
  try {
    const { pollData, results } = req.body;
    
    if (!pollData || !results) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid request. Poll data and results required.' 
      });
    }
    
    const analysis = await analyzePollResults(pollData, results);
    
    if (analysis) {
      return res.json({ 
        success: true, 
        analysis 
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to analyze results' 
      });
    }
  } catch (error) {
    console.error('Error in analyze-results endpoint:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error while analyzing results' 
    });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});