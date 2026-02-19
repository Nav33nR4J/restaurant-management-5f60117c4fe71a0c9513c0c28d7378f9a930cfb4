/**
 * Backend Entry Point - Express Server Setup
 * Delivery Application Backend API
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { AppError, handleError } = require('./utils/errors');
const { WARNINGS } = require('./utils/warnings');

// Import routes
const menuRoutes = require('./routes/menu');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/order');
const promotionRoutes = require('./routes/promotion');
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: '*', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1/menu', menuRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/promotions', promotionRoutes);
app.use('/api/v1/auth', authRoutes);

// 404 Handler
app.use((req, res, next) => {
  next(new AppError(WARNINGS.NOT_FOUND.route(req.originalUrl), 404));
});

// Global Error Handler
app.use(handleError);

// Start Server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

module.exports = app;
