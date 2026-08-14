import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import Routes
import authRoutes from './routes/authRoutes.js'; // 1. Added authRoutes import
import userRoutes from './routes/userRoutes.js';
import workspaceRoutes from './routes/workspaceRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import activityRoutes from './routes/activityRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// ==========================================
// 5. APPLICATION ROUTES
// ==========================================
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TaskFlow Backend API is healthy and running.'
  });
});

// Mounted Auth Routes
app.use('/api/v1/auth', authRoutes); // 2. Mounted under /api/v1/auth

// Other Application Routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/workspaces', workspaceRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/files', fileRoutes);
app.use('/api/v1/activity', activityRoutes);

// ==========================================
// 6. GLOBAL ERROR HANDLING & 404
// ==========================================
// Unmatched routes handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot find ${req.originalUrl} on this server.`
  });
});

// Global Error Middleware
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