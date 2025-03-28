// API endpoints
const API_BASE_URL = '/api';

// Authentication functions
async function login(username, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('token', data.token);
      window.location.href = '/dashboard';
    } else {
      showError(data.message);
    }
  } catch (error) {
    showError('An error occurred during login');
  }
}

// Trend analysis functions
async function analyzeTrends(query) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/trends/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    if (response.ok) {
      displayTrends(data.trends);
      displayAnalysis(data.analysis);
    } else {
      showError(data.message);
    }
  } catch (error) {
    showError('An error occurred while analyzing trends');
  }
}

// UI helper functions
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);
  setTimeout(() => errorDiv.remove(), 3000);
}

function displayTrends(trends) {
  const trendsContainer = document.getElementById('trends-container');
  if (!trendsContainer) return;

  trendsContainer.innerHTML = trends.map(trend => `
    <div class="trend-card">
      <h3>${trend.name}</h3>
      <p>Volume: ${formatVolume(trend.volume)}</p>
      <button onclick="generateAvatar('${trend.name}')" class="btn btn-primary">
        Generate Avatar
      </button>
    </div>
  `).join('');
}

function displayAnalysis(analysis) {
  const analysisContainer = document.getElementById('analysis-container');
  if (!analysisContainer) return;

  analysisContainer.innerHTML = `
    <div class="analysis-card">
      <h3>Analysis</h3>
      <p>${analysis.analysis}</p>
      <h4>Sentiment: ${analysis.sentiment}</h4>
      <h4>Recommendations:</h4>
      <ul>
        ${analysis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
      </ul>
    </div>
  `;
}

function formatVolume(volume) {
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`;
  }
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`;
  }
  return volume.toString();
}

