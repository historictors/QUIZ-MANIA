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
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: allowedOrigin,
    credentials: false
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
