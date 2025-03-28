export interface Trend {
  name: string;
  volume: number;
}

export interface TrendAnalysis {
  trendName: string;
  mediaItems: MediaItem[];
  thematicDescription: string;
  processingSuitability: number;
  analysis: {
    theme: string;
    sentiment: string;
    keyElements: string[];
    recommendedCaption: string;
  };
}

export interface Avatar {
  imageUrl: string;
  prompt: string;
}

export interface User {
  id: string;
  username: string;
  profileImageUrl?: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiry: number;
  role?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PersonalizedTrend {
  trend_name: string;
  post_count: number;
  category?: string;
  trending_since: string;
}

export interface TrendMedia {
  mediaUrl: string;
  type: string;
  width: number;
  height: number;
  altText?: string;
}

export interface ProcessedTrend {
  trendName: string;
  mediaItems: TrendMedia[];
  thematicDescription: string;
  processingSuitability: number;
}

export interface MediaItem {
  mediaUrl: string;
  type: string;
  width?: number;
  height?: number;
  altText?: string;
}

export interface MediaSwapResult {
  originalMediaUrl: string;
  modifiedMediaUrl: string;
  caption: string;
}

export interface XPostResult {
  success: boolean;
  postId?: string;
  error?: string;
}

export interface XSearchResult {
  data: any[];
  includes?: {
    media?: any[];
    users?: any[];
    places?: any[];
    polls?: any[];
  };
  meta?: {
    result_count: number;
    newest_id?: string;
    oldest_id?: string;
    next_token?: string;
  };
} 