// Main JavaScript for dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const trendsContainer = document.getElementById('trendsContainer');
  const mediaPreview = document.getElementById('mediaPreview');
  const refreshTrendsBtn = document.getElementById('refreshTrends');
  const autoProcessBtn = document.getElementById('autoProcess');
  const processResult = document.getElementById('processResult');
  const resultImage = document.getElementById('resultImage');
  const captionTextarea = document.getElementById('caption');
  const postToXBtn = document.getElementById('postToX');
  
  // Fetch personalized trends
  async function fetchTrends() {
    trendsContainer.innerHTML = '<p class="loading">Loading trends...</p>';
    
    try {
      const response = await fetch('/api/trends');
      const data = await response.json();
      
      if (!data.trends || data.trends.length === 0) {
        trendsContainer.innerHTML = '<p>No trends found. Try refreshing later.</p>';
        return;
      }
      
      renderTrends(data.trends);
    } catch (error) {
      console.error('Error fetching trends:', error);
      trendsContainer.innerHTML = '<p>Failed to load trends. Please try again.</p>';
    }
  }
  
  // Render trends list
  function renderTrends(trends) {
    trendsContainer.innerHTML = '';
    
    trends.forEach(trend => {
      const trendItem = document.createElement('div');
      trendItem.className = 'trend-item';
      trendItem.dataset.trendName = trend.trend_name;
      
      const trendContent = `
        <div class="trend-name">${trend.trend_name}</div>
        <div class="trend-meta">
          <span>${trend.post_count} posts</span>
          <span>${trend.category || 'Uncategorized'}</span>
        </div>
      `;
      
      trendItem.innerHTML = trendContent;
      
      trendItem.addEventListener('click', () => {
        // Remove selected class from all trends
        document.querySelectorAll('.trend-item').forEach(item => {
          item.classList.remove('selected');
        });
        
        // Add selected class to clicked trend
        trendItem.classList.add('selected');
        
        // Analyze the selected trend
        analyzeTrend(trend.trend_name);
      });
      
      trendsContainer.appendChild(trendItem);
    });
  }
  
  // Analyze a selected trend
  async function analyzeTrend(trendName) {
    mediaPreview.innerHTML = '<p class="loading">Analyzing trend...</p>';
    
    try {
      const response = await fetch(`/api/trends/analyze/${encodeURIComponent(trendName)}`);
      const data = await response.json();
      
      if (!data.analysis) {
        mediaPreview.innerHTML = '<p>No analysis available for this trend.</p>';
        return;
      }
      
      const analysis = data.analysis;
      
      // Render media preview and analysis
      let previewContent = '';
      
      if (analysis.processingSuitability >= 50 && analysis.mediaItems.length > 0) {
        const firstMedia = analysis.mediaItems[0];
        previewContent = `
          <img src="${firstMedia.mediaUrl}" alt="Trend media" />
          <h3>Analysis</h3>
          <p>${analysis.thematicDescription}</p>
          <p>Suitability score: ${analysis.processingSuitability}/100</p>
          <button class="btn primary" onclick="processMedia('${trendName}')">Process This Media</button>
        `;
      } else if (analysis.mediaItems.length > 0) {
        const firstMedia = analysis.mediaItems[0];
        previewContent = `
          <img src="${firstMedia.mediaUrl}" alt="Trend media" />
          <h3>Analysis</h3>
          <p>${analysis.thematicDescription}</p>
          <p>Suitability score: ${analysis.processingSuitability}/100</p>
          <p>This trend is not suitable for avatar swapping.</p>
        `;
      } else {
        previewContent = `
          <h3>Analysis</h3>
          <p>${analysis.thematicDescription}</p>
          <p>No media found for this trend.</p>
        `;
      }
      
      mediaPreview.innerHTML = previewContent;
    } catch (error) {
      console.error('Error analyzing trend:', error);
      mediaPreview.innerHTML = '<p>Failed to analyze trend. Please try again.</p>';
    }
  }
  
  // Process media for a trend
  window.processMedia = async function(trendName) {
    mediaPreview.innerHTML = '<p class="loading">Processing media...</p>';
    
    try {
      const response = await fetch(`/api/trends/process/${encodeURIComponent(trendName)}`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.error) {
        mediaPreview.innerHTML = `<p>Error: ${data.error}</p>`;
        return;
      }
      
      if (!data.result) {
        mediaPreview.innerHTML = '<p>Failed to process media.</p>';
        return;
      }
      
      // Show the processed result
      resultImage.src = data.result.modifiedMediaUrl;
      captionTextarea.value = data.result.caption;
      processResult.classList.remove('hidden');
      
      // Scroll to the result
      processResult.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Error processing media:', error);
      mediaPreview.innerHTML = '<p>Failed to process media. Please try again.</p>';
    }
  };
  
  // Auto-process trend
  async function autoProcessTrend() {
    mediaPreview.innerHTML = '<p class="loading">Auto-processing trends...</p>';
    processResult.classList.add('hidden');
    
    try {
      const response = await fetch('/api/trends/auto-process', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.error) {
        mediaPreview.innerHTML = `<p>Error: ${data.error}</p>`;
        return;
      }
      
      if (data.message) {
        mediaPreview.innerHTML = `<p>${data.message}</p>`;
        return;
      }
      
      if (data.success) {
        mediaPreview.innerHTML = `
          <h3>Auto-Processed!</h3>
          <p>Successfully posted using trend: ${data.trendUsed}</p>
          <p>Tweet URL: <a href="${data.tweetUrl}" target="_blank">${data.tweetUrl}</a></p>
          <p>Caption: ${data.caption}</p>
        `;
      } else {
        mediaPreview.innerHTML = '<p>Failed to auto-process trends.</p>';
      }
    } catch (error) {
      console.error('Error auto-processing trend:', error);
      mediaPreview.innerHTML = '<p>Failed to auto-process trends. Please try again.</p>';
    }
  }
  
  // Post to X
  async function postToX() {
    if (!captionTextarea.value || !resultImage.src) {
      alert('Caption and image are required.');
      return;
    }
    
    try {
      const response = await fetch('/api/trends/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caption: captionTextarea.value,
          mediaUrl: resultImage.src,
        }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        alert(`Error: ${data.error}`);
        return;
      }
      
      if (data.success) {
        alert('Successfully posted to X!');
        processResult.classList.add('hidden');
        mediaPreview.innerHTML = `
          <h3>Posted Successfully!</h3>
          <p>Your post is now live on X.</p>
          <p>View it here: <a href="${data.tweetUrl}" target="_blank">${data.tweetUrl}</a></p>
        `;
      } else {
        alert('Failed to post to X.');
      }
    } catch (error) {
      console.error('Error posting to X:', error);
      alert('Failed to post to X. Please try again.');
    }
  }
  
  // Event listeners
  refreshTrendsBtn.addEventListener('click', fetchTrends);
  autoProcessBtn.addEventListener('click', autoProcessTrend);
  postToXBtn.addEventListener('click', postToX);
  
  // Initial fetch
  fetchTrends();
});

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      login(username, password);
    });
  }

  const trendForm = document.getElementById('trend-form');
  if (trendForm) {
    trendForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = document.getElementById('trend-query').value;
      analyzeTrends(query);
    });
  }
}); 