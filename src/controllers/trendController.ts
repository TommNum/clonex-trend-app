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
    const trends = await XApiService.getPersonalizedTrends(req.user.accessToken);
    return res.json({ trends });
  } catch (error) {
    console.error('Error fetching trends:', error);
    return res.status(500).json({ error: 'Failed to fetch trends' });
  }
};

// Analyze a specific trend
export const analyzeTrend = async (req: Request, res: Response) => {
  try {
    const { trendId } = req.params;
    const trends = await XApiService.getPersonalizedTrends(req.user.accessToken);
    const trend = trends.find(t => t.id === trendId);
    
    if (!trend) {
      return res.status(404).json({ error: 'Trend not found' });
    }

    const searchResults = await XApiService.searchTrendMedia(req.user.accessToken, trend);
    const analysis = await OpenAIService.analyzeTrendAndMedia(trend, searchResults);
    return res.json({ analysis });
  } catch (error) {
    console.error('Error analyzing trend:', error);
    return res.status(500).json({ error: 'Failed to analyze trend' });
  }
};

// Process media swap for a trend
export const processMediaSwap = async (req: Request, res: Response) => {
  try {
    if (!req.user.profileImageUrl) {
      return res.status(400).json({ error: 'User profile image not found' });
    }

    const { trendId } = req.params;
    const trends = await XApiService.getPersonalizedTrends(req.user.accessToken);
    const trend = trends.find(t => t.id === trendId);
    
    if (!trend) {
      return res.status(404).json({ error: 'Trend not found' });
    }

    const searchResults = await XApiService.searchTrendMedia(req.user.accessToken, trend);
    const processedTrend: ProcessedTrend = {
      trendId: trend.id,
      trendName: trend.name,
      processingSuitability: 0, // Will be set by analyzeTrendAndMedia
      suggestedCaption: '',
      mediaUrl: ''
    };
    const swappedMedia = await OpenAIService.swapMediaWithAvatar(processedTrend, searchResults, req.user.profileImageUrl!);
    return res.json({ swappedMedia });
  } catch (error) {
    console.error('Error processing media swap:', error);
    return res.status(500).json({ error: 'Failed to process media swap' });
  }
};

// Post media to X
export const postToX = async (req: Request, res: Response) => {
  try {
    const { mediaUrl, caption } = req.body;

    if (!mediaUrl || !caption) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const mediaId = await XApiService.uploadMedia(
      req.user.accessToken,
      mediaUrl
    );

    const tweetId = await XApiService.postTweet(
      req.user.accessToken,
      caption,
      mediaId
    );

    return res.json({
      success: true,
      tweetUrl: `https://x.com/${req.user.username}/status/${tweetId}`
    });
  } catch (error) {
    console.error('Error posting to X:', error);
    return res.status(500).json({ error: 'Failed to post to X' });
  }
};

// Process automated trend analysis and posting
export const autoProcessTrend = async (req: Request, res: Response) => {
  try {
    if (!req.user.profileImageUrl) {
      return res.status(400).json({ error: 'User profile image not found' });
    }

    const { trendId } = req.params;
    const trends = await XApiService.getPersonalizedTrends(req.user.accessToken);
    const trend = trends.find(t => t.id === trendId);
    
    if (!trend) {
      return res.status(404).json({ error: 'Trend not found' });
    }

    let searchResults;
    try {
      searchResults = await XApiService.searchTrendMedia(req.user.accessToken, trend);
    } catch (error) {
      console.error('Error searching trend media:', error);
      return res.status(500).json({ error: 'Failed to search trend media' });
    }

    const processedTrend: ProcessedTrend = {
      trendId: trend.id,
      trendName: trend.name,
      processingSuitability: 0, // Will be set by analyzeTrendAndMedia
      suggestedCaption: '',
      mediaUrl: ''
    };
    const swappedMedia = await OpenAIService.swapMediaWithAvatar(processedTrend, searchResults, req.user.profileImageUrl!);

    const mediaId = await XApiService.uploadMedia(
      req.user.accessToken,
      swappedMedia.url
    );

    const tweetId = await XApiService.postTweet(
      req.user.accessToken,
      swappedMedia.caption,
      mediaId
    );

    return res.json({
      success: true,
      tweetUrl: `https://x.com/${req.user.username}/status/${tweetId}`,
      media: swappedMedia
    });
  } catch (error) {
    console.error('Error in auto process:', error);
    return res.status(500).json({ error: 'Failed to auto process trend' });
  }
}; 