import express from 'express';
import cors from 'cors';
import { globalLimiter, authLimiter } from './middleware/rateLimiter.js';

const app = express();

// 1. Required behind reverse proxies (Render, Nginx, AWS ALB) for rate limiting
app.set('trust proxy', 1);

// 2. Parse comma-separated CLIENT_URL into an array of allowed origins
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim())
  : ['http://localhost:3000'];

// 3. Apply CORS before rate limiters so OPTIONS preflight requests aren't blocked
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., Postman or server-to-server calls)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy blocked request from origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 4. Body parsing middleware
app.use(express.json());

// 5. Rate limiters
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/forgot-password', authLimiter);
app.use('/api/v1/auth/verify-otp', authLimiter);

// Apply general limit across all API endpoints
app.use('/api', globalLimiter);