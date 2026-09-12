import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Middleware & Utilities
import { globalLimiter, authLimiter } from './middlewares/rateLimiters.js';
import setupSwagger from './config/swagger.js';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import workspaceRoutes from './routes/workspaceRoutes.js';
import workspaceMemberRoutes from './routes/workspaceMemberRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import activityRoutes from './routes/activityRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Enable reverse proxy trust for Render deployment
app.set('trust proxy', 1);

setupSwagger(app);

// 2. Parse CLIENT_URL into an array and strip trailing slashes
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim().replace(/\/$/, ''))
  : ['http://localhost:3000', 'http://localhost:5173'];

// 3. CORS Middleware (placed BEFORE rate limiters and express.json)
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like Postman or server-to-server)
      if (!origin) return callback(null, true);

      const sanitizedOrigin = origin.replace(/\/$/, '');
      if (allowedOrigins.includes(sanitizedOrigin)) {
        return callback(null, true);
      }

      // Return false instead of an Error object so preflight OPTIONS requests fail cleanly without a 500 server crash
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200,
  })
);

// 4. Rate Limiters (placed AFTER CORS so preflights aren't rejected by rate limits)
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/forgot-password', authLimiter);
app.use('/api/v1/auth/verify-otp', authLimiter);
app.use('/api', globalLimiter);

// 5. Body Parsing Middleware
app.use(express.json());

// ==========================================
// APPLICATION ROUTES
// ==========================================
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TaskFlow Backend API is healthy and running.'
  });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/workspaces', workspaceRoutes);
app.use('/api/v1/workspaces', workspaceMemberRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/files', fileRoutes);
app.use('/api/v1/activity', activityRoutes);
app.use('/api/v1/activity-logs', activityRoutes);

// ==========================================
// GLOBAL ERROR HANDLING & 404
// ==========================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot find ${req.originalUrl} on this server.`
  });
});

app.use((err, req, res, next) => {
  console.error('Global Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`TaskFlow Backend API running on http://localhost:${PORT}`);
});