# Fixing Build Issues in the Trend Avatar App

These build errors are primarily related to TypeScript types, missing dependencies, and code structure issues. Let's create specific prompts for the Cursor agent to fix each category of issues.

## 1. Missing Dependencies

```
Cursor, please install these missing dependencies to fix the import errors:

npm install axios uuid jsonwebtoken @types/axios @types/uuid @types/jsonwebtoken express-session @types/express-session
```

## 2. Type Definition Issues

```
Cursor, please update the src/types/index.ts file to ensure our type definitions match how we're using them in the code. Here's what needs to be fixed:

1. Update PersonalizedTrend interface to include:
   - trend_name as string
   - post_count as number
   - category as optional string
   - trending_since as string

2. Update ProcessedTrend interface to include:
   - trendName as string
   - mediaItems as TrendMedia[]
   - thematicDescription as string
   - processingSuitability as number

3. Update MediaSwapResult interface to include:
   - originalMediaUrl as string
   - modifiedMediaUrl as string
   - caption as string

Make sure all interfaces are exported properly.
```

## 3. Authentication Middleware Fix

```
Cursor, please fix the authentication middleware in src/middleware/auth.ts:

1. Update the import statements to include express-session:
   ```typescript
   import { Request, Response, NextFunction } from 'express';
   import XApiService from '../services/xApiService';
   import session from 'express-session';
   ```

2. Define the session types:
   ```typescript
   declare module 'express-session' {
     interface SessionData {
       user?: any;
       codeVerifier?: string;
     }
   }
   ```

3. Ensure all code paths in the middleware return something by adding a proper return statement at the end.
```

## 4. App.ts Session Configuration Fix

```
Cursor, please fix the session configuration in src/app.ts:

1. Import express-session at the top:
   ```typescript
   import session from 'express-session';
   ```

2. Configure the session middleware correctly, passing the proper configuration object:
   ```typescript
   app.use(session({
     secret: process.env.SESSION_SECRET || 'your-secret-key',
     resave: false,
     saveUninitialized: false,
     cookie: {
       secure: process.env.NODE_ENV === 'production',
       maxAge: 24 * 60 * 60 * 1000, // 1 day
     },
   }));
   ```

3. Fix the req reference in line 105 by ensuring it's within a route handler that has access to the request object.
```

## 5. OpenAI Service Fix

```
Cursor, please fix the OpenAI service in src/services/openaiService.ts:

1. Make sure all property references match the updated type definitions.

2. Update the analyzeTrendAndMedia method to use the correct property names from the PersonalizedTrend type.

3. Update the return structure in each method to match the expected interfaces:
   - For analyzeTrendAndMedia, ensure it returns a ProcessedTrend object
   - For swapMediaWithAvatar, ensure it returns a MediaSwapResult object

4. Fix the thematicDescription property usage to align with our type definitions.
```

## 6. Comprehensive Project Fix

```
Cursor, please do a comprehensive analysis of all TypeScript errors in the project and fix them systematically. 

For each file with errors:
1. Check if there are any missing imports
2. Ensure the type definitions match how they're being used
3. Fix any incorrect property references
4. Ensure all paths have proper return statements
5. Update any hardcoded values to match our expected types

Also, please ensure all necessary middleware is properly configured, especially session handling.
```

## 7. Fix Missing Environment Variables

```
Cursor, please ensure we have a proper .env file for the project with all the necessary variables:

```
# X (Twitter) API Credentials
X_CLIENT_ID=your_client_id
X_CLIENT_SECRET=your_client_secret
X_CALLBACK_URL=https://your-app-url/auth/callback

# OpenAI API
OPENAI_API_KEY=your_openai_api_key

# App Settings
PORT=3000
NODE_ENV=development
SESSION_SECRET=a_strong_random_secret
```

Also, make sure these variables are properly loaded in the app.
```

## 8. Update tsconfig.json For Better Error Handling

```
Cursor, please update the tsconfig.json file to help with some of these errors:

```json
{
  "compilerOptions": {
    "target": "es2018",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "typeRoots": ["./node_modules/@types", "./src/types"],
    "lib": ["es2018", "dom"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```
```