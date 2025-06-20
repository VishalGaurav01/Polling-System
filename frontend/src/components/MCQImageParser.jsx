// frontend/src/components/MCQImageParser.jsx
import React, { useState, useRef } from 'react';
import { createWorker } from 'tesseract.js';
import { useToast } from '../hooks/useToast';

function MCQImageParser({ onQuestionParsed }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef(null);
  const workerRef = useRef(null);
  const toast = useToast();
  
  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setSelectedFileName('');
    setPreviewUrl('');
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFileName(file.name);
      
      // Create a preview URL for image
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
      
      // Process the image
      parseImage(file);
    }
  };

  const triggerFileInput = () => {
    if (!isProcessing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const parseImage = async (file) => {
    setIsProcessing(true);
    setProgress(0);
    
    try {
      console.log('Starting OCR process...');
      
      // Create a URL for the image
      const imageUrl = URL.createObjectURL(file);
      
      // Try to enhance image for better OCR results
      let enhancedImageUrl;
      try {
        enhancedImageUrl = await enhanceImageForOCR(imageUrl);
      } catch (err) {
        console.warn('Image enhancement failed, using original:', err);
        enhancedImageUrl = imageUrl;
      }
      
      // Initialize the worker with proper configuration
      if (!workerRef.current) {
        workerRef.current = await createWorker({
          logger: m => {
            console.log(m);
            if (m.status === 'recognizing text') {
              setProgress(parseInt(m.progress * 100));
            }
          },
          errorHandler: err => console.error('Tesseract Error:', err)
        });
      }
      
      // Recognize text from the image with improved settings
      await workerRef.current.load();
      await workerRef.current.loadLanguage('eng');
      await workerRef.current.initialize('eng');
      await workerRef.current.setParameters({
        tessedit_char_whitelist: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,?!()[]{}:;-_\'"`~@#$%^&*+=<>/\\| ',
        preserve_interword_spaces: '1',
      });
      
      const { data } = await workerRef.current.recognize(enhancedImageUrl);
      console.log('OCR result:', data);
      
      // Parse the text to extract question and options
      if (data && data.text) {
        const parsedData = parseMultipleChoiceQuestion(data.text);
        if (parsedData) {
          onQuestionParsed(parsedData);
          // Success toast is handled by the parent component
        } else {
          console.error('Failed to parse question and options');
          toast.error('Could not identify a clear question and options in the image');
          resetFileInput();
        }
      } else {
        console.error('No text detected in image');
        toast.error('No text was detected in the image');
        resetFileInput();
      }
      
      // Clean up
      URL.revokeObjectURL(imageUrl);
      
    } catch (error) {
      console.error('Image processing error:', error);
      toast.error(`Error processing image: ${error.message}`);
      resetFileInput();
    } finally {
      setIsProcessing(false);
    }
  };
  const parseMultipleChoiceQuestion = (text) => {
    console.log('Raw OCR text:', text);
    
    // Split the text by lines and remove empty lines
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length < 2) {
      console.log('Not enough content to parse MCQ');
      return null;
    }
    
    // Check for answer key pattern and remove it
    const answerKeyLines = lines.filter(line => 
      line.includes('**Answer:**') || 
      line.includes('*Answer:*') || 
      line.match(/\*\*Answer:\*\*/) ||
      line.match(/Answer:/i)
    );
    
    // If we found an answer key, remove those lines
    let cleanedLines = lines;
    if (answerKeyLines.length > 0) {
      cleanedLines = lines.filter(line => !answerKeyLines.includes(line));
    }
    
    // Check for numbered question pattern (e.g., "1. Which tool...")
    const numberedQuestionMatch = cleanedLines[0].match(/^\s*\d+\.\s+(.*)/);
    let startIndex = 0;
    let questionText = '';
    
    if (numberedQuestionMatch) {
      // This is a numbered question, extract the question text
      questionText = numberedQuestionMatch[1];
      startIndex = 1; // Skip the question line when looking for options
    } else {
      // Use existing logic for identifying question
      // Check for "Question X" header pattern
      if (cleanedLines[0].match(/^Question\s+\d+/i)) {
        startIndex = 1; // Skip the header line
      }
      
      // Check for "Select one:" or similar instructions
      let selectOneIndex = -1;
      for (let i = 0; i < cleanedLines.length; i++) {
        if (cleanedLines[i].match(/^Select\s+one[:\.]?$/i) || 
            cleanedLines[i].match(/^Choose\s+one[:\.]?$/i)) {
          selectOneIndex = i;
          break;
        }
      }
      
      // If we found "Select one:" text, everything before it is the question
      if (selectOneIndex !== -1) {
        // Join all lines before "Select one:" as the question
        questionText = cleanedLines.slice(startIndex, selectOneIndex).join(' ').trim();
        startIndex = selectOneIndex + 1; // Start options after "Select one:"
      } else if (!questionText) {
        // If question is still not set, use the first non-option line
        for (let i = startIndex; i < cleanedLines.length; i++) {
          const line = cleanedLines[i].trim();
          if (!isOptionLine(line) && !isLetterOptionLine(line)) {
            questionText = line;
            startIndex = i + 1;
            break;
          }
        }
        
        // If still no question found, use the first line
        if (!questionText) {
          questionText = cleanedLines[startIndex];
          startIndex = startIndex + 1;
        }
      }
    }
    
    // Now extract options based on patterns
    let options = [];
    
    // First look for lettered options like a), b), c), d)
    for (let i = startIndex; i < cleanedLines.length; i++) {
      const line = cleanedLines[i].trim();
      
      // Match a), b), c), d) pattern specifically for this case
      const letterOptionMatch = line.match(/^([a-d])\)\s+(.*)/i);
      if (letterOptionMatch) {
        options.push(letterOptionMatch[2]);
        continue;
      }
      
      // Also check for other option formats
      if (isOptionLine(line) || isLetterOptionLine(line)) {
        options.push(cleanOptionText(line));
      }
    }
    
    // If we didn't find enough options, try a different approach
    if (options.length < 2) {
      options = [];
      
      // Look for any line that might be an option
      for (let i = startIndex; i < cleanedLines.length; i++) {
        const line = cleanedLines[i].trim();
        
        // Skip empty lines or lines with answer key
        if (!line || line.includes('Answer:')) continue;
        
        // Examine if it looks like an option in any format
        if (isAnyOptionFormat(line)) {
          options.push(cleanOptionText(line));
        }
      }
    }
    
    // Fallback: if still not enough options, try to take all remaining lines
    if (options.length < 2) {
      options = cleanedLines.slice(startIndex)
        .filter(line => line.trim() && !line.includes('Answer:'))
        .map(cleanOptionText);
    }
    
    // Clean up options
    options = options
      .filter(Boolean)
      .filter(option => option !== questionText)
      .filter(option => !option.match(/^Select\s+one[:\.]?$/i))
      .filter(option => !option.toLowerCase().includes('answer:'))
      .filter((value, index, self) => self.indexOf(value) === index);
    
    // Clean up options further - remove special characters that might be artifacts
    options = options.map(option => {
      return option
        .replace(/^[()[\]{}@\\/|]+\s*/, '')
        .replace(/\s*[()[\]{}@\\/|]+$/, '')
        .trim();
    });
    
    // Require at least 2 options and a question to consider it a valid MCQ
    if (options.length < 2 || !questionText) {
      console.log('Invalid MCQ. Options found:', options, 'Question:', questionText);
      return null;
    }
    
    return { question: questionText, options };
  };
  
  // Add helper function to check for lettered options a), b), c), d)
  const isLetterOptionLine = (line) => {
    return /^[a-d]\)\s+/i.test(line);
  };
  
  // Add a more general option format detector
  const isAnyOptionFormat = (line) => {
    return isOptionLine(line) || 
           isLetterOptionLine(line) ||
           /^[A-D][\.\s]/i.test(line) ||
           /^[a-d][\.\s]/i.test(line) ||
           /^\([A-D]\)/i.test(line) ||
           /^\([a-d]\)/i.test(line) ||
           /^\s*[⚪⭕○⚫🔘]\s+/i.test(line) ||
           /^[-•*⋅]\s+/i.test(line) ||
           /^\d+\.\s+/i.test(line);
  };
  
  const isOptionLine = (line) => {
    // Enhanced pattern matching for MCQ options, including radio buttons
    return /^[A-D][\.\)\s]/i.test(line) ||  // A. B. C. D. format
           /^\([A-D]\)/i.test(line) ||      // (A) (B) (C) (D) format
           /^[A-D]$/i.test(line) ||         // Just A B C D on a line
           /^\s*[A-D]\s+/i.test(line) ||    // A with spacing then text
           /^[-•*⋅]\s+/i.test(line) ||      // Bullet points
           /^\d+[.)\s]/i.test(line) ||      // Numbered options
           /^\s*[⚪⭕○]\s+/i.test(line) ||   // Empty radio button
           /^\s*[⚫🔘]\s+/i.test(line);      // Filled radio button
  };
  
  const extractOptionText = (line) => {
    // Remove option markers including circled letters
    return line
      .replace(/^\s*[\(\[\{]?\s*[A-D]\s*[\)\]\}]?\s+/i, '') // Remove (A), [B], {C}, etc.
      .replace(/^[A-D][\.\)\s]+/i, '')   // Remove A. B. C. D.
      .replace(/^\([A-D]\)\s*/i, '')     // Remove (A) (B) (C) (D)
      .replace(/^[a-d][\.\)\s]+/i, '')   // Remove a. b. c. d.
      .replace(/^[-•*⋅]\s+/i, '')        // Remove bullets
      .replace(/^\d+[.)\s]+/i, '')       // Remove numbers
      .replace(/^[A-D]$/i, '')           // Remove standalone A B C D
      .trim();
  };
  
  // New helper function to clean option text more thoroughly
  const cleanOptionText = (line) => {
    let text = line;
    
    // Handle a), b), c), d) format specifically
    const letterOptionMatch = text.match(/^([a-d])\)\s+(.*)/i);
    if (letterOptionMatch) {
      return letterOptionMatch[2].trim();
    }
    
    // Remove radio button symbols and their variations
    text = text.replace(/^\s*[⚪⭕○⚫🔘]\s+/i, '');
    
    // Remove common OCR artifacts at the beginning
    text = text.replace(/^[@()[\]{}\\\/|]+\s*/i, '');
    
    // Remove option identifiers
    text = extractOptionText(text);
    
    // Remove any remaining circular markers that might be in the middle
    text = text.replace(/\s*[\(\[\{]?\s*[A-D]\s*[\)\]\}]?\s+/i, ' ');
    
    return text.trim();
  };
  
  const enhanceImageForOCR = (imageUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Create a canvas element
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas dimensions to match the image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw the image onto the canvas
        ctx.drawImage(img, 0, 0);
        
        // Apply some processing to improve OCR quality
        try {
          // Get image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          // Simple contrast enhancement
          for (let i = 0; i < data.length; i += 4) {
            // Convert to grayscale for better OCR
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            
            // Increase contrast
            const threshold = 128;
            const newValue = avg > threshold ? 255 : 0;
            
            data[i] = newValue;     // R
            data[i + 1] = newValue; // G
            data[i + 2] = newValue; // B
          }
          
          // Put the modified image data back
          ctx.putImageData(imageData, 0, 0);
        } catch (e) {
          // If we can't process the image (e.g., CORS issues), just use the original
          console.warn('Could not process image:', e);
        }
        
        // Convert to data URL and resolve
        resolve(canvas.toDataURL('image/png'));
      };
      
      img.src = imageUrl;
    });
  };
  
  return (
    <div className="mb-6">
      <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
        Upload Question Image
      </label>
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={isProcessing}
      />
      
      {/* Custom upload box */}
      <div 
        onClick={triggerFileInput}
        className={`
          border-2 border-dashed rounded-lg p-6 
          ${isProcessing ? 'cursor-not-allowed bg-gray-100 dark:bg-gray-800' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800'} 
          border-gray-300 dark:border-gray-600 
          transition-all duration-200 ease-in-out
          flex flex-col items-center justify-center
          ${previewUrl ? 'h-64' : 'h-40'}
        `}
      >
        {previewUrl ? (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="max-h-full max-w-full object-contain rounded mb-2"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
              {selectedFileName}
            </p>
          </div>
        ) : (
          <>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-12 w-12 text-gray-400 mb-3" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
            <p className="text-base text-center text-gray-500 dark:text-gray-400">
              Click to upload an image
            </p>
            <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-1">
              Supports JPG, PNG, etc.
            </p>
          </>
        )}
      </div>
      
      {/* Processing indicator */}
      {isProcessing && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-indigo-600 h-2.5 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">
            Processing image... {progress}%
          </p>
        </div>
      )}
    </div>
  );
}

export default MCQImageParser;