import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import multer from 'multer';
import fs from 'fs';

import authRoutes from './routes/auth';
import trendRoutes from './routes/trends';
import { XApiService } from './services/xApiService';
import { OpenAIService } from './services/openaiService';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

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
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  },
}));

// Static files
app.use(express.static(path.join(__dirname, '../public')));

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
app.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  res.render('dashboard', { 
    user: req.session.user 
  });
});

// Schedule trend analysis every 15 minutes
const FIFTEEN_MINUTES = 15 * 60 * 1000;

setInterval(async () => {
  console.log("Running scheduled trend analysis...");
  
  try {
    // Get trending topics from X API
    const trends = await xApiService.getTrendingTopics();
    
    // Filter trends with post count > 50
    const relevantTrends = trends.filter(trend => trend.post_count > 50);
    
    // Process each relevant trend
    for (const trend of relevantTrends) {
      try {
        // Analyze trend and get media
        const searchResults = await xApiService.searchTrendMedia(req.user.accessToken, trend);
        const analysis = await openAIService.analyzeTrendAndMedia(trend, searchResults);
        
        // Log successful analysis
        console.log(`Successfully analyzed trend: ${trend.name}`);
        console.log(`Suitability score: ${analysis.processingSuitability}`);
        
        // If trend is suitable for processing, log it for manual review
        if (analysis.processingSuitability >= 50) {
          console.log(`Trend suitable for processing: ${trend.name}`);
          console.log(`Thematic description: ${analysis.thematicDescription}`);
        }
      } catch (trendError) {
        console.error(`Error processing trend ${trend.name}:`, trendError);
        // Continue with next trend even if one fails
        continue;
      }
    }
    
    console.log("Automated trend analysis completed");
  } catch (error) {
    console.error("Error in automated trend analysis:", error);
  }
}, FIFTEEN_MINUTES);

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