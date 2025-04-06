import OpenAI from 'openai';
import { PersonalizedTrend, ProcessedTrend, MediaSwapResult } from '../types';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

const writeFileAsync = promisify(fs.writeFile);

// Helper function to extract tweet from OpenAI response
function extractTweetFromResponse(response: string): string {
  const tweetMatch = response.match(/"([^"]+)"/);
  return tweetMatch ? tweetMatch[1] : response;
}

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
      const prompt = `Analyze this trend and its associated media:
Trend: ${trend.name}
Media URL: ${trend.media_url}
Author: ${trend.author.name} (@${trend.author.username})
Tweet: ${trend.text}

Please provide:
1. A brief analysis of the trend's content and context
2. The main theme or topic
3. The emotional tone
4. Key visual elements in the media
5. A score from 0-100 indicating how suitable this content is for processing into an avatar (considering visual quality, relevance, and uniqueness)`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are a trend analysis assistant that evaluates social media content for avatar generation suitability."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const analysis = completion.choices[0]?.message?.content || "No analysis available";
      const processingSuitability = this.extractProcessingScore(analysis);

      // Parse the analysis to extract structured data
      const themeMatch = analysis.match(/Theme or topic: (.*?)(?:\n|$)/i);
      const sentimentMatch = analysis.match(/Emotional tone: (.*?)(?:\n|$)/i);
      const elementsMatch = analysis.match(/Key visual elements: (.*?)(?:\n|$)/i);

      return {
        trendId: trend.id,
        trendName: trend.name,
        thematicDescription: analysis,
        processingSuitability,
        mediaItems: []
      };
    } catch (error) {
      console.error('Error analyzing trend:', error);
      throw error;
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
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `
            You are a Tone Analysis Specialist who examines HOW people SOUND in their writing.
    
    YOUR MISSION:
    Analyze a user's tweets to extract their unique TONE, VOICE, and PERSONALITY.
    
    ANALYZE THESE SPECIFIC ELEMENTS:
    - Overall voice (formal, casual, intellectual, humorous, etc.)
    - Communication style (direct, conversational, questioning, authoritative)
    - Personality traits evident in writing (passionate, reserved, sarcastic, etc.)
    - Attitude toward subjects (enthusiastic, critical, neutral, appreciative)
    - Emotional qualities that come through in writing
    
    ANALYSIS REQUIREMENTS:
    - Each identified tone pattern MUST appear in 70-90% of tweets
    - Focus ONLY on tone/voice aspects (not visual elements or knowledge domains)
    - Be extremely specific and precise in describing patterns
    - Provide 4-5 tone/personality rules that comprehensively capture their voice
    
    If you receive refinement questions, carefully address each one to improve your analysis.
    
    CRITICAL: Capture the essence of HOW this person communicates - their unique voice that
    distinguishes them from others.
    `
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 1000
      });

      const generatedTweet = completion.choices[0]?.message?.content?.trim();
      console.log("completion", JSON.stringify(completion.choices[0]?.message))
      if (!generatedTweet) {
        throw new Error('Failed to generate tweet');
      }

      return extractTweetFromResponse(generatedTweet);
    } catch (error) {
      console.error('Error generating user tweet:', error);
      throw error;
    }
  }

  private extractProcessingScore(analysis: string): number {
    // Extract a number between 0-100 from the analysis text
    const scoreMatch = analysis.match(/\b\d{1,3}\b/);
    return scoreMatch ? Math.min(100, Math.max(0, parseInt(scoreMatch[0]))) : 50;
  }
} 