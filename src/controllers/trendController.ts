import { Request, Response } from 'express';
import { XApiService } from '../services/xApiService';
import { OpenAIService } from '../services/openaiService';
import {
  PersonalizedTrend,
  ProcessedTrend,
  MediaSwapResult,
  TrendAnalysis,
  XSearchResult,
  User
} from '../types';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const writeFileAsync = promisify(fs.writeFile);
const xApiService = new XApiService();
const openAIService = new OpenAIService();

// Add type for authenticated request
export interface AuthenticatedRequest extends Request {
  user?: User;
}

// Ensure user is authenticated before proceeding
const ensureAuthenticated = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?.accessToken) {
    res.status(401).json({ error: 'User not authenticated' });
    return false;
  }
  return true;
};

// Get trending data for user
export const getTrends = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!ensureAuthenticated(req, res)) return;

    const trends = await xApiService.getPersonalizedTrends(req.user!.accessToken);
    res.json(trends);
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
};

export const getTimeline = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!ensureAuthenticated(req, res)) return;

    const timeline = await xApiService.getUserTimeline(req.user!.accessToken, req.user!.id);
    res.json(timeline);
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({ error: 'Failed to fetch timeline' });
  }
};

// Search last trend
export const searchLastTrend = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.session?.user?.accessToken) {
      res.status(401).json({ error: 'No access token available' });
      return;
    }

    // Get the last trend from local storage
    const lastTrend = await getLastTrendFromStorage();
    if (!lastTrend) {
      res.status(404).json({ error: 'No previous trend found' });
      return;
    }

    // Search for tweets related to the last trend
    const searchResults = await xApiService.searchTrendMedia(req.session.user.accessToken, lastTrend);

    // Process with OpenAI
    const processedTrend = await openAIService.analyzeTrendAndMedia(lastTrend);
    processedTrend.mediaItems = searchResults;

    res.json(processedTrend);
  } catch (error) {
    console.error('Error searching last trend:', error);
    res.status(500).json({ error: 'Failed to search last trend' });
  }
};

// Store last trend in local storage
async function getLastTrendFromStorage(): Promise<PersonalizedTrend | null> {
  try {
    const data = await fs.promises.readFile(path.join(__dirname, '../data/lastTrend.json'), 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading last trend:', error);
    return null;
  }
}

// Store last trend in local storage
async function storeLastTrend(trend: PersonalizedTrend): Promise<void> {
  try {
    await fs.promises.mkdir(path.join(__dirname, '../data'), { recursive: true });
    await fs.promises.writeFile(
      path.join(__dirname, '../data/lastTrend.json'),
      JSON.stringify(trend, null, 2)
    );
  } catch (error) {
    console.error('Error storing last trend:', error);
  }
}

// Analyze a specific trend
export const getTrendDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { trendId } = req.params;
    const trends = await xApiService.getPersonalizedTrends(req.user.accessToken);
    const trend = trends.find(t => t.id === trendId);

    if (!trend) {
      res.status(404).json({ error: 'Trend not found' });
      return;
    }

    const searchResults = await xApiService.searchTrendMedia(req.user.accessToken, trend);
    const processedTrend = await openAIService.analyzeTrendAndMedia(trend);
    processedTrend.mediaItems = searchResults;

    res.json(processedTrend);
  } catch (error) {
    console.error('Error fetching trend details:', error);
    res.status(500).json({ error: 'Failed to fetch trend details' });
  }
};

// Process media swap for a trend
export const swapTrendMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { trendId } = req.params;
    const trends = await xApiService.getPersonalizedTrends(req.user.accessToken);
    const trend = trends.find(t => t.id === trendId);

    if (!trend) {
      res.status(404).json({ error: 'Trend not found' });
      return;
    }

    const searchResults = await xApiService.searchTrendMedia(req.user.accessToken, trend);
    const processedTrend = await openAIService.analyzeTrendAndMedia(trend);
    processedTrend.mediaItems = searchResults;

    if (!req.user.profileImageUrl) {
      res.status(400).json({ error: 'User profile image not found' });
      return;
    }

    const avatarResponse = await axios.get(req.user.profileImageUrl, { responseType: 'arraybuffer' });
    const avatarBuffer = Buffer.from(avatarResponse.data);

    const swappedMedia = await openAIService.swapMediaWithAvatar(processedTrend, avatarBuffer);
    const mediaBuffer = await axios.get(swappedMedia.modifiedMediaUrl, { responseType: 'arraybuffer' }).then(r => Buffer.from(r.data));
    const mediaId = await xApiService.uploadMedia(req.user.accessToken, mediaBuffer);

    res.json({
      originalMediaUrl: swappedMedia.originalMediaUrl,
      modifiedMediaUrl: swappedMedia.modifiedMediaUrl,
      caption: swappedMedia.caption,
      mediaId
    });
  } catch (error) {
    console.error('Error swapping trend media:', error);
    res.status(500).json({ error: 'Failed to swap trend media' });
  }
};

