import { useState } from 'react';
import './Login.css';

export default function Login() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setError(null);
    window.location.href = `${process.env.API_URL}/api/auth/login`;
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-twitter-blue" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
        </div>
        <h1>Welcome to Trend Avatar</h1>
        <p>Connect your X account to get started</p>
        {error && <div className="error-message">{error}</div>}
        <button 
          onClick={handleLogin} 
          className="login-button"
          disabled={loading}
        >
          {loading ? (
            <span className="loader"></span>
          ) : (
            'Connect with X'
          )}
        </button>
      </div>
    </div>
  );
} 