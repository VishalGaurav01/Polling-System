// frontend/src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ThemeProvider from './components/ThemeProvider';
import ToastContainer from './components/ToastContainer';
import LandingPage from './components/LandingPage';
import Teacher from './components/Teacher';
import Student from './components/Student';
import StudentLogin from './components/StudentLogin';
import PollHistory from './components/PollHistory';
import KickedOut from './components/KickedOut';
import ThemeToggle from './components/ThemeToggle';

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text transition-colors duration-200">
        {/* Theme toggle button - fixed position */}
        <div className="fixed top-4 right-4 z-40">
          <ThemeToggle />
        </div>
        
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/teacher" element={<Teacher />} />
          <Route path="/poll-history" element={<PollHistory />} />
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/student" element={<Student />} />
          <Route path="/kicked-out" element={<KickedOut />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        {/* Toast container */}
        <ToastContainer />
      </div>
    </ThemeProvider>
  );
}

export default App;