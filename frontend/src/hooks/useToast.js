// frontend/src/hooks/useToast.js
import { useDispatch } from 'react-redux';
import { 
  showSuccessToast, 
  showErrorToast, 
  showInfoToast, 
  showWarningToast
} from '../features/toastSlice';

// Define the hook function
function useToastHook() {
  const dispatch = useDispatch();
  
  return {
    success: (message, duration) => dispatch(showSuccessToast(message, duration)),
    error: (message, duration) => dispatch(showErrorToast(message, duration)),
    info: (message, duration) => dispatch(showInfoToast(message, duration)),
    warning: (message, duration) => dispatch(showWarningToast(message, duration))
  };
}

// Export as both named and default
export const useToast = useToastHook;
export default useToastHook;