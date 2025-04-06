document.addEventListener('DOMContentLoaded', () => {
    const refreshTimelineBtn = document.getElementById('refreshTrends');
    const timelineContainer = document.getElementById('trendsContainer');
    const mediaPreview = document.getElementById('mediaPreview');
    const processResult = document.getElementById('processResult');
    const resultImage = document.getElementById('resultImage');
    const captionInput = document.getElementById('caption');
    const postToXBtn = document.getElementById('postToX');

    // Check if required elements exist
    if (!timelineContainer) {
        console.error('Timeline container not found');
        return;
    }

    let selectedPost = null;

    // Add global styles to fix layout
    const globalStyle = document.createElement('style');
    globalStyle.textContent = `
        /* Reset container constraints */
        .container, 
        .max-w-7xl,
        .dashboard-content {
            max-width: none !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
        }

        /* Main content area */
        main {
            margin-left: 256px !important;
            width: calc(100% - 256px) !important;
            padding: 2rem !important;
        }

        /* Grid layout styles */
        .timeline-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            padding: 20px;
            width: 100%;
        }

        .post-card {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            overflow: hidden;
            transition: transform 0.2s;
            cursor: pointer;
            border: 1px solid rgba(255, 255, 255, 0.1);
            height: fit-content;
        }

        .post-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .post-image {
            width: 100%;
            aspect-ratio: 16/9;
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

        .selected {
            border: 2px solid #1DA1F2;
        }
    `;
    document.head.appendChild(globalStyle);

    // Add click handler for refresh button
    if (refreshTimelineBtn) {
        refreshTimelineBtn.addEventListener('click', fetchTimeline);
    }

    // Add click handler for post button
    if (postToXBtn) {
        postToXBtn.addEventListener('click', postToX);
    }

    // Function to render posts
    function renderPosts(posts) {
        if (!Array.isArray(posts) || !posts.length) {
            timelineContainer.innerHTML = '<p>No posts found. Try refreshing!</p>';
            return;
        }

        timelineContainer.innerHTML = '<div class="timeline-grid"></div>';
        const grid = timelineContainer.querySelector('.timeline-grid');

        if (!grid) {
            console.error('Grid container not found');
            return;
        }

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
                            <span>❤️ ${post.tweet_volume || 0}</span>
                            <span>🔄 ${post.post_count || 0}</span>
                        </div>
                        <span>${post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Unknown date'}</span>
                    </div>
                </div>
            </div>
        `).join('');

        // Add click handlers to post cards
        document.querySelectorAll('.post-card').forEach(card => {
            card.addEventListener('click', () => selectPost(card.dataset.postId));
        });
    }

    // Fetch and display timeline
    async function fetchTimeline() {
        try {
            timelineContainer.innerHTML = '<p class="loading">Loading timeline...</p>';
            const response = await fetch('/api/timeline');
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            const posts = await response.json();
            console.log('Timeline posts received:', posts);
            renderPosts(posts);

        } catch (error) {
            console.error('Error fetching timeline:', error);
            timelineContainer.innerHTML = '<p class="error">Error loading timeline. Please try again.</p>';
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

    // Handle posting generated tweet
    const postGeneratedTweetBtn = document.getElementById('postGeneratedTweet');
    if (postGeneratedTweetBtn) {
        postGeneratedTweetBtn.addEventListener('click', async () => {
            const tweet = postGeneratedTweetBtn.dataset.tweet;
            if (!tweet) return;

            try {
                const response = await fetch('/api/tweets', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ text: tweet }),
                });

                if (response.ok) {
                    alert('Tweet posted successfully!');
                    // Optionally refresh the timeline
                    await fetchTimeline();
                } else {
                    throw new Error('Failed to post tweet');
                }
            } catch (error) {
                console.error('Error posting tweet:', error);
                alert('Failed to post tweet. Please try again.');
            }
        });
    }

    // Handle refreshing generated tweet
    const refreshGeneratedTweetBtn = document.getElementById('refreshGeneratedTweet');
    if (refreshGeneratedTweetBtn) {
        refreshGeneratedTweetBtn.addEventListener('click', async () => {
            try {
                // Show loading state
                refreshGeneratedTweetBtn.disabled = true;
                refreshGeneratedTweetBtn.innerHTML = `
                    <svg class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Regenerating...
                `;

                const response = await fetch('/api/regenerate-tweet', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    // Update the tweet text
                    document.querySelector('.bg-gray-50 p').textContent = data.tweet;
                    // Update the post button's data attribute
                    postGeneratedTweetBtn.dataset.tweet = data.tweet;
                } else {
                    throw new Error('Failed to regenerate tweet');
                }
            } catch (error) {
                console.error('Error regenerating tweet:', error);
                alert('Failed to regenerate tweet. Please try again.');
            } finally {
                // Reset button state
                refreshGeneratedTweetBtn.disabled = false;
                refreshGeneratedTweetBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Regenerate
                `;
            }
        });
    }

    // Initialize the timeline
    fetchTimeline();
}); 

async function regenerateTweet() {
    try {
        const response = await fetch('/api/regenerate-tweet', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to regenerate tweet');
        }

        const data = await response.json();
        const tweetElement = document.querySelector('.bg-gray-50 p-4');
        if (tweetElement) {
            tweetElement.textContent = data.tweet;
        }
    } catch (error) {
        console.error('Error regenerating tweet:', error);
        alert('Failed to regenerate tweet. Please try again.');
    }
} 