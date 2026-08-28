import express from 'express';
import { globalLimiter, authLimiter } from './middleware/rateLimiter.js';

const app = express();

// Required if deploying behind a reverse proxy (Render, Nginx, AWS ALB)
// Ensures express-rate-limit reads the client's real IP, not the proxy's IP
app.set('trust proxy', 1);

// Apply strict limits to sensitive auth routes first
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/forgot-password', authLimiter);
app.use('/api/v1/auth/verify-otp', authLimiter);


// Apply general limit across all API endpoints
app.use('/api', globalLimiter);