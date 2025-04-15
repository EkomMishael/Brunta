import { useState, useEffect } from 'react';
import { isOffline, addNetworkListeners } from './networkUtils';

/**
 * Custom hook to track network status
 * @returns {Object} Object containing isOnline status and a function to check connectivity
 */
const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(!isOffline());

  useEffect(() => {
    // Set up network status listeners
    const networkListeners = addNetworkListeners(
      () => setIsOnline(true),
      () => setIsOnline(false)
    );

    // Clean up listeners on unmount
    return () => {
      networkListeners.remove();
    };
  }, []);

  /**
   * Manually check network connectivity
   * @returns {Promise<boolean>} Promise that resolves with the current online status
   */
  const checkConnectivity = () => {
    return new Promise((resolve) => {
      // Try to fetch a small resource to check connectivity
      fetch('https://www.google.com/favicon.ico', { 
        mode: 'no-cors',
        cache: 'no-cache'
      })
        .then(() => {
          setIsOnline(true);
          resolve(true);
        })
        .catch(() => {
          setIsOnline(false);
          resolve(false);
        });
    });
  };

  return { isOnline, checkConnectivity };
};

export default useNetworkStatus; 