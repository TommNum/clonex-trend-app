document.addEventListener('DOMContentLoaded', () => {
    const refreshTrendsBtn = document.getElementById('refreshTrends');
    const autoProcessBtn = document.getElementById('autoProcess');
    const trendsContainer = document.getElementById('trendsContainer');
    const mediaPreview = document.getElementById('mediaPreview');
    const processResult = document.getElementById('processResult');
    const resultImage = document.getElementById('resultImage');
    const captionInput = document.getElementById('caption');
    const postToXBtn = document.getElementById('postToX');

    let selectedPost = null;

    // Fetch and display trends
    async function fetchTrends() {
        try {
            trendsContainer.innerHTML = '<p class="loading">Loading timeline...</p>';
            const response = await fetch('/api/trends');
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error:', response.status, errorText);
                throw new Error(`API Error: ${response.status}`);
            }
            
            const posts = await response.json();
            console.log('Posts received:', posts.length);

            if (!posts.length || !Array.isArray(posts)) {
                trendsContainer.innerHTML = '<p>No posts found. Try refreshing!</p>';
                return;
            }

            // Add CSS for the grid layout
            const style = document.createElement('style');
            style.textContent = `
                .posts-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 20px;
                    padding: 20px;
                }
                .post-card {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 12px;
                    overflow: hidden;
                    transition: transform 0.2s;
                    cursor: pointer;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .post-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }
                .post-image {
                    width: 100%;
                    height: 250px;
                    object-fit: cover;
                }
                .post-content {
                    padding: 15px;
                }
                .post-author {
                    display: flex;
                    align-items: center;
                    margin-bottom: 10px;
                }
                .author-avatar {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    margin-right: 8px;
                }
                .post-text {
                    color: #E1E1E1;
                    font-size: 14px;
                    line-height: 1.4;
                    margin-bottom: 10px;
                }
                .post-meta {
                    display: flex;
                    justify-content: space-between;
                    color: #888;
                    font-size: 12px;
                }
                .engagement {
                    display: flex;
                    gap: 10px;
                }
            `;
            document.head.appendChild(style);

            trendsContainer.innerHTML = '<div class="posts-grid"></div>';
            const grid = trendsContainer.querySelector('.posts-grid');

            grid.innerHTML = posts.map(post => `
                <div class="post-card" data-post-id="${post.id}">
                    <img 
                        src="${post.media_url}" 
                        alt="${post.alt_text || 'Post image'}" 
                        class="post-image"
                        onerror="this.src='https://via.placeholder.com/300x200?text=Image+Not+Available'"
                    >
                    <div class="post-content">
                        <div class="post-author">
                            <img 
                                src="${post.author?.profile_image_url || 'https://via.placeholder.com/24'}" 
                                alt="${post.author?.username || 'user'}"
                                class="author-avatar"
                            >
                            <span>@${post.author?.username || 'user'}</span>
                        </div>
                        <div class="post-text">${post.query}</div>
                        <div class="post-meta">
                            <div class="engagement">
                                <span>❤️ ${post.tweet_volume}</span>
                                <span>🔄 ${post.post_count}</span>
                            </div>
                            <span>${new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            `).join('');

            // Add click handlers to post cards
            document.querySelectorAll('.post-card').forEach(card => {
                card.addEventListener('click', () => selectPost(card.dataset.postId));
            });

        } catch (error) {
            console.error('Error fetching posts:', error);
            trendsContainer.innerHTML = '<p class="error">Error loading posts. Please try again.</p>';
        }
    }

    // Select a post and show its media
    async function selectPost(postId) {
        try {
            // Update selected state
            document.querySelectorAll('.post-card').forEach(card => {
                card.classList.remove('selected');
                if (card.dataset.postId === postId) {
                    card.classList.add('selected');
                }
            });

            selectedPost = postId;
            const post = document.querySelector(`[data-post-id="${postId}"]`);
            const mediaUrl = post.querySelector('.post-image').src;

            mediaPreview.innerHTML = `
                <img src="${mediaUrl}" alt="Selected media" style="max-width: 100%; border-radius: 12px;">
                <div class="media-controls mt-4">
                    <button class="btn secondary" onclick="processMedia('${postId}')">Process This</button>
                </div>
            `;

        } catch (error) {
            console.error('Error selecting post:', error);
            mediaPreview.innerHTML = '<p class="error">Error loading media. Please try again.</p>';
        }
    }

    // Process selected media
    async function processMedia(mediaId) {
        try {
            const response = await fetch(`/api/trends/${selectedPost}/process`, {
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
                    trendId: selectedPost,
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