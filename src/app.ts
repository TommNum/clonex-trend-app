import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import multer from 'multer';
import fs from 'fs';
import cron from 'node-cron';
import { ProcessedTrend } from './types';

import authRoutes from './routes/auth';
import trendRoutes from './routes/trends';
import { XApiService } from './services/xApiService';
import { OpenAIService } from './services/openaiService';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.NODE_PORT || 3001;

// Initialize services
const xApiService = new XApiService();
const openAIService = new OpenAIService();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // Always use secure cookies in production
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    sameSite: 'lax',
    httpOnly: true,
    domain: process.env.NODE_ENV === 'production' ? '.railway.app' : undefined
  },
  proxy: true, // Trust the proxy
  name: 'sessionId', // Explicitly set session name
  rolling: true // Update session on every request
}));

// Trust proxy for secure cookies
app.set('trust proxy', 1);

// Add security headers
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Static files
app.use(express.static(path.join(__dirname, '../public')));
app.use('/css', express.static(path.join(__dirname, '../public/css')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Routes
app.use('/auth', authRoutes);
app.use('/api/trends', trendRoutes);

// Add timeline endpoint
app.get('/api/timeline', async (req, res) => {
  if (!req.session.user?.accessToken || !req.session.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const posts = await xApiService.getUserTimeline(req.session.user.accessToken, req.session.user.id);
    return res.json(posts);
  } catch (error) {
    console.error('Error fetching timeline:', error);
    return res.status(500).json({ error: 'Failed to fetch timeline' });
  }
});

// Home route
app.get('/', (req, res) => {
  res.render('index', {
    user: req.session.user || null
  });
});

// Dashboard route
app.get('/dashboard', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }

  try {
    // Get active posts count from user timeline
    const posts = req.session.user.id ?
      await xApiService.getUserTimeline(req.session.user.accessToken, req.session.user.id) : [];

    res.render('dashboard', {
      user: req.session.user,
      stats: {
        activeTrends: posts.length || 0
      },
      initialPosts: posts // Pass posts to template
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.render('dashboard', {
      user: req.session.user,
      stats: {
        activeTrends: 0
      },
      initialPosts: [] // Pass empty array if error
    });
  }
});

// Function to store processed trends
async function storeTrend(processedTrend: ProcessedTrend): Promise<void> {
  try {
    // Here you would implement your storage logic
    // For example, saving to a database or file
    console.log(`Storing processed trend: ${processedTrend.trendName}`);
    return Promise.resolve();
  } catch (error) {
    console.error('Error storing trend:', error);
    return Promise.reject(error);
  }
}

// Schedule trend analysis
cron.schedule('0 */4 * * *', async () => {
  try {
    const systemAccessToken = process.env.SYSTEM_ACCESS_TOKEN;
    const systemUserId = process.env.SYSTEM_USER_ID;

    if (!systemAccessToken || !systemUserId) {
      console.error('System access token or user ID not configured');
      return;
    }

    const posts = await xApiService.getUserTimeline(systemAccessToken, systemUserId);
    for (const post of posts) {
      const searchResults = await xApiService.searchTrendMedia(systemAccessToken, post);
      const processedTrend = await openAIService.analyzeTrendAndMedia(post);
      processedTrend.mediaItems = searchResults;

      if (processedTrend.processingSuitability >= 75) {
        // Store high-suitability posts for later processing
        await storeTrend(processedTrend);
      }
    }
  } catch (error) {
    console.error('Error in scheduled trend analysis:', error);
  }
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  return res.status(500).json({ error: err.message });
});

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}); 