const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Standard Security & Performance Middleware
app.use(helmet());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());
app.use(morgan('combined'));

// Rate Limiter to prevent brute force / DDoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { message: 'Too many requests from this IP, please try again later.' }
});
app.use('/api/', limiter);

// Mock DB Fallback Status
let isUsingMockDb = false;

// Connect to MongoDB
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/darkwatch';
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected Successfully.'))
.catch(err => {
  console.error('MongoDB connection failed. Starting with Memory Mock DB Mode:', err.message);
  isUsingMockDb = true;
});

// Pass DB status to request contexts
app.use((req, res, next) => {
  req.isUsingMockDb = isUsingMockDb;
  next();
});

// Import Routes
const authRoutes = require('./routes/auth');
const logsRoutes = require('./routes/logs');
const incidentsRoutes = require('./routes/incidents');
const metricsRoutes = require('./routes/metrics');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/incidents', incidentsRoutes);
app.use('/api/metrics', metricsRoutes);

// Base Status Route
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'DarkWatch AI Gateway',
    timestamp: new Date(),
    database: isUsingMockDb ? 'MOCK_IN_MEMORY' : 'CONNECTED'
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? {} : err.stack
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`[DarkWatch AI] Server running on port ${PORT}`);
});
