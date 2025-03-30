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
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://talented-miracle-production.up.railway.app'
    : 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  name: 'sessionId'
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
    // Get active trends count
    const systemAccessToken = process.env.SYSTEM_ACCESS_TOKEN;
    const trends = systemAccessToken ? await xApiService.getTrendingTopics(systemAccessToken) : [];

    res.render('dashboard', {
      user: req.session.user,
      stats: {
        activeTrends: trends.length || 0
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.render('dashboard', {
      user: req.session.user,
      stats: {
        activeTrends: 0
      }
    });
  }
});

// Schedule trend analysis
cron.schedule('0 */4 * * *', async () => {
  try {
    const systemAccessToken = process.env.SYSTEM_ACCESS_TOKEN;
    if (!systemAccessToken) {
      console.error('System access token not configured');
      return;
    }

    const trends = await xApiService.getTrendingTopics(systemAccessToken);
    for (const trend of trends) {
      const searchResults = await xApiService.searchTrendMedia(systemAccessToken, trend);
      const processedTrend = await openAIService.analyzeTrendAndMedia(trend);
      processedTrend.mediaItems = searchResults;

      if (processedTrend.processingSuitability >= 75) {
        // Store high-suitability trends for later processing
        await storeTrend(processedTrend);
      }
    }
  } catch (error) {
    console.error('Error in scheduled trend analysis:', error);
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
    // Get active trends count
    const systemAccessToken = process.env.SYSTEM_ACCESS_TOKEN;
    const trends = systemAccessToken ? await xApiService.getTrendingTopics(systemAccessToken) : [];

    res.render('dashboard', {
      user: req.session.user,
      stats: {
        activeTrends: trends.length || 0
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.render('dashboard', {
      user: req.session.user,
      stats: {
        activeTrends: 0
      }
    });
  }
});

// Function to store processed trends
async function storeTrend(processedTrend: ProcessedTrend): Promise<void> {
  try {
    // Here you would implement your storage logic
    // For example, saving to a database or file
    console.log(`Storing processed trend: ${processedTrend.trendName}`);
  } catch (error) {
    console.error('Error storing trend:', error);
  }
}

// Schedule trend analysis
cron.schedule('0 */4 * * *', async () => {
  try {
    const systemAccessToken = process.env.SYSTEM_ACCESS_TOKEN;
    if (!systemAccessToken) {
      console.error('System access token not configured');
      return;
    }

    const trends = await xApiService.getTrendingTopics(systemAccessToken);
    for (const trend of trends) {
      const searchResults = await xApiService.searchTrendMedia(systemAccessToken, trend);
      const processedTrend = await openAIService.analyzeTrendAndMedia(trend);
      processedTrend.mediaItems = searchResults;

      if (processedTrend.processingSuitability >= 75) {
        // Store high-suitability trends for later processing
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