import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

export default function Home({ user, onLogout }) {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTrend, setSelectedTrend] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [processedResult, setProcessedResult] = useState(null);
  const [caption, setCaption] = useState('');

  // Fetch personalized trends
  const fetchTrends = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/trends');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid response format');
      }
      
      setTrends(data);
    } catch (error) {
      console.error('Error fetching trends:', error);
      setError('Failed to load trends. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Analyze a selected trend
  const analyzeTrend = async (trendName) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/trends/analyze/${encodeURIComponent(trendName)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      if (!data || !data.analysis) {
        throw new Error('Invalid response format');
      }
      
      const analysis = data.analysis;
      
      if (analysis.processingSuitability >= 50 && analysis.mediaItems?.length > 0) {
        const firstMedia = analysis.mediaItems[0];
        setMediaPreview({
          imageUrl: firstMedia.mediaUrl,
          analysis: analysis.thematicDescription,
          suitability: analysis.processingSuitability,
          trendName: trendName
        });
      } else if (analysis.mediaItems?.length > 0) {
        const firstMedia = analysis.mediaItems[0];
        setMediaPreview({
          imageUrl: firstMedia.mediaUrl,
          analysis: analysis.thematicDescription,
          suitability: analysis.processingSuitability,
          trendName: trendName,
          notSuitable: true
        });
      } else {
        setMediaPreview({
          analysis: analysis.thematicDescription,
          noMedia: true
        });
      }
    } catch (error) {
      console.error('Error analyzing trend:', error);
      setError('Failed to analyze trend. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Process media for a trend
  const processMedia = async (trendName) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/trends/process/${encodeURIComponent(trendName)}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data || !data.result) {
        throw new Error('Invalid response format');
      }
      
      setProcessedResult({
        imageUrl: data.result.modifiedMediaUrl,
        caption: data.result.caption
      });
      setCaption(data.result.caption);
    } catch (error) {
      console.error('Error processing media:', error);
      setError('Failed to process media. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-process trend
  const autoProcessTrend = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/trends/auto-process', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data) {
        throw new Error('Invalid response format');
      }
      
      if (data.error) {
        setError(data.error);
        return;
      }
      
      if (data.message) {
        setError(data.message);
        return;
      }
      
      if (data.success) {
        setMediaPreview({
          success: true,
          trendUsed: data.trendUsed,
          tweetUrl: data.tweetUrl,
          caption: data.caption
        });
      } else {
        setError('Failed to auto-process trends.');
      }
    } catch (error) {
      console.error('Error auto-processing trend:', error);
      setError('Failed to auto-process trends. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Post to X
  const postToX = async () => {
    if (!caption || !processedResult?.imageUrl) {
      setError('Caption and image are required.');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/trends/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caption,
          mediaUrl: processedResult.imageUrl,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data) {
        throw new Error('Invalid response format');
      }
      
      if (data.error) {
        setError(data.error);
        return;
      }
      
      if (data.success) {
        setProcessedResult(null);
        setMediaPreview({
          success: true,
          tweetUrl: data.tweetUrl
        });
      } else {
        setError('Failed to post to X.');
      }
    } catch (error) {
      console.error('Error posting to X:', error);
      setError('Failed to post to X. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTrends();
    }
  }, [user]);

  return (
    <div className="home">
      <header className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
          Make Yourself Part of the Trend
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
          Connect your X account to automatically create personalized content based on what's trending.
        </p>
      </header>

      {user ? (
        <div className="dashboard">
          <div className="controls mb-8">
            <button onClick={fetchTrends} className="btn primary">
              Refresh Trends
            </button>
            <button onClick={autoProcessTrend} className="btn primary">
              Auto Process
            </button>
          </div>

          {error && <div className="error">{error}</div>}

          <div className="trends-container">
            {loading ? (
              <p className="loading">Loading trends...</p>
            ) : trends.length === 0 ? (
              <p>No trends found. Try refreshing!</p>
            ) : (
              trends.map(trend => (
                <div
                  key={trend.id}
                  className={`trend-item ${selectedTrend === trend.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedTrend(trend.id);
                    analyzeTrend(trend.name);
                  }}
                >
                  <div className="trend-name">{trend.name}</div>
                  <div className="trend-meta">
                    <span>{trend.tweetVolume} tweets</span>
                    <span>{new Date(trend.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {mediaPreview && (
            <div className="media-preview">
              {mediaPreview.imageUrl && (
                <img src={mediaPreview.imageUrl} alt="Trend media" />
              )}
              <div className="analysis">
                <h3>Analysis</h3>
                <p>{mediaPreview.analysis}</p>
                {mediaPreview.suitability && (
                  <p>Suitability score: {mediaPreview.suitability}/100</p>
                )}
                {mediaPreview.notSuitable ? (
                  <p>This trend is not suitable for avatar swapping.</p>
                ) : mediaPreview.imageUrl && (
                  <button
                    className="btn primary"
                    onClick={() => processMedia(mediaPreview.trendName)}
                  >
                    Process This Media
                  </button>
                )}
                {mediaPreview.noMedia && <p>No media found for this trend.</p>}
                {mediaPreview.success && (
                  <div className="success">
                    <p>Successfully processed!</p>
                    {mediaPreview.tweetUrl && (
                      <p>
                        View on X:{' '}
                        <a href={mediaPreview.tweetUrl} target="_blank" rel="noopener noreferrer">
                          {mediaPreview.tweetUrl}
                        </a>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {processedResult && (
            <div className="process-result">
              <img src={processedResult.imageUrl} alt="Processed result" />
              <div className="caption-controls">
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Enter caption..."
                />
                <button className="btn primary" onClick={postToX}>
                  Post to X
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="auth-prompt">
          <button 
            onClick={() => {
              window.location.href = '/api/auth/login';
            }}
            className="btn primary"
          >
            Connect with X
          </button>
        </div>
      )}
    </div>
  );
} 