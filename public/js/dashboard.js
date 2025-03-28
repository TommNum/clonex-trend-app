document.addEventListener('DOMContentLoaded', () => {
    const refreshTrendsBtn = document.getElementById('refreshTrends');
    const autoProcessBtn = document.getElementById('autoProcess');
    const trendsContainer = document.getElementById('trendsContainer');
    const mediaPreview = document.getElementById('mediaPreview');
    const processResult = document.getElementById('processResult');
    const resultImage = document.getElementById('resultImage');
    const captionInput = document.getElementById('caption');
    const postToXBtn = document.getElementById('postToX');

    let selectedTrend = null;

    // Fetch and display trends
    async function fetchTrends() {
        try {
            trendsContainer.innerHTML = '<p class="loading">Loading trends...</p>';
            const response = await fetch('/api/trends');
            const trends = await response.json();

            if (trends.length === 0) {
                trendsContainer.innerHTML = '<p>No trends found. Try refreshing!</p>';
                return;
            }

            trendsContainer.innerHTML = trends.map(trend => `
                <div class="trend-item" data-trend-id="${trend.id}">
                    <div class="trend-name">${trend.name}</div>
                    <div class="trend-meta">
                        <span>${trend.tweetVolume} tweets</span>
                        <span>${new Date(trend.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            `).join('');

            // Add click handlers to trend items
            document.querySelectorAll('.trend-item').forEach(item => {
                item.addEventListener('click', () => selectTrend(item.dataset.trendId));
            });

        } catch (error) {
            console.error('Error fetching trends:', error);
            trendsContainer.innerHTML = '<p class="error">Error loading trends. Please try again.</p>';
        }
    }

    // Select a trend and show its media
    async function selectTrend(trendId) {
        try {
            // Update selected state
            document.querySelectorAll('.trend-item').forEach(item => {
                item.classList.remove('selected');
                if (item.dataset.trendId === trendId) {
                    item.classList.add('selected');
                }
            });

            const response = await fetch(`/api/trends/${trendId}/media`);
            const media = await response.json();

            if (media.length === 0) {
                mediaPreview.innerHTML = '<p>No media found for this trend.</p>';
                return;
            }

            selectedTrend = trendId;
            mediaPreview.innerHTML = `
                <img src="${media[0].url}" alt="Trend media">
                <div class="media-controls">
                    <button class="btn secondary" onclick="processMedia('${media[0].id}')">Process This</button>
                </div>
            `;

        } catch (error) {
            console.error('Error fetching trend media:', error);
            mediaPreview.innerHTML = '<p class="error">Error loading media. Please try again.</p>';
        }
    }

    // Process selected media
    async function processMedia(mediaId) {
        try {
            const response = await fetch(`/api/trends/${selectedTrend}/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ mediaId })
            });

            const result = await response.json();
            
            resultImage.src = result.processedImageUrl;
            captionInput.value = result.caption;
            processResult.classList.remove('hidden');

        } catch (error) {
            console.error('Error processing media:', error);
            alert('Error processing media. Please try again.');
        }
    }

    // Post to X
    async function postToX() {
        try {
            const response = await fetch('/api/trends/post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    trendId: selectedTrend,
                    caption: captionInput.value
                })
            });

            if (response.ok) {
                alert('Successfully posted to X!');
                processResult.classList.add('hidden');
            } else {
                throw new Error('Failed to post to X');
            }

        } catch (error) {
            console.error('Error posting to X:', error);
            alert('Error posting to X. Please try again.');
        }
    }

    // Auto-process the most relevant trend
    async function autoProcessTrend() {
        try {
            const response = await fetch('/api/trends/auto-process', {
                method: 'POST'
            });

            const result = await response.json();
            
            resultImage.src = result.processedImageUrl;
            captionInput.value = result.caption;
            processResult.classList.remove('hidden');

        } catch (error) {
            console.error('Error auto-processing trend:', error);
            alert('Error auto-processing trend. Please try again.');
        }
    }

    // Event listeners
    refreshTrendsBtn.addEventListener('click', fetchTrends);
    autoProcessBtn.addEventListener('click', autoProcessTrend);
    postToXBtn.addEventListener('click', postToX);

    // Initial load
    fetchTrends();
}); 