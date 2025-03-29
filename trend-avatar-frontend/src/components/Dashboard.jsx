import { useState, useEffect } from 'react';
import './Dashboard.css';

export default function Dashboard() {
    const [trends, setTrends] = useState([]);
    const [selectedTrend, setSelectedTrend] = useState(null);
    const [media, setMedia] = useState(null);
    const [processedResult, setProcessedResult] = useState(null);
    const [caption, setCaption] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchTrends = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/trends');
            const data = await response.json();
            setTrends(data);
        } catch (error) {
            console.error('Error fetching trends:', error);
            setError('Error loading trends. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const selectTrend = async (trendId) => {
        try {
            setError(null);
            const response = await fetch(`/api/trends/${trendId}/media`);
            const data = await response.json();
            
            if (data.length === 0) {
                setMedia(null);
                return;
            }

            setSelectedTrend(trendId);
            setMedia(data[0]);
        } catch (error) {
            console.error('Error fetching trend media:', error);
            setError('Error loading media. Please try again.');
        }
    };

    const processMedia = async (mediaId) => {
        try {
            const response = await fetch(`/api/trends/${selectedTrend}/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ mediaId })
            });

            const result = await response.json();
            setProcessedResult(result);
            setCaption(result.caption);
        } catch (error) {
            console.error('Error processing media:', error);
            setError('Error processing media. Please try again.');
        }
    };

    const postToX = async () => {
        try {
            const response = await fetch('/api/trends/post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    trendId: selectedTrend,
                    caption
                })
            });

            if (response.ok) {
                alert('Successfully posted to X!');
                setProcessedResult(null);
            } else {
                throw new Error('Failed to post to X');
            }
        } catch (error) {
            console.error('Error posting to X:', error);
            setError('Error posting to X. Please try again.');
        }
    };

    const autoProcessTrend = async () => {
        try {
            const response = await fetch('/api/trends/auto-process', {
                method: 'POST'
            });

            const result = await response.json();
            setProcessedResult(result);
            setCaption(result.caption);
        } catch (error) {
            console.error('Error auto-processing trend:', error);
            setError('Error auto-processing trend. Please try again.');
        }
    };

    useEffect(() => {
        fetchTrends();
    }, []);

    return (
        <div className="dashboard">
            <div className="controls">
                <button onClick={fetchTrends} className="btn primary">Refresh Trends</button>
                <button onClick={autoProcessTrend} className="btn primary">Auto Process</button>
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
                            onClick={() => selectTrend(trend.id)}
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

            {media && (
                <div className="media-preview">
                    <img src={media.url} alt="Trend media" />
                    <div className="media-controls">
                        <button className="btn secondary" onClick={() => processMedia(media.id)}>
                            Process This
                        </button>
                    </div>
                </div>
            )}

            {processedResult && (
                <div className="process-result">
                    <img src={processedResult.processedImageUrl} alt="Processed result" />
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
    );
} 