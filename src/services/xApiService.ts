import axios from 'axios';
import crypto from 'crypto';
import { User, PersonalizedTrend, TrendMedia } from '../types';

export class XApiService {
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;
  private callbackUrl: string;
  private client: any;

  constructor() {
    this.baseUrl = 'https://api.twitter.com/2';
    this.clientId = process.env.X_CLIENT_ID || '';
    this.clientSecret = process.env.X_CLIENT_SECRET || '';

    // Format callback URL properly
    let callbackUrl = process.env.X_CALLBACK_URL || '';
    if (!callbackUrl) {
      callbackUrl = `${process.env.RAILWAY_PUBLIC_DOMAIN || 'http://localhost:3000'}/auth/callback`;
    }

    // Remove any @ symbol if present
    this.callbackUrl = callbackUrl.replace(/^@/, '');

    if (!this.clientId || !this.clientSecret) {
      throw new Error('X API credentials not configured');
    }

    console.log('XApiService initialized with:', {
      baseUrl: this.baseUrl,
      clientId: this.clientId ? '***' + this.clientId.slice(-4) : 'not set',
      callbackUrl: this.callbackUrl
    });

    this.client = axios.create({
      baseURL: this.baseUrl,
    });
  }

  // Generate OAuth 2.0 authorization URL with PKCE
  generateAuthUrl(): { url: string, codeVerifier: string } {
    if (!this.callbackUrl) {
      throw new Error('Callback URL not configured');
    }

    // Generate code verifier (32 bytes = 256 bits)
    const codeVerifier = crypto.randomBytes(32)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    // Generate code challenge using S256 method
    const codeChallenge = crypto.createHash('sha256')
      .update(codeVerifier)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    // Generate state for CSRF protection
    const state = crypto.randomBytes(16).toString('hex');

    const authUrl = new URL('https://x.com/i/oauth2/authorize');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', this.clientId);
    authUrl.searchParams.append('redirect_uri', this.callbackUrl);
    authUrl.searchParams.append('scope', 'tweet.read users.read offline.access');
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
    if (!this.callbackUrl) {
      throw new Error('Callback URL not configured');
    }

    // Create Basic Auth header for confidential client
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    const params = new URLSearchParams();
    params.append('code', code);
    params.append('grant_type', 'authorization_code');
    params.append('redirect_uri', this.callbackUrl);
    params.append('code_verifier', codeVerifier);

    try {
      const response = await axios.post('https://api.x.com/2/oauth2/token', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${auth}`
        },
      });

      if (!response.data.access_token) {
        throw new Error('No access token in response');
      }

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
      };
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        throw new Error(`Failed to exchange code for tokens: ${error.response?.data?.error_description || error.response?.data?.error || 'Unknown error'}`);
      }
      throw error;
    }
  }

  // Refresh access token using refresh token
  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    expiresIn: number;
  }> {
    // Create Basic Auth header for confidential client
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    const params = new URLSearchParams();
    params.append('refresh_token', refreshToken);
    params.append('grant_type', 'refresh_token');

    try {
      const response = await axios.post('https://api.x.com/2/oauth2/token', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${auth}`
        },
      });

      if (!response.data.access_token) {
        throw new Error('No access token in response');
      }

      return {
        accessToken: response.data.access_token,
        expiresIn: response.data.expires_in,
      };
    } catch (error) {
      console.error('Error refreshing token:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        throw new Error(`Failed to refresh token: ${error.response?.data?.error_description || error.response?.data?.error || 'Unknown error'}`);
      }
      throw error;
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
          'personalized_trend.fields': 'category,post_count,trend_name,trending_since'
        }
      });

      if (!response.data?.data) {
        console.error('[X API] Invalid response format');
        throw new Error('Invalid response format from X API');
      }

      return response.data.data.map((trend: any) => ({
        id: trend.trend_name,
        name: trend.trend_name,
        query: trend.trend_name,
        tweet_volume: trend.post_count || 0,
        post_count: trend.post_count || 0,
        url: `https://x.com/search?q=${encodeURIComponent(trend.trend_name)}`
      }));
    } catch (error) {
      console.error('[X API] Error:', error instanceof Error ? error.message : 'Unknown error');
      if (axios.isAxiosError(error)) {
        console.error('[X API] Response:', error.response?.data);
      }
      throw error;
    }
  }

  // Search for trend-related media
  async searchTrendMedia(accessToken: string, trend: PersonalizedTrend): Promise<TrendMedia[]> {
    try {
      const searchQuery = `${trend.trend_name} has:media has:images filter:images min_retweets:100 min_faves:1000`;
      const response = await this.client.get('tweets/search/recent', {
        params: {
          query: searchQuery,
          'tweet.fields': 'attachments,entities,media',
          'media.fields': 'url,preview_image_url,width,height,variants',
          expansions: 'attachments.media_keys',
        },
        headers: this.getHeaders(accessToken)
      });

      return this.processMediaItems(response.data);
    } catch (error) {
      console.error('Error searching trend media:', error);
      return [];
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
  async uploadMedia(accessToken: string, mediaBuffer: Buffer): Promise<string> {
    try {
      const formData = new FormData();
      const blob = new Blob([mediaBuffer], { type: 'image/jpeg' });
      formData.append('media', blob, 'media.jpg');

      const response = await this.client.post('media/upload', formData, {
        headers: {
          ...this.getHeaders(accessToken),
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.media_id_string;
    } catch (error) {
      console.error('Error uploading media:', error);
      throw new Error('Failed to upload media');
    }
  }

  // Revoke access token
  async revokeToken(token: string): Promise<void> {
    // Create Basic Auth header for confidential client
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    const params = new URLSearchParams();
    params.append('token', token);
    params.append('client_id', this.clientId);

    try {
      await axios.post('https://api.x.com/2/oauth2/revoke', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${auth}`
        },
      });
    } catch (error) {
      console.error('Error revoking token:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        throw new Error(`Failed to revoke token: ${error.response?.data?.error_description || error.response?.data?.error || 'Unknown error'}`);
      }
      throw error;
    }
  }

  private getHeaders(accessToken: string) {
    return {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  private processMediaItems(data: any): TrendMedia[] {
    // Implementation of media processing
    return [];
  }
}

export default new XApiService();