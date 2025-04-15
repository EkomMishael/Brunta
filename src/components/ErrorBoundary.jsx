import React, { Component } from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null,
      isOffline: false
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Check if the error is related to network connectivity
    if (!navigator.onLine || error.message.includes('network') || error.message.includes('fetch')) {
      this.setState({ isOffline: true });
    }
  }

  componentDidMount() {
    // Add event listeners for online/offline status
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  componentWillUnmount() {
    // Remove event listeners
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }

  handleOnline = () => {
    this.setState({ isOffline: false });
  }

  handleOffline = () => {
    this.setState({ isOffline: true });
  }

  handleRetry = () => {
    // Reset the error state and try to reload the component
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      // Render custom error UI
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <h1 className="error-title">
              {this.state.isOffline ? 'You are offline' : 'Something went wrong'}
            </h1>
            
            {this.state.isOffline ? (
              <div className="offline-message">
                <p>It seems you've lost your internet connection.</p>
                <p>Please check your connection and try again.</p>
                <button className="retry-button" onClick={this.handleRetry}>
                  Retry
                </button>
              </div>
            ) : (
              <div className="error-message">
                <p>We apologize for the inconvenience. An unexpected error has occurred.</p>
                <p>Our team has been notified and is working to fix the issue.</p>
                <button className="retry-button" onClick={this.handleRetry}>
                  Try Again
                </button>
              </div>
            )}
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="error-details">
                <h3>Error Details (Development Only):</h3>
                <pre>{this.state.error.toString()}</pre>
                {this.state.errorInfo && (
                  <pre>{this.state.errorInfo.componentStack}</pre>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    // If there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary; 