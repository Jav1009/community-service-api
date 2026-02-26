const express = require('express');
const cors = require('cors');
require('dotenv').config();

const serviceRoutes = require('./routes/serviceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3500;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);

// Health check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Community Service Booking API is running',
    version: '1.0.0'
  });
});

// 404 handler for unmatched routes
app.use((req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
});

// Centralized error handling middleware (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;