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

// Import database configuration
const { testConnection, initDatabase } = require('./config/database');
const { initSagaLog } = require('./services/sagaLog');

// Import routes
const menuRoutes = require('./routes/menu');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/order');
const promotionRoutes = require('./routes/promotion');
const authRoutes = require('./routes/auth');
const sagaRoutes = require('./routes/saga');

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
app.use('/api/v1/sagas', sagaRoutes);

// 404 Handler
app.use((req, res, next) => {
  next(new AppError(WARNINGS.NOT_FOUND.route(req.originalUrl), 404));
});

// Global Error Handler
app.use(handleError);

// Start Server
const PORT = process.env.PORT || 3000;

// Initialize database connection and schema before starting server
const startServer = async () => {
  try {
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('❌ Failed to connect to database. Server will not start.');
      process.exit(1);
    }
    
    // Initialize database schema
    await initDatabase();
    
    // Initialize saga log tables
    await initSagaLog();
    
    // Start Express server
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
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
