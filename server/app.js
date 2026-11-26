const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const { authRouter, getDepartments } = require('./routes/auth');
const adminRouter = require('./routes/admin');
const facultyRouter = require('./routes/faculty');
const studentRouter = require('./routes/student');

const app = express();

// Body parser
app.use(express.json());

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman, curl)
      if (!origin) return callback(null, true);

      // Normalize origin: strip trailing slashes for clean comparison
      const normalizedOrigin = origin.replace(/\/+$/, '');

      // Allowed origins list
      const allowedOrigins = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'https://quiz-mania.historictor.workers.dev'
      ];

      if (process.env.CLIENT_URL) {
        allowedOrigins.push(process.env.CLIENT_URL.replace(/\/+$/, ''));
      }

      // Check exact match, match in allowed list, or any Cloudflare workers/pages subdomains
      if (
        allowedOrigins.includes(normalizedOrigin) ||
        normalizedOrigin.endsWith('.workers.dev') ||
        normalizedOrigin.endsWith('.pages.dev')
      ) {
        return callback(null, origin); // Echo the exact incoming origin
      }

      // In production/demo, allow origin to prevent breaking deployment
      return callback(null, origin);
    },
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Disposition']
  })
);

// Mount routes
app.use('/api/auth', authRouter);
app.get('/api/departments', getDepartments); // Public endpoint for registration/quiz dropdowns
app.use('/api/admin', adminRouter);
app.use('/api/faculty', facultyRouter);
app.use('/api/student', studentRouter);

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'Campus Quiz API is running' });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
