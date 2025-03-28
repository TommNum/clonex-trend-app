import { Request, Response } from 'express';
import XApiService from '../services/xApiService';
import OpenAIService from '../services/openaiService';
import { 
  PersonalizedTrend, 
  ProcessedTrend, 
  MediaSwapResult,
  TrendAnalysis,
  XSearchResult
} from '../types';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const writeFileAsync = promisify(fs.writeFile);

// Get trending data for user
export const getTrends = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized' 
      });
    }

    const trends = await XApiService.getPersonalizedTrends(req.user.accessToken);
    
    // Filter trends with post count > 50
    const significantTrends = trends.filter(trend => trend.post_count > 50);
    
    res.json({ 
      success: true,
      data: { trends: significantTrends }
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch trends',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Analyze a specific trend
export const analyzeTrend = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized' 
      });
    }

    const { trendId } = req.params;
    
    // Get all trends first
    const trends = await XApiService.getPersonalizedTrends(req.user.accessToken);
    const trend = trends.find(t => t.trend_name === trendId);
    
    if (!trend) {
      return res.status(404).json({ 
        success: false,
        message: 'Trend not found' 
      });
    }

    // Search for media related to the trend
    const searchResults = await XApiService.searchTrendMedia(req.user.accessToken, trend);
    
    // Analyze with OpenAI
    const analysis = await OpenAIService.analyzeTrendAndMedia(trend, searchResults);
    
    res.json({ 
      success: true,
      data: { analysis }
    });
  } catch (error) {
    console.error('Error analyzing trend:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to analyze trend',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Process media swap for a trend
export const processMediaSwap = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized' 
      });
    }

    if (!req.user.profileImageUrl) {
      return res.status(400).json({ 
        success: false,
        message: 'User profile image URL is required' 
      });
    }

    const { trendName } = req.params;
    
    // Get all trends first
    const trends = await XApiService.getPersonalizedTrends(req.user.accessToken);
    const trend = trends.find(t => t.trend_name === trendName);
    
    if (!trend) {
      return res.status(404).json({ 
        success: false,
        message: 'Trend not found' 
      });
    }

    // Search for media related to the trend
    const searchResults = await XApiService.searchTrendMedia(req.user.accessToken, trend);
    
    // Analyze with OpenAI
    const analysis = await OpenAIService.analyzeTrendAndMedia(trend, searchResults);
    
    if (analysis.processingSuitability < 50) {
      return res.status(400).json({ 
        success: false,
        message: 'This trend is not suitable for avatar swapping',
        data: { analysis } 
      });
    }

    // Process media swap
    const swapResult = await OpenAIService.swapMediaWithAvatar(
      analysis,
      req.user.profileImageUrl
    );
    
    res.json({ 
      success: true,
      data: { result: swapResult }
    });
  } catch (error) {
    console.error('Error processing media swap:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to process media swap',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Post media to X
export const postToX = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized' 
      });
    }

    const { caption, mediaUrl } = req.body;
    
    if (!caption || !mediaUrl) {
      return res.status(400).json({ 
        success: false,
        message: 'Caption and media URL are required' 
      });
    }

    // Download the media
    const mediaResponse = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
    const mediaBuffer = Buffer.from(mediaResponse.data, 'binary');
    
    // Upload media to X
    const mediaId = await XApiService.uploadMedia(
      req.user.accessToken,
      mediaBuffer,
      'image/jpeg'
    );
    
    // Post tweet with media
    const tweetId = await XApiService.postTweet(
      req.user.accessToken,
      caption,
      [mediaId]
    );
    
    res.json({ 
      success: true,
      data: {
        tweetId,
        tweetUrl: `https://x.com/${req.user.username}/status/${tweetId}`
      }
    });
  } catch (error) {
    console.error('Error posting to X:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to post to X',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Process automated trend analysis and posting
export const autoProcessTrend = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized' 
      });
    }

    if (!req.user.profileImageUrl) {
      return res.status(400).json({ 
        success: false,
        message: 'User profile image URL is required' 
      });
    }

    // 1. Get personalized trends
    const trends = await XApiService.getPersonalizedTrends(req.user.accessToken);
    
    // 2. Filter trends with post count > 50
    const significantTrends = trends.filter(trend => trend.post_count > 50);
    
    if (significantTrends.length === 0) {
      return res.json({ 
        success: true,
        message: 'No significant trends found' 
      });
    }
    
    // 3. Analyze each trend until we find a suitable one
    let suitableTrend: ProcessedTrend | null = null;
    let searchResults: XSearchResult | null = null;
    
    for (const trend of significantTrends.slice(0, 3)) { // Limit to top 3 for efficiency
      searchResults = await XApiService.searchTrendMedia(req.user.accessToken, trend);
      const analysis = await OpenAIService.analyzeTrendAndMedia(trend, searchResults);
      
      if (analysis.processingSuitability >= 70) {
        suitableTrend = analysis;
        break;
      }
    }
    
    if (!suitableTrend) {
      return res.json({ 
        success: true,
        message: 'No suitable trends found for avatar swapping' 
      });
    }
    
    // 4. Process media swap
    const swapResult = await OpenAIService.swapMediaWithAvatar(
      suitableTrend,
      req.user.profileImageUrl
    );
    
    // 5. Post to X
    const mediaResponse = await axios.get(swapResult.modifiedMediaUrl, { responseType: 'arraybuffer' });
    const mediaBuffer = Buffer.from(mediaResponse.data, 'binary');
    
    const mediaId = await XApiService.uploadMedia(
      req.user.accessToken,
      mediaBuffer,
      'image/jpeg'
    );
    
    const tweetId = await XApiService.postTweet(
      req.user.accessToken,
      swapResult.caption,
      [mediaId]
    );
    
    res.json({
      success: true,
      data: {
        tweetId,
        tweetUrl: `https://x.com/${req.user.username}/status/${tweetId}`,
        trendUsed: suitableTrend.trendName,
        caption: swapResult.caption
      }
    });
  } catch (error) {
    console.error('Error in auto-processing trend:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to auto-process trend',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 