const express = require('express');
const cors = require('cors');
const connectDB = require('./database');
const redisClient = require('./redis');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const uploadRoutes = require('./routes/upload');
const medicationRoutes = require('./routes/medications');
const remindersRoutes = require('./routes/reminders');
const errorHandler = require('./middleware/errorHandler');
const analyticsRoutes = require('./routes/analytics');
const requestLogger = require('./middleware/requestLogger');
require('./config'); // Loads environment variables

const app = express();
app.use(cors({
  origin: 'https://medicinemanagementtool.netlify.app',
  credentials: true // if you're using cookies or authentication headers
}));
app.use(express.json());

// Connect to MongoDB
connectDB();

// Test Redis connection
redisClient.on('connect', () => {
  console.log('Redis connected');
});

// ✅ Fix for X-Forwarded-For header (REQUIRED for express-rate-limit behind proxy)
app.set('trust proxy', true);
// Request logging middleware
app.use(requestLogger);

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/reminders', remindersRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use(errorHandler);

// Modular cron job for medication reminders
require('./cron/medicationReminders')();

const PORT = process.env.PORT || 5000;
app.get('/', (req, res) => {
  res.send('API is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 