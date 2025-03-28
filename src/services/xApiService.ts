import axios from 'axios';
import crypto from 'crypto';
import { User, PersonalizedTrend, TrendMedia } from '../types';

export class XApiService {
  private clientId: string;
  private clientSecret: string;
  private callbackUrl: string;

  constructor() {
    this.clientId = process.env.X_CLIENT_ID || '';
    this.clientSecret = process.env.X_CLIENT_SECRET || '';
    this.callbackUrl = process.env.X_CALLBACK_URL || '';
  }

  // Generate OAuth 2.0 authorization URL with PKCE
  generateAuthUrl(): { url: string, codeVerifier: string } {
    const codeVerifier = crypto.randomBytes(32).toString('hex');
    const codeChallenge = crypto.createHash('sha256')
      .update(codeVerifier)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    const state = crypto.randomBytes(16).toString('hex');
    
    const authUrl = new URL('https://x.com/i/oauth2/authorize');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', this.clientId);
    authUrl.searchParams.append('redirect_uri', this.callbackUrl);
    authUrl.searchParams.append('scope', 'tweet.read tweet.write users.read offline.access');
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('code_challenge', codeChallenge);
    authUrl.searchParams.append('code_challenge_method', 'S256');

    return { url: authUrl.toString(), codeVerifier };
  }

  // Exchange authorization code for tokens
  async getTokens(code: string, codeVerifier: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    const params = new URLSearchParams();
    params.append('code', code);
    params.append('grant_type', 'authorization_code');
    params.append('client_id', this.clientId);
    params.append('redirect_uri', this.callbackUrl);
    params.append('code_verifier', codeVerifier);

    try {
      const response = await axios.post('https://api.x.com/2/oauth2/token', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
      };
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw new Error('Failed to exchange code for tokens');
    }
  }

  // Refresh access token using refresh token
  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    expiresIn: number;
  }> {
    const params = new URLSearchParams();
    params.append('refresh_token', refreshToken);
    params.append('grant_type', 'refresh_token');
    params.append('client_id', this.clientId);

    try {
      const response = await axios.post('https://api.x.com/2/oauth2/token', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return {
        accessToken: response.data.access_token,
        expiresIn: response.data.expires_in,
      };
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw new Error('Failed to refresh token');
    }
  }

  // Get user information
  async getUserInfo(accessToken: string): Promise<{
    id: string;
    username: string;
    profileImageUrl: string;
  }> {
    try {
      const response = await axios.get('https://api.x.com/2/users/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        params: {
          'user.fields': 'profile_image_url,username',
        },
      });

      return {
        id: response.data.data.id,
        username: response.data.data.username,
        profileImageUrl: response.data.data.profile_image_url,
      };
    } catch (error) {
      console.error('Error getting user info:', error);
      throw new Error('Failed to get user information');
    }
  }

  // Get personalized trends for user
  async getPersonalizedTrends(accessToken: string): Promise<PersonalizedTrend[]> {
    try {
      const response = await axios.get('https://api.x.com/2/users/personalized_trends', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        params: {
          'personalized_trend.fields': 'category,post_count,trend_name,trending_since',
        },
      });

      return response.data.data;
    } catch (error) {
      console.error('Error fetching personalized trends:', error);
      throw new Error('Failed to fetch personalized trends');
    }
  }

  // Search for trend-related media
  async searchTrendMedia(accessToken: string, trend: PersonalizedTrend): Promise<any> {
    try {
      const searchQuery = `${trend.trend_name} since_id:${trend.trending_since} has:media has:images filter:images min_retweets:100 min_faves:1000`;
      
      const response = await axios.get('https://api.x.com/2/tweets/search/recent', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        params: {
          'query': searchQuery,
          'tweet.fields': 'public_metrics,attachments,entities,created_at,author_id',
          'media.fields': 'url,preview_image_url,alt_text,type,width,height',
          'expansions': 'attachments.media_keys,author_id',
          'user.fields': 'profile_image_url,username',
          'max_results': 25,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error searching trend media:', error);
      throw new Error('Failed to search for trend media');
    }
  }

  // Post a tweet with media
  async postTweet(accessToken: string, text: string, mediaIds: string[]): Promise<string> {
    try {
      const payload: any = { text };
      
      if (mediaIds && mediaIds.length > 0) {
        payload.media = { media_ids: mediaIds };
      }
      
      const response = await axios.post('https://api.x.com/2/tweets', payload, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data.data.id;
    } catch (error) {
      console.error('Error posting tweet:', error);
      throw new Error('Failed to post tweet');
    }
  }

  // Upload media to X
  async uploadMedia(accessToken: string, mediaBuffer: Buffer, mimeType: string): Promise<string> {
    try {
      // Initialize upload
      const initResponse = await axios.post('https://upload.x.com/1.1/media/upload.json', {
        command: 'INIT',
        total_bytes: mediaBuffer.length,
        media_type: mimeType,
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const mediaId = initResponse.data.media_id_string;

      // Upload media in chunks
      const chunkSize = 1000000; // 1MB chunks
      for (let i = 0; i < mediaBuffer.length; i += chunkSize) {
        const chunk = mediaBuffer.slice(i, i + chunkSize);
        await axios.post('https://upload.x.com/1.1/media/upload.json', {
          command: 'APPEND',
          media_id: mediaId,
          segment_index: Math.floor(i / chunkSize),
          media_data: chunk.toString('base64'),
        }, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
      }

      // Finalize upload
      await axios.post('https://upload.x.com/1.1/media/upload.json', {
        command: 'FINALIZE',
        media_id: mediaId,
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      return mediaId;
    } catch (error) {
      console.error('Error uploading media:', error);
      throw new Error('Failed to upload media');
    }
  }
}

export default new XApiService(); 