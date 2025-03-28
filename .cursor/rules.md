# Cursor Rules for Trend Avatar App

## Project Structure
- Follow the provided project structure exactly
- Use TypeScript for all implementation files
- Maintain separation of concerns (controllers, services, routes)

## Environment Setup
- Use Railway for deployment
- Store all sensitive credentials in Railway environment variables
- Don't hardcode any API keys or secrets

## API Integration
- Use the X API for authentication, trend fetching, and posting
- Follow the OAuth 2.0 flow with PKCE for authentication
- Ensure proper token refresh handling

## OpenAI Integration
- Create separate system prompts for trend analysis, media swapping, and caption generation
- Prioritize trends with post_count > 50
- Implement system prompt that checks for trends every 15 minutes

## Media Handling
- Implement secure image processing and storage
- Use temporary storage for processed images
- Ensure proper error handling for media processing

## User Flow
- Maintain a clean, responsive UI
- Implement proper session management
- Provide clear feedback on all operations

## Deployment 
- Ensure Railway compatibility
- Include proper error logging
- Implement environmental variable configuration 