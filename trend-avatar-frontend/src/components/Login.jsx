import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if we have a code in the URL (after OAuth redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      handleCallback(code);
    }
  }, [navigate]);

  const handleCallback = async (code) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data || !data.success) {
        throw new Error(data?.error || 'Authentication failed');
      }

      // Store the token
      localStorage.setItem('token', data.token);
      // Redirect to home
      navigate('/');
    } catch (error) {
      console.error('Error during authentication:', error);
      setError(error.message || 'Failed to authenticate with X');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    setLoading(true);
    setError(null);
    // Redirect to the backend's auth endpoint
    window.location.href = '/api/auth/login';
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo">
          <img src="/logo.png" alt="Trend Avatar Logo" />
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