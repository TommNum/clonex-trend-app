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
  async analyzeTrendAndMedia(trend: PersonalizedTrend): Promise<ProcessedTrend> {
    try {
      const prompt = `Analyze this trend: "${trend.trend_name}" with ${trend.post_count} posts. 
      Determine if it's suitable for avatar swapping and provide a thematic description.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
      });

      const analysis = completion.choices[0].message.content || '';
      const suitability = this.calculateSuitability(analysis);

      return {
        trendId: trend.id,
        trendName: trend.trend_name,
        mediaItems: [],
        thematicDescription: analysis,
        processingSuitability: suitability
      };
    } catch (error) {
      console.error('Error analyzing trend:', error);
      throw new Error('Failed to analyze trend');
    }
  }

  private calculateSuitability(analysis: string): number {
    // Implement suitability calculation logic
    return 75; // Placeholder value
  }

  // Swap subject in media with user's avatar
  async swapMediaWithAvatar(processedTrend: ProcessedTrend, avatarImage: Buffer): Promise<MediaSwapResult> {
    if (!processedTrend.mediaItems || processedTrend.mediaItems.length === 0 || processedTrend.processingSuitability < 50) {
      throw new Error('No suitable media found for processing');
    }

    const bestMedia = processedTrend.mediaItems[0];
    const mediaResponse = await axios.get(bestMedia.mediaUrl, { responseType: 'arraybuffer' });
    const mediaBuffer = Buffer.from(mediaResponse.data);

    const mask = await this.generateMask(mediaBuffer);
    const caption = await this.generateCaption(processedTrend);

    const response = await this.openai.images.edit({
      model: "dall-e-2",
      image: mediaBuffer as any,
      mask: mask as any,
      prompt: `Replace the main subject in this image with the provided avatar while maintaining the same style and composition. The avatar should blend naturally with the background.`,
      n: 1,
      size: "1024x1024",
    });

    const modifiedMediaUrl = response.data[0].url;

    return {
      originalMediaUrl: bestMedia.mediaUrl,
      modifiedMediaUrl,
      caption,
      url: modifiedMediaUrl
    };
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

  private async generateMask(imageBuffer: Buffer): Promise<Buffer> {
    // Implement mask generation logic here
    // For now, return a simple black rectangle as placeholder
    return Buffer.from([]);
  }

  private async generateCaption(processedTrend: ProcessedTrend): Promise<string> {
    const prompt = `Generate a witty caption for a social media post about the trend "${processedTrend.trendName}". The post should be engaging and relevant to the trend's theme: ${processedTrend.thematicDescription}`;

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    return completion.choices[0].message.content || "Check out this trend!";
  }

  async generateUserTweet(userTweets: string[]): Promise<string> {
    try {
      const prompt = `You are a tweet generation assistant. Analyze the following tweets from a user and generate a new tweet in their style and voice. The tweet should be authentic, engaging, and feel like it was written by the same person. Here are their recent tweets:

${userTweets.slice(0, 10).join('\n')}

Generate a new tweet that matches their style, tone, and interests. The tweet should be between 100-280 characters.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are a tweet generation assistant that creates authentic, engaging tweets in the user's voice."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 150
      });

      const generatedTweet = completion.choices[0]?.message?.content?.trim();
      if (!generatedTweet) {
        throw new Error('Failed to generate tweet');
      }

      return generatedTweet;
    } catch (error) {
      console.error('Error generating user tweet:', error);
      throw error;
    }
  }
} 