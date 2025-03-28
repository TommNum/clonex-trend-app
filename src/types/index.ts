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
  id: string;
  name: string;
  query: string;
  tweet_volume: number;
  post_count: number;
  url?: string;
}

export interface TrendMedia {
  mediaUrl: string;
  type: string;
  width: number;
  height: number;
  altText?: string;
}

export interface ProcessedTrend {
  trendId: string;
  trendName: string;
  processingSuitability: number;
  suggestedCaption: string;
  mediaUrl: string;
}

export interface MediaItem {
  mediaUrl: string;
  type: string;
  width?: number;
  height?: number;
  altText?: string;
}

export interface MediaSwapResult {
  url: string;
  caption: string;
  metadata: {
    originalMediaUrl: string;
    processingTime: number;
    aiModel: string;
  };
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