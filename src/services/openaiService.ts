import OpenAI from 'openai';
import { PersonalizedTrend, ProcessedTrend, MediaSwapResult } from '../types';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

const writeFileAsync = promisify(fs.writeFile);

export class OpenAIService {
  private openai: OpenAI;
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // Analyze trend and media to determine if it's suitable for avatar swap
  async analyzeTrendAndMedia(trend: PersonalizedTrend, searchResults: any): Promise<ProcessedTrend> {
    const mediaItems = this.extractMediaFromSearchResults(searchResults);
    
    // Skip processing if no media items found
    if (mediaItems.length === 0) {
      return {
        trendName: trend.trend_name,
        mediaItems: [],
        thematicDescription: "No media found for this trend",
        processingSuitability: 0
      };
    }

    const prompt = `
      You are an expert media analyst. You need to analyze trending content on social media.
      
      Trend name: ${trend.trend_name}
      Post count: ${trend.post_count}
      Category: ${trend.category || 'Unknown'}
      
      This trend has ${mediaItems.length} media items associated with it.
      
      Analyze the following aspects:
      1. Is there a clear thematic connection between the media items?
      2. Is there a recognizable subject (person, character, object) in the media that could be replaced with a user's avatar?
      3. Would this replacement make sense contextually and be humorous/engaging?
      4. Rate the overall suitability of this trend for avatar replacement on a scale of 0-100.
      
      Media descriptions: ${JSON.stringify(mediaItems)}
      
      Provide a brief thematic description of what these media items represent and why they might be trending.
      Format your response as JSON with the following structure:
      {
        "thematicDescription": "Description of the thematic elements",
        "processingSuitability": <number between 0-100>,
        "rationale": "Explanation for the suitability score"
      }
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [{
          role: "system",
          content: "You are an expert media analyst who evaluates social media trends and their associated media."
        }, {
          role: "user",
          content: prompt
        }],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        trendName: trend.trend_name,
        mediaItems,
        thematicDescription: result.thematicDescription || "No description available",
        processingSuitability: result.processingSuitability || 0
      };
    } catch (error) {
      console.error('Error analyzing trend and media:', error);
      return {
        trendName: trend.trend_name,
        mediaItems,
        thematicDescription: "Error analyzing trend",
        processingSuitability: 0
      };
    }
  }

  // Swap subject in media with user's avatar
  async swapMediaWithAvatar(processedTrend: ProcessedTrend, searchResults: any[], userAvatarUrl: string): Promise<MediaSwapResult> {
    if (searchResults.length === 0 || processedTrend.processingSuitability < 50) {
      throw new Error('This trend is not suitable for avatar swapping');
    }

    // Select the best media item for swapping
    const selectedMedia = searchResults[0];
    const originalMediaUrl = selectedMedia.mediaUrl;

    try {
      // Download the original media
      const response = await axios.get(originalMediaUrl, { responseType: 'arraybuffer' });
      const mediaBuffer = Buffer.from(response.data);

      // Process the media with OpenAI
      const result = await this.openai.images.edit({
        image: mediaBuffer,
        mask: await this.generateMask(mediaBuffer),
        prompt: `Replace the main subject with a user's avatar image. The avatar should be seamlessly integrated into the scene.`,
        n: 1,
        size: "1024x1024"
      });

      const modifiedMediaUrl = result.data[0].url;

      // Generate a caption for the post
      const caption = await this.generateCaption(processedTrend);

      return {
        originalMediaUrl,
        modifiedMediaUrl,
        caption
      };
    } catch (error) {
      console.error('Error swapping media with avatar:', error);
      throw new Error('Failed to swap media with avatar');
    }
  }

  // Helper to extract media items from search results
  private extractMediaFromSearchResults(searchResults: any) {
    const mediaItems = [];
    
    // Check if search results and includes exist
    if (!searchResults?.includes?.media || !searchResults?.data) {
      return [];
    }
    
    // Create a map of media items
    const mediaMap = searchResults.includes.media.reduce((acc: any, media: any) => {
      acc[media.media_key] = {
        mediaUrl: media.url || media.preview_image_url,
        type: media.type,
        width: media.width,
        height: media.height,
        altText: media.alt_text
      };
      return acc;
    }, {});
    
    // Match tweets to their media
    for (const tweet of searchResults.data) {
      if (tweet.attachments?.media_keys) {
        for (const mediaKey of tweet.attachments.media_keys) {
          if (mediaMap[mediaKey]) {
            mediaItems.push(mediaMap[mediaKey]);
          }
        }
      }
    }
    
    return mediaItems;
  }
}

export default new OpenAIService(); 