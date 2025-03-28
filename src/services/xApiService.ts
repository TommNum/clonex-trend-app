import axios from 'axios';
import crypto from 'crypto';
import { User, PersonalizedTrend, TrendMedia } from '../types';

export class XApiService {
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;
  private callbackUrl: string;

  constructor() {
    this.baseUrl = process.env.X_API_BASE_URL || 'https://api.twitter.com/1.1';
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
      const response = await axios.get(`${this.baseUrl}/trends/place.json?id=1`, {
        headers: this.getHeaders(accessToken)
      });

      return response.data[0].trends.map((trend: any) => ({
        id: trend.query.replace(/^#/, ''),
        name: trend.name,
        query: trend.query,
        tweet_volume: trend.tweet_volume || 0,
        post_count: trend.tweet_volume || 0,
        url: trend.url
      }));
    } catch (error) {
      console.error('Error fetching trends:', error);
      throw error;
    }
  }

  // Search for trend-related media
  async searchTrendMedia(accessToken: string, trend: PersonalizedTrend): Promise<any[]> {
    try {
      const searchQuery = `${trend.name} has:media has:images filter:images min_retweets:100 min_faves:1000`;
      const response = await axios.get(`${this.baseUrl}/search/tweets.json`, {
        params: {
          q: searchQuery,
          count: 100,
          result_type: 'popular',
          include_entities: true
        },
        headers: this.getHeaders(accessToken)
      });

      return response.data.statuses
        .filter((tweet: any) => tweet.entities?.media?.length > 0)
        .map((tweet: any) => ({
          media_url: tweet.entities.media[0].media_url_https,
          tweet_id: tweet.id_str,
          engagement: tweet.retweet_count + tweet.favorite_count
        }));
    } catch (error) {
      console.error('Error searching media:', error);
      throw error;
    }
  }

  // Post a tweet with media
  async postTweet(accessToken: string, text: string, mediaId: string): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/statuses/update.json`,
        {
          status: text,
          media_ids: [mediaId]
        },
        {
          headers: this.getHeaders(accessToken)
        }
      );

      return response.data.id_str;
    } catch (error) {
      console.error('Error posting tweet:', error);
      throw error;
    }
  }

  // Upload media to X
  async uploadMedia(accessToken: string, mediaUrl: string): Promise<string> {
    try {
      const response = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
      const mediaBuffer = Buffer.from(response.data);
      const mimeType = response.headers['content-type'] || 'image/jpeg';

      const formData = new FormData();
      formData.append('media', mediaBuffer, 'media.jpg');

      const uploadResponse = await axios.post(
        `${this.baseUrl}/media/upload.json`,
        formData,
        {
          headers: {
            ...this.getHeaders(accessToken),
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return uploadResponse.data.media_id_string;
    } catch (error) {
      console.error('Error uploading media:', error);
      throw error;
    }
  }

  async exchangeCodeForToken(code: string, codeVerifier: string): Promise<{
    id: string;
    username: string;
    accessToken: string;
    refreshToken: string;
    tokenExpiry: number;
  }> {
    const tokens = await this.getTokens(code, codeVerifier);
    const userInfo = await this.getUserInfo(tokens.accessToken);
    
    return {
      id: userInfo.id,
      username: userInfo.username,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenExpiry: Math.floor(Date.now() / 1000) + tokens.expiresIn
    };
  }

  async getTrendingTopics(accessToken: string): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/trends/place.json?id=1`, {
        headers: this.getHeaders(accessToken)
      });
      return response.data[0].trends;
    } catch (error) {
      console.error('Error fetching trending topics:', error);
      throw error;
    }
  }

  private getHeaders(accessToken: string) {
    return {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
  }
}

export default new XApiService(); 