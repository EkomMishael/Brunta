/**
 * Network utility functions for handling offline detection and network errors
 */

/**
 * Check if the application is currently offline
 * @returns {boolean} True if offline, false if online
 */
export const isOffline = () => {
  return !navigator.onLine;
};

/**
 * Add event listeners for online/offline status changes
 * @param {Function} onlineCallback - Function to call when coming online
 * @param {Function} offlineCallback - Function to call when going offline
 * @returns {Object} Object with remove method to clean up listeners
 */
export const addNetworkListeners = (onlineCallback, offlineCallback) => {
  const handleOnline = () => {
    if (typeof onlineCallback === 'function') {
      onlineCallback();
    }
  };

  const handleOffline = () => {
    if (typeof offlineCallback === 'function') {
      offlineCallback();
    }
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Return cleanup function
  return {
    remove: () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    }
  };
};

/**
 * Wrapper for fetch that handles offline detection
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise} Promise that resolves with the fetch response or rejects with an error
 */
export const fetchWithOfflineDetection = async (url, options = {}) => {
  if (isOffline()) {
    return Promise.reject(new Error('You are currently offline. Please check your internet connection.'));
  }

  try {
    const response = await fetch(url, options);
    
    // Check if the response is ok (status in the range 200-299)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    // Check if the error is due to being offline
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Network error. Please check your internet connection.');
    }
    
    // Re-throw other errors
    throw error;
  }
};

/**
 * Create a custom error for network-related issues
 * @param {string} message - Error message
 * @returns {Error} Custom error object
 */
export const createNetworkError = (message) => {
  const error = new Error(message);
  error.name = 'NetworkError';
  error.isNetworkError = true;
  return error;
};

/**
 * Check if an error is a network-related error
 * @param {Error} error - The error to check
 * @returns {boolean} True if it's a network error, false otherwise
 */
export const isNetworkError = (error) => {
  return (
    error.name === 'NetworkError' || 
    error.isNetworkError === true ||
    error.message.includes('network') ||
    error.message.includes('fetch') ||
    error.message.includes('offline')
  );
}; 