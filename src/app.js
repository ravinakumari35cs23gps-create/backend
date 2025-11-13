const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const resultRoutes = require('./routes/resultRoutes');
const reportRoutes = require('./routes/reportRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
// Initialize Express app
const app = express();

// Security middleware - allow Angular app to load
app.use(helmet({
  contentSecurityPolicy: false,
}));

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = process.env.CORS_ORIGIN ? 
        process.env.CORS_ORIGIN.split(',') : 
        ['http://localhost:4200'];
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}
const _dirname = path.resolve();
// Ensure the dist directory exists
if (!fs.existsSync(path.join(_dirname, '/my-app/dist/my-app'))) {
  console.warn('Angular build directory not found, frontend routes will not work');
}
// Rate limiting
app.use('/api/', apiLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes
const API_VERSION = process.env.API_VERSION || 'v1';
app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/students`, studentRoutes);
app.use(`/api/${API_VERSION}/teachers`, teacherRoutes);
app.use(`/api/${API_VERSION}/results`, resultRoutes);
app.use(`/api/${API_VERSION}/reports`, reportRoutes);
app.use(`/api/${API_VERSION}/analytics`, analyticsRoutes);
app.use(`/api/${API_VERSION}/attendance`, attendanceRoutes);

// API status route
app.get('/api', (_, res) => {
  res.json({
    success: true,
    message: 'Result Management System API',
    version: API_VERSION,
    documentation: `/api/${API_VERSION}/docs`,
  });
});

// API v1 status route
app.get(`/api/${API_VERSION}`, (_, res) => {
  res.json({
    success: true,
    message: 'Result Management System API v1',
    version: API_VERSION,
    documentation: `/api/${API_VERSION}/docs`,
  });
});

// Serve static files from Angular app
const angularDistPath = path.join(_dirname, '/my-app/dist/my-app');
app.use(express.static(angularDistPath));

// Catch-all route - serve Angular app for all non-API routes
app.get('/', (req, res) => {
  res.sendFile(path.join(angularDistPath, 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(angularDistPath, 'index.html'));
});

app.get('/admin/:path', (req, res) => {
  res.sendFile(path.join(angularDistPath, 'index.html'));
});

app.get('/teacher', (req, res) => {
  res.sendFile(path.join(angularDistPath, 'index.html'));
});

app.get('/teacher/:path', (req, res) => {
  res.sendFile(path.join(angularDistPath, 'index.html'));
});

app.get('/student', (req, res) => {
  res.sendFile(path.join(angularDistPath, 'index.html'));
});

app.get('/student/:path', (req, res) => {
  res.sendFile(path.join(angularDistPath, 'index.html'));
});

// 404 handler for API
app.use(/^\/api\/(.*)$/, notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
