# Deploying Your Front-End to Railway

I'll guide you through deploying your front-end application to Railway while ensuring the backend X (Twitter) API integration works correctly.

## Part 1: Convert Your App to React

Since you want to use Railway's front-end service which works well with React, we need to convert your application from EJS to React. Here's how to do it:

### Step 1: Create a React Front-End Project

```bash
# Create a new React app in a separate directory
npm create vite@latest trend-avatar-frontend -- --template react
cd trend-avatar-frontend
npm install

# Install required dependencies
npm install axios react-router-dom tailwindcss postcss autoprefixer daisyui @heroicons/react
```

### Step 2: Set Up Tailwind CSS

```bash
# Initialize Tailwind CSS
npx tailwindcss init -p
```

Update `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        twitter: {
          blue: '#1DA1F2',
          black: '#14171A',
          dark: '#657786',
          light: '#AAB8C2',
          extraLight: '#E1E8ED',
          extraExtraLight: '#F5F8FA',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/colors/themes")["[data-theme=light]"],
          primary: "#1DA1F2",
          "primary-focus": "#0d95e8",
        },
      },
    ],
  },
}
```

### Step 3: Create React Components

Create necessary components:

1. First, create a `src/components` directory
2. Add the following files:

**src/components/Header.jsx**
```jsx
import { Link, useLocation } from 'react-router-dom';

export default function Header({ user, onLogout }) {
  const location = useLocation();
  
  return (
    <nav className="navbar mb-8">
      <div className="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-twitter-blue" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
        <Link to="/" className="ml-3 text-xl font-bold text-gray-900">Trend Avatar</Link>
      </div>
      {user ? (
        <div className="flex items-center gap-4">
          <div className="avatar-wrapper">
            <img src={user.profileImageUrl} alt={user.username} className="avatar w-10 h-10" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-900">@{user.username}</p>
          </div>
          <div className="flex gap-2">
            <Link to="/dashboard" className="btn-twitter-outline">Dashboard</Link>
            <button onClick={onLogout} className="btn-twitter-secondary">Logout</button>
          </div>
        </div>
      ) : location.pathname !== '/login' && (
        <Link to="/login" className="btn-twitter inline-flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
          Connect with X
        </Link>
      )}
    </nav>
  );
}
```

