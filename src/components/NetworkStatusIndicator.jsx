import React, { useState, useEffect } from 'react';
import useNetworkStatus from '../utils/useNetworkStatus';
import './NetworkStatusIndicator.css';

const NetworkStatusIndicator = () => {
  const { isOnline, checkConnectivity } = useNetworkStatus();
  const [showBanner, setShowBanner] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Show banner when going offline
  useEffect(() => {
    if (!isOnline) {
      setShowBanner(true);
    } else {
      // Hide banner after a delay when coming back online
      const timer = setTimeout(() => {
        setShowBanner(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  const handleRetry = async () => {
    setIsChecking(true);
    await checkConnectivity();
    setIsChecking(false);
  };

  if (!showBanner) return null;

  return (
    <div className={`network-status-banner ${isOnline ? 'online' : 'offline'}`}>
      <div className="network-status-content">
        <div className="network-status-icon">
          {isOnline ? (
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M24 8.98C20.93 5.9 16.69 4 12 4S3.07 5.9 0 8.98L12 21 24 8.98zM2.92 9.07C5.51 7.08 8.67 6 12 6s6.49 1.08 9.08 3.07l-9.08 9.08-9.08-9.08z" />
            </svg>
          )}
        </div>
        <div className="network-status-message">
          {isOnline ? (
            <span>You are back online</span>
          ) : (
            <span>You are currently offline</span>
          )}
        </div>
        {!isOnline && (
          <button 
            className="network-status-retry" 
            onClick={handleRetry}
            disabled={isChecking}
          >
            {isChecking ? 'Checking...' : 'Retry'}
          </button>
        )}
      </div>
    </div>
  );
};

export default NetworkStatusIndicator; 