// Post media to X
export const postToX = async (req: Request, res: Response) => {
  try {
    const { mediaUrl, caption } = req.body;

    if (!mediaUrl || !caption) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const mediaId = await xApiService.uploadMedia(
      req.user.accessToken,
      mediaUrl
    );

    const tweetId = await xApiService.postTweet(
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
export const autoProcessTrend = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user.profileImageUrl) {
      res.status(400).json({ error: 'User profile image not found' });
      return;
    }

    const { trendId } = req.params;
    const trends = await xApiService.getPersonalizedTrends(req.user.accessToken);
    const trend = trends.find(t => t.id === trendId);

    if (!trend) {
      res.status(404).json({ error: 'Trend not found' });
      return;
    }

    const searchResults = await xApiService.searchTrendMedia(req.user.accessToken, trend);
    const processedTrend = await openAIService.analyzeTrendAndMedia(trend);
    processedTrend.mediaItems = searchResults;

    const avatarResponse = await axios.get(req.user.profileImageUrl, { responseType: 'arraybuffer' });
    const avatarBuffer = Buffer.from(avatarResponse.data);

    const swappedMedia = await openAIService.swapMediaWithAvatar(processedTrend, avatarBuffer);
    const mediaBuffer = await axios.get(swappedMedia.modifiedMediaUrl, { responseType: 'arraybuffer' }).then(r => Buffer.from(r.data));
    const mediaId = await xApiService.uploadMedia(req.user.accessToken, mediaBuffer);

    res.json({
      success: true,
      tweetUrl: `https://x.com/${req.user.username}/status/${mediaId}`,
      media: swappedMedia
    });
  } catch (error) {
    console.error('Error in auto process:', error);
    res.status(500).json({ error: 'Failed to auto process trend' });
  }
};

export const searchTrendMedia = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!ensureAuthenticated(req, res)) return;

    const trend = req.body as PersonalizedTrend;
    if (!trend) {
      res.status(400).json({ error: 'No trend data provided' });
      return;
    }

    const searchResults = await xApiService.searchTrendMedia(req.user!.accessToken, trend);
    res.json(searchResults);
  } catch (error) {
    console.error('Error searching trend media:', error);
    res.status(500).json({ error: 'Failed to search trend media' });
  }
};

export const swapMedia = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!ensureAuthenticated(req, res)) return;

    if (!req.user.profileImageUrl) {
      res.status(400).json({ error: 'No profile image available' });
      return;
    }

    const trend = req.body as PersonalizedTrend;
    if (!trend) {
      res.status(400).json({ error: 'No trend data provided' });
      return;
    }

    const avatarResponse = await axios.get(req.user.profileImageUrl, { responseType: 'arraybuffer' });
    const mediaBuffer = Buffer.from(avatarResponse.data);

    const mediaId = await xApiService.uploadMedia(req.user.accessToken, mediaBuffer);
    if (!mediaId) {
      res.status(500).json({ error: 'Failed to upload media' });
      return;
    }

    const tweetText = `Check out this trend: ${trend.name}`;
    const tweetId = await xApiService.postTweet(
      req.user.accessToken,
      tweetText,
      mediaId
    );

    res.json({
      success: true,
      tweetUrl: `https://x.com/${req.user.username}/status/${tweetId}`
    });
  } catch (error) {
    console.error('Error swapping media:', error);
    res.status(500).json({ error: 'Failed to swap media' });
  }
};

export const generatePost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!ensureAuthenticated(req, res)) return;

    if (!req.user.profileImageUrl) {
      res.status(400).json({ error: 'No profile image available' });
      return;
    }

    const trend = req.body as PersonalizedTrend;
    if (!trend) {
      res.status(400).json({ error: 'No trend data provided' });
      return;
    }

    const avatarResponse = await axios.get(req.user.profileImageUrl, { responseType: 'arraybuffer' });
    const mediaBuffer = Buffer.from(avatarResponse.data);

    const mediaId = await xApiService.uploadMedia(req.user.accessToken, mediaBuffer);
    if (!mediaId) {
      res.status(500).json({ error: 'Failed to upload media' });
      return;
    }

    res.json({
      success: true,
      tweetUrl: `https://x.com/${req.user.username}/status/${mediaId}`,
      mediaId
    });
  } catch (error) {
    console.error('Error generating post:', error);
    res.status(500).json({ error: 'Failed to generate post' });
  }
}; 