**src/components/Sidebar.jsx**
```jsx
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar({ user, onLogout }) {
  const location = useLocation();
  
  return (
    <div className="sidebar w-64 flex flex-col">
      <div className="flex items-center px-4 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-twitter-blue" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
        <h1 className="ml-3 text-lg font-bold text-gray-900">Trend Avatar</h1>
      </div>
      
      <nav className="flex-1 space-y-2 px-2">
        <Link 
          to="/dashboard" 
          className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
            location.pathname === '/dashboard' 
              ? 'bg-blue-50 text-twitter-blue' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </Link>
        <Link 
          to="/trends" 
          className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
            location.pathname === '/trends' 
              ? 'bg-blue-50 text-twitter-blue' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Trends
        </Link>
      </nav>
      
      <div className="border-t border-gray-200 py-4 px-4">
        <div className="flex items-center space-x-3">
          <img src={user?.profileImageUrl} alt={user?.username} className="avatar w-10 h-10" />
          <div>
            <p className="text-sm font-medium text-gray-900">@{user?.username}</p>
            <button 
              onClick={onLogout} 
              className="text-sm text-gray-500 hover:text-twitter-blue"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**src/components/TrendItem.jsx**
```jsx
export default function TrendItem({ trend, isActive, onClick }) {
  return (
    <div 
      className={`trend-card mb-3 ${isActive ? 'active' : ''}`}
      onClick={() => onClick(trend)}
    >
      <div className="trend-name font-medium text-twitter-blue">{trend.trend_name}</div>
      <div className="flex justify-between text-sm text-gray-500 mt-1">
        <span>{trend.post_count} posts</span>
        <span>{trend.category || 'Uncategorized'}</span>
      </div>
    </div>
  );
}
```

**src/components/MediaPreview.jsx**
```jsx
export default function MediaPreview({ analysis, onProcess }) {
  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-gray-500">Select a trend to preview media</p>
      </div>
    );
  }
  
  if (analysis.loading) {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="loader mb-4"></div>
        <p className="text-gray-500">Analyzing trend...</p>
      </div>
    );
  }
  
  if (analysis.error) {
    return (
      <div className="text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-red-500">{analysis.error}</p>
      </div>
    );
  }
  
  if (analysis.mediaItems?.length > 0) {
    const firstMedia = analysis.mediaItems[0];
    return (
      <div className="flex flex-col items-center">
        <img src={firstMedia.mediaUrl} alt="Trend media" className="w-full max-w-md rounded-lg shadow-md mb-6" />
        <div className="w-full max-w-md">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Analysis</h3>
          <p className="text-gray-600 mb-3">{analysis.thematicDescription}</p>
          <div className="mb-4">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700 mr-2">Suitability score:</span>
              <div className="bg-gray-200 h-2.5 rounded-full w-full max-w-xs">
                <div 
                  className={`h-2.5 rounded-full ${analysis.processingSuitability >= 50 ? 'bg-twitter-blue' : 'bg-red-500'}`} 
                  style={{width: `${analysis.processingSuitability}%`}}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-700 ml-2">{analysis.processingSuitability}/100</span>
            </div>
          </div>
          
          {analysis.processingSuitability >= 50 ? (
            <button 
              className="btn-twitter w-full" 
              onClick={() => onProcess(analysis.trendName)}
            >
              Process This Media
            </button>
          ) : (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p>This trend is not suitable for avatar swapping.</p>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="text-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Analysis</h3>
      <p className="text-gray-600 mb-3">{analysis.thematicDescription}</p>
      <p className="text-gray-500">No media found for this trend.</p>
    </div>
  );
}
```

### Step 4: Create Main Pages

Create the pages for your application:

**src/pages/HomePage.jsx**
```jsx
import { Link } from 'react-router-dom';
import Header from '../components/Header';

export default function HomePage({ user, onLogout }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Header user={user} onLogout={onLogout} />
      
      <main>
        <section className="mb-16 text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Make Yourself Part of the Trend
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
            Connect your X account to automatically create personalized content based on what's trending.
          </p>
          
          {user ? (
            <div className="mt-12 twitter-card max-w-md mx-auto">
              <div className="flex items-center gap-4">
                <img src={user.profileImageUrl} alt={user.username} className="avatar w-16 h-16" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">@{user.username}</p>
                  <p className="text-gray-500 text-sm">Authenticated with X</p>
                </div>
              </div>
              <div className="mt-6 flex gap-4 justify-center">
                <Link to="/dashboard" className="btn-twitter">Go to Dashboard</Link>
                <button onClick={onLogout} className="btn-twitter-outline">Logout</button>
              </div>
            </div>
          ) : (
            <div className="mt-12">
              <Link to="/login" className="btn-twitter inline-flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                Connect with X
              </Link>
            </div>
          )}
        </section>
        
        <section className="mb-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="twitter-card p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-twitter-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Personalized Trends</h3>
              <p className="text-gray-500">Our AI analyzes trends personalized to your X account and finds the most engaging content.</p>
            </div>
            
            <div className="twitter-card p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-twitter-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Avatar Swap</h3>
              <p className="text-gray-500">We swap your profile image into trending memes and images, making you part of the conversation.</p>
            </div>
            
            <div className="twitter-card p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-twitter-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Auto Posting</h3>
              <p className="text-gray-500">Automatically post the content with clever captions to your X account and join the trending conversation.</p>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="py-8 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">&copy; 2023 Trend Avatar App. Not affiliated with X.</p>
        </div>
      </footer>
    </div>
  );
}
```

**src/pages/LoginPage.jsx**
```jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

export default function LoginPage({ user, api }) {
  const navigate = useNavigate();
  
  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  const handleLogin = async () => {
    try {
      // Get the login URL from your backend
      const response = await api.get('/auth/login-url');
      
      // Redirect to the X login page
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Error getting login URL:', error);
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Header user={user} />
      
      <div className="max-w-md mx-auto my-16 p-8 twitter-card">
        <div className="text-center mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-twitter-blue mx-auto mb-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
          <h2 className="text-2xl font-bold text-gray-900">Sign in with X</h2>
          <p className="text-gray-600 mt-2">Connect your X account to get started</p>
        </div>
        
        <button 
          onClick={handleLogin}
          className="btn-twitter w-full flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
          Continue with X
        </button>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>By signing in, you agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </div>
    </div>
  );
}
```

**src/pages/DashboardPage.jsx**
```jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TrendItem from '../components/TrendItem';
import MediaPreview from '../components/MediaPreview';

export default function DashboardPage({ user, onLogout, api }) {
  const navigate = useNavigate();
  const [trends, setTrends] = useState([]);
  const [loadingTrends, setLoadingTrends] = useState(true);
  const [selectedTrend, setSelectedTrend] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [processResult, setProcessResult] = useState(null);
  const [caption, setCaption] = useState('');
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchTrends();
  }, [user, navigate]);
  
  const fetchTrends = async () => {
    setLoadingTrends(true);
    try {
      const response = await api.get('/api/trends');
      setTrends(response.data.trends || []);
    } catch (error) {
      console.error('Error fetching trends:', error);
    } finally {
      setLoadingTrends(false);
    }
  };
  
  const analyzeTrend = async (trend) => {
    setSelectedTrend(trend);
    setAnalysis({ loading: true });
    
    try {
      const response = await api.get(`/api/trends/analyze/${encodeURIComponent(trend.trend_name)}`);
      setAnalysis(response.data.analysis);
    } catch (error) {
      console.error('Error analyzing trend:', error);
      setAnalysis({ error: 'Failed to analyze trend. Please try again.' });
    }
  };
  
  const processMedia = async (trendName) => {
    setAnalysis({ ...analysis, loading: true });
    
    try {
      const response = await api.post(`/api/trends/process/${encodeURIComponent(trendName)}`);
      
      if (response.data.error) {
        setAnalysis({ ...analysis, error: response.data.error, loading: false });
        return;
      }
      
      setProcessResult(response.data.result);
      setCaption(response.data.result.caption);
      setAnalysis({ ...analysis, loading: false });
    } catch (error) {
      console.error('Error processing media:', error);
      setAnalysis({ ...analysis, error: 'Failed to process media. Please try again.', loading: false });
    }
  };
  
  const autoProcessTrend = async () => {
    setAnalysis({ loading: true });
    setProcessResult(null);
    
    try {
      const response = await api.post('/api/trends/auto-process');
      
      if (response.data.error) {
        setAnalysis({ error: response.data.error, loading: false });
        return;
      }
      
      if (response.data.message) {
        setAnalysis({ thematicDescription: response.data.message, loading: false });
        return;
      }
      
      // Handle successful auto-processing
      setAnalysis({
        success: true,
        trendName: response.data.trendUsed,
        tweetUrl: response.data.tweetUrl,
        caption: response.data.caption,
        loading: false
      });
      
    } catch (error) {
      console.error('Error auto-processing trend:', error);
      setAnalysis({ error: 'Failed to auto-process trends. Please try again.', loading: false });
    }
  };
  
  const postToX = async () => {
    if (!caption || !processResult?.modifiedMediaUrl) {
      alert('Caption and image are required.');
      return;
    }
    
    try {
      const response = await api.post('/api/trends/post', {
        caption,
        mediaUrl: processResult.modifiedMediaUrl
      });
      
      if (response.data.error) {
        alert(`Error: ${response.data.error}`);
        return;
      }
      
      if (response.data.success) {
        setProcessResult(null);
        setAnalysis({
          success: true,
          tweetUrl: response.data.tweetUrl,
          caption: caption,
        });
      } else {
        alert('Failed to post to X.');
      }
    } catch (error) {
      console.error('Error posting to X:', error);
      alert('Failed to post to X. Please try again.');
    }
  };
  
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar user={user} onLogout={onLogout} />
      </div>
      
      {/* Mobile header */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-10 md:hidden">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-twitter-blue" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
            <h1 className="ml-3 text-lg font-bold text-gray-900">Trend Avatar</h1>
          </div>
          
          <div>
            <img src={user?.profileImageUrl} alt={user?.username} className="avatar w-8 h-8" />
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-64 pt-16 md:pt-0">
        <main className="flex-1 p-4 md:p-6">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Trend Dashboard</h1>
            
            <div className="mt-3 sm:mt-0 flex flex-col sm:flex-row gap-2">
              <button 
                onClick={fetchTrends} 
                className="btn-twitter-outline flex items-center justify-center"
                disabled={loadingTrends}
              >
                {loadingTrends ? (
                  <>
                    <div className="loader mr-2"></div>
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh Trends
                  </>
                )}
              </button>
              
              <button 
                onClick={autoProcessTrend} 
                className="btn-twitter flex items-center justify-center"
                disabled={analysis?.loading}
              >
                {analysis?.loading ? (
                  <>
                    <div className="loader mr-2"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Auto-Process Trend
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Trends List */}
            <div className="card">
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-lg font-medium text-gray-900">Your Personalized Trends</h2>
              </div>
              <div className="p-4 space-y-2 max-h-[500px] overflow-y-auto">
                {loadingTrends ? (
                  <>
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                    </div>
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                    </div>
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                    </div>
                  </>
                ) : trends.length > 0 ? (
                  trends.map((trend) => (
                    <TrendItem 
                      key={trend.trend_name}
                      trend={trend}
                      isActive={selectedTrend?.trend_name === trend.trend_name}
                      onClick={analyzeTrend}
                    />
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No trends found. Try refreshing later.</p>
                )}
              </div>
            </div>
            
            {/* Media Preview */}
            <div className="lg:col-span-2 card">
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-lg font-medium text-gray-900">Media Preview</h2>
              </div>
              <div className="p-6">
                <MediaPreview analysis={analysis} onProcess={processMedia} />
              </div>
            </div>
          </div>
          
          {/* Process Result */}
          {processResult && (
            <div className="mt-6 card">
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-lg font-medium text-gray-900">Ready to Post</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex justify-center">
                    <div className="relative w-full max-w-md">
                      <img src={processResult.modifiedMediaUrl} alt="Processed Image" className="w-full rounded-lg shadow-md" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-2">Caption</label>
                    <textarea 
                      id="caption" 
                      rows="4" 
                      className="input-twitter resize-none" 
                      placeholder="Your post caption" 
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                    ></textarea>
                    
                    <div className="mt-6 flex">
                      <button 
                        onClick={postToX} 
                        className="btn-twitter w-full flex items-center justify-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                        </svg>
                        Post to X
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
        
        <footer className="py-4 px-6 border-t border-gray-200">
          <p className="text-center text-gray-500 text-sm">&copy; 2023 Trend Avatar App. Not affiliated with X.</p>
        </footer>
      </div>
    </div>
  );
}
```

### Step 5: Create Auth and API Service

Create an API service to communicate with your backend:

**src/services/api.js**
```javascript
import axios from 'axios';

// Create an axios instance with the backend URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true, // Important for cookies/sessions
});

// Add a request interceptor to include auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login page if unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

**src/services/auth.js**
```javascript
import api from './api';

const auth = {
  // Check if user is logged in
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  
  // Get current user information
  getCurrentUser: async () => {
    try {
      const response = await api.get('/api/user');
      return response.data;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },
  
  // Login user (redirects to X for OAuth)
  login: async () => {
    try {
      const response = await api.get('/auth/login-url');
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Error getting login URL:', error);
      throw error;
    }
  },
  
  // Handle OAuth callback
  handleCallback: async (code, state) => {
    try {
      const response = await api.post('/auth/callback', { code, state });
      localStorage.setItem('token', response.data.token);
      return response.data.user;
    } catch (error) {
      console.error('Error handling callback:', error);
      throw error;
    }
  },
  
  // Logout user
  logout: async () => {
    try {
      await api.get('/auth/logout');
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Error logging out:', error);
      // Still remove token even if API call fails
      localStorage.removeItem('token');
    }
  }
};

export default auth;
```

### Step 6: Create Main App Component

**src/App.jsx**
```jsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import auth from './services/auth';
import api from './services/api';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is logged in on app load
    const checkAuth = async () => {
      if (auth.isAuthenticated()) {
        try {
          const currentUser = await auth.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);
  
  const handleLogout = async () => {
    await auth.logout();
    setUser(null);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loader"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage user={user} onLogout={handleLogout} />} />
        <Route path="/login" element={<LoginPage user={user} api={api} />} />
        <Route 
          path="/dashboard" 
          element={
            user ? 
              <DashboardPage user={user} onLogout={handleLogout} api={api} /> : 
              <Navigate to="/login" />
          } 
        />
        <Route 
          path="/auth/callback" 
          element={<AuthCallback setUser={setUser} />} 
        />
      </Routes>
    </Router>
  );
}

// Component to handle OAuth callback
function AuthCallback({ setUser }) {
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      
      if (!code || !state) {
        setError('Invalid callback parameters');
        return;
      }
      
      try {
        const user = await auth.handleCallback(code, state);
        setUser(user);
        window.location.href = '/dashboard';
      } catch (error) {
        console.error('Error handling callback:', error);
        setError('Authentication failed. Please try again.');
      }
    };
    
    handleCallback();
  }, [setUser]);
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Authentication Error</h2>
        <p className="text-gray-600">{error}</p>
        <a href="/login" className="mt-4 btn-twitter">Try Again</a>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="loader mb-4"></div>
      <p className="text-gray-600">Completing authentication...</p>
    </div>
  );
}

export default App;
```

### Step 7: Update index.css

**src/index.css**
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary-color: #1DA1F2;
  --primary-hover: #0d95e8;
  --secondary-color: #14171A;
  --text-color: #657786;
  --light-text: #AAB8C2;
  --border-color: #E1E8ED;
  --bg-color: #F5F8FA;
  --success-color: #17bf63;
  --error-color: #e0245e;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  @apply bg-gray-50 text-gray-900;
}

@layer components {
  .btn-twitter {
    @apply bg-twitter-blue hover:bg-twitter-blue/90 text-white font-medium py-2 px-4 rounded-full transition duration-200;
  }

  .btn-twitter-outline {
    @apply bg-white text-twitter-blue border border-twitter-blue font-medium py-2 px-4 rounded-full hover:bg-twitter-blue/10 transition duration-200;
  }

  .btn-twitter-secondary {
    @apply bg-transparent hover:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-full transition duration-200;
  }

  .twitter-card {
    @apply bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-gray-200 transition-all duration-200;
  }

  .trend-card {
    @apply bg-white p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all duration-200 cursor-pointer;
  }

  .trend-card.active {
    @apply border-twitter-blue bg-blue-50;
  }

  .input-twitter {
    @apply w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-twitter-blue focus:border-transparent;
  }

  .avatar {
    @apply rounded-full object-cover;
  }

  .loader {
    @apply animate-spin rounded-full h-5 w-5 border-b-2 border-twitter-blue;
  }

  .navbar {
    @apply sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between;
  }

  .sidebar {
    @apply fixed h-full w-64 px-4 py-6 overflow-y-auto bg-white border-r border-gray-100;
  }

  .card {
    @apply bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden;
  }
}
```

### Step 8: Create .env Files

Create `.env` and `.env.production` files for environment variables:

**.env**
```
VITE_API_URL=http://localhost:3000
```

**.env.production**
```
VITE_API_URL=https://your-backend-api-url.railway.app
```

## Part 2: Set Up Docker for Railway Deployment

Create a `Dockerfile` in the root of your React project:

```dockerfile
# Use Node.js LTS as base image
FROM node:lts-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy project files
COPY . .

# Build the project
RUN npm run build

# Use Caddy as web server for production
FROM caddy:alpine

# Copy the built app
COPY --from=build /app/dist /usr/share/caddy

# Copy Caddyfile
COPY Caddyfile /etc/caddy/Caddyfile

# Expose port
EXPOSE 3000

# Start Caddy
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
```

Create a `Caddyfile` in the root of your project:

```
# global options
{
  admin off # No need for admin API in Railway
  persist_config off # Storage isn't persistent anyway
  auto_https off # Railway handles HTTPS
  log {
    format json # Set runtime log format to JSON
  }
  servers {
    trusted_proxies static private_ranges 100.0.0.0/8 # Trust Railway's proxy
  }
}

# Site block, listens on PORT environment variable
:{$PORT:3000} {
  # Access logs
  log {
    format json
  }

  # Health check for Railway
  rewrite /health /*

  # Serve from the root folder
  root * /usr/share/caddy

  # Enable gzipping responses
  encode gzip

  # Serve static files
  file_server

  # For SPA - route all non-file requests to index.html
  try_files {path} /index.html
}
```

## Part 3: Update Backend to Accommodate the React Frontend

For your backend service, you need to update the OAuth callback URL to point to your Railway frontend domain. Let's update the relevant part:

1. First, update your backend `.env` file (for Railway deployment):

```
# X (Twitter) API Credentials
X_CLIENT_ID=your_client_id
X_CLIENT_SECRET=your_client_secret

# Important: this should point to your frontend app on Railway
X_CALLBACK_URL=https://your-frontend-app.railway.app/auth/callback

# OpenAI API
OPENAI_API_KEY=your_openai_api_key

# App Settings
PORT=3000
NODE_ENV=production
SESSION_SECRET=a_strong_random_secret
CORS_ORIGIN=https://your-frontend-app.railway.app
```

2. Update your backend's app.ts file to enable CORS for your frontend:

```typescript
// Add this to your backend app.ts
import cors from 'cors';

// CORS configuration for Railway
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
```

3. Create a new endpoint in your backend to provide the login URL (instead of redirecting):

```typescript
// Add this to your auth controller
export const getLoginUrl = (req: Request, res: Response) => {
  const { url, codeVerifier } = XApiService.generateAuthUrl();
  req.session.codeVerifier = codeVerifier;
  res.json({ url });
};

// Add this route to your auth routes
router.get('/login-url', authController.getLoginUrl);
```

4. Update your callback endpoint to handle requests from the frontend:

```typescript
// Update the callback function in your auth controller
export const callback = async (req: Request, res: Response) => {
  const { code, state } = req.query;
  const codeVerifier = req.session.codeVerifier;
  
  if (!code || !codeVerifier) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  try {
    // Exchange code for tokens
    const { accessToken, refreshToken, expiresIn } = await XApiService.getTokens(
      code as string,
      codeVerifier
    );

    // Get user info
    const userInfo = await XApiService.getUserInfo(accessToken);

    // Store user info and tokens in session
    req.session.user = {
      id: userInfo.id,
      username: userInfo.username,
      profileImageUrl: userInfo.profileImageUrl,
      accessToken,
      refreshToken,
      tokenExpiry: Math.floor(Date.now() / 1000) + expiresIn
    };

    // For API-based frontend, just redirect to the frontend callback URL
    res.redirect(`${process.env.CORS_ORIGIN}/auth/callback?code=${code}&state=${state}`);
  } catch (error) {
    console.error('Auth callback error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};
```

5. Add a user endpoint to get the current user:

```typescript
// Add to your auth controller
export const getCurrentUser = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Return user info without sensitive data
  const { accessToken, refreshToken, tokenExpiry, ...safeUserData } = req.user;
  res.json(safeUserData);
};

// Add to your auth routes
router.get('/user', authenticate, authController.getCurrentUser);
```

## Part 4: Deploy to Railway

Now you're ready to deploy both your frontend and backend to Railway.

### Deploy Backend:

1. Create a new project in Railway
2. Connect your backend repository
3. Set environment variables:
   - X_CLIENT_ID
   - X_CLIENT_SECRET
   - X_CALLBACK_URL=https://your-frontend-app.railway.app/auth/callback
   - OPENAI_API_KEY
   - SESSION_SECRET
   - NODE_ENV=production
   - CORS_ORIGIN=https://your-frontend-app.railway.app
4. Deploy the service
5. Generate a domain in the Networking tab

### Deploy Frontend:

1. Create a new project in Railway
2. Connect your frontend repository
3. Railway will detect your Dockerfile and use it to build and deploy your app
4. Set environment variables:
   - VITE_API_URL=https://your-backend-api-url.railway.app
5. Deploy the service
6. Generate a domain in the Networking tab

### Update Callback URLs:

1. Go to the X Developer Portal
2. Update your app's callback URL to: https://your-frontend-app.railway.app/auth/callback
3. Make sure your app settings include the necessary OAuth 2.0 scopes

## Summary of Changes

1. **Frontend**:
   - Converted from EJS to a React SPA
   - Uses Railway's React deployment
   - Communicates with backend API
   - Handles OAuth flow through frontend routing

2. **Backend**:
   - Added API endpoints for frontend communication
   - Updated CORS configuration
   - Modified auth flow to work with SPA
   - Changed callback URL structure

3. **X (Twitter) Integration**:
   - Updated callback URL to point to frontend
   - Auth flow now completes through frontend redirection
