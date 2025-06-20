// frontend/src/components/ThemeProvider.jsx
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectTheme } from '../features/themeSlice';

function ThemeProvider({ children }) {
  const theme = useSelector(selectTheme);
  
  useEffect(() => {
    // Add or remove dark class on body based on theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  return (
    <div className="bg-white dark:bg-dark-bg text-black dark:text-white">
      {children}
    </div>
  );
}

export default ThemeProvider;