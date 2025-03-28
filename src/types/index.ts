export interface Trend {
  id: string;
  name: string;
  trend_name?: string;
  volume: number;
  post_count?: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrendAnalysis {
  trendId: string;
  analysis: string;
  mediaItems: TrendMedia[];
  processingSuitability: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Avatar {
  imageUrl: string;
  prompt: string;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  profileImageUrl?: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiry: number;
  role: 'user' | 'admin';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PersonalizedTrend {
  id: string;
  name: string;
  query: string;
  tweet_volume: number;
  post_count: number;
  url: string;
  trend_name?: string;
}

export interface TrendMedia {
  mediaUrl: string;
  type: string;
  width?: number;
  height?: number;
  altText?: string;
  url?: string;
  variants?: {
    bitrate?: number;
    content_type: string;
    url: string;
  }[];
}

export interface ProcessedTrend {
  trendId: string;
  trendName: string;
  mediaItems: TrendMedia[];
  thematicDescription: string;
  processingSuitability: number;
  analysis?: {
    theme: string;
    sentiment: string;
    keyElements: string[];
    recommendedCaption: string;
  };
}

export interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  thumbnailUrl?: string;
  createdAt: Date;
  source: string;
}

export interface MediaSwapResult {
  originalMediaUrl: string;
  modifiedMediaUrl: string;
  caption: string;
  url: string;
}

export interface XPostResult {
  id: string;
  text: string;
  created_at: string;
}

export interface XSearchResult {
  data: {
    id: string;
    text: string;
    attachments?: {
      media_keys: string[];
    };
  }[];
  includes?: {
    media: {
      media_key: string;
      type: string;
      url: string;
      preview_image_url?: string;
      width: number;
      height: number;
      variants?: {
        bit_rate?: number;
        content_type: string;
        url: string;
      }[];
    }[];
  };
} 