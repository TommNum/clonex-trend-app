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
    
    try {
      // Download the media
      const mediaResponse = await axios.get(selectedMedia.media_url, { responseType: 'arraybuffer' });
      const mediaBuffer = Buffer.from(mediaResponse.data, 'binary');
      const mediaPath = path.join(__dirname, '../../public/uploads', `media-${uuidv4()}.jpg`);
      await writeFileAsync(mediaPath, mediaBuffer);

      // Download the user's avatar
      const avatarResponse = await axios.get(userAvatarUrl, { responseType: 'arraybuffer' });
      const avatarBuffer = Buffer.from(avatarResponse.data, 'binary');
      const avatarPath = path.join(__dirname, '../../public/uploads', `avatar-${uuidv4()}.jpg`);
      await writeFileAsync(avatarPath, avatarBuffer);

      // Analyze the image with GPT-4 Vision
      const visionPrompt = `
        Analyze this trending image and provide detailed instructions for replacing the main subject with a user's avatar.
        Focus on:
        1. The exact location and size of the face/head area
        2. The lighting and color characteristics
        3. The pose and expression
        4. Any specific details that need to be preserved
        
        Format your response as JSON with the following structure:
        {
          "faceLocation": { "x": number, "y": number, "width": number, "height": number },
          "lighting": "description of lighting",
          "pose": "description of pose",
          "details": ["list of important details to preserve"]
        }
      `;

      const visionResponse = await this.openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "system",
            content: "You are an expert image analyst who provides precise instructions for image editing."
          },
          {
            role: "user",
            content: [
              { type: "text", text: visionPrompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${mediaBuffer.toString('base64')}`
                }
              }
            ]
          }
        ]
      });

      const analysis = JSON.parse(visionResponse.choices[0].message.content || '{}');

      // Generate a new image with DALL-E
      const dallePrompt = `
        Create a new version of this trending image where the main subject's face/head has been replaced with a user's avatar.
        The avatar should be positioned at coordinates (${analysis.faceLocation.x}, ${analysis.faceLocation.y}) with dimensions ${analysis.faceLocation.width}x${analysis.faceLocation.height}.
        Maintain the same lighting (${analysis.lighting}), pose (${analysis.pose}), and preserve these details: ${analysis.details.join(', ')}.
        The result should look natural and seamlessly integrated.
      `;

      const dalleResponse = await this.openai.images.generate({
        model: "dall-e-3",
        prompt: dallePrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "natural"
      });

      // Download the generated image
      const generatedImageUrl = dalleResponse.data[0].url;
      const generatedImageResponse = await axios.get(generatedImageUrl!, { responseType: 'arraybuffer' });
      const generatedImageBuffer = Buffer.from(generatedImageResponse.data, 'binary');
      
      // Save the generated image
      const outputFileName = `swapped-${uuidv4()}.jpg`;
      const outputPath = path.join(__dirname, '../../public/uploads', outputFileName);
      
      // Process the image with Sharp to ensure consistent format and quality
      await sharp(generatedImageBuffer)
        .jpeg({ quality: 90 })
        .toFile(outputPath);

      // Generate a caption for the modified image
      const captionPrompt = `
        Create a witty, engaging caption for a post where a user's avatar has been inserted into a trending image related to "${processedTrend.trendName}".
        
        Trend information:
        ${processedTrend.thematicDescription}
        
        Make the caption relatable, funny, and appropriate for social media. Keep it under 180 characters.
      `;

      const captionResponse = await this.openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [{
          role: "system",
          content: "You are a social media expert who creates engaging captions."
        }, {
          role: "user",
          content: captionPrompt
        }]
      });

      return {
        originalMediaUrl: selectedMedia.mediaUrl,
        modifiedMediaUrl: `/uploads/${outputFileName}`,
        caption: captionResponse.choices[0].message.content || `Check out me in the ${processedTrend.trendName} trend!`
      };
    } catch (error) {
      console.error('Error swapping media with avatar:', error);
      throw new Error('Failed to process image swap');
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