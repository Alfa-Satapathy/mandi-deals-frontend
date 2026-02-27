import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './database.js';

// Import routes
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import customerRoutes from './routes/customers.js';
import walletRoutes from './routes/wallet.js';
import posRoutes from './routes/pos.js';
import adminRoutes from './routes/admin.js';
import wishlistRoutes from './routes/wishlist.js';
import discountRoutes from './routes/discounts.js';
import purchaseHistoryRoutes from './routes/purchase-history.js';
import analyticsRoutes from './routes/analytics.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database first
let dbConnected = false;

initializeDatabase()
  .then(() => {
    dbConnected = true;
    console.log('✅ Database initialized successfully');
  })
  .catch((err) => {
    console.error('❌ Database initialization error:', err);
    process.exit(1);
  });

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date(),
    serverTime: new Date().toISOString(),
    message: 'Mandi Deals API is running!',
    database: dbConnected ? 'connected' : 'initializing'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/pos', posRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/purchase-history', purchaseHistoryRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n╔════════════════════════════════════════╗`);
  console.log(`║   Mandi Deals API Running              ║`);
  console.log(`║   http://localhost:${PORT}              ║`);
  console.log(`║   Press Ctrl+C to stop                 ║`);
  console.log(`╚════════════════════════════════════════╝\n`);
  console.log('📚 API Documentation:');
  console.log('   GET    /api/health              - API status');
  console.log('   POST   /api/auth/register       - Register user');
  console.log('   POST   /api/auth/login          - Login');
  console.log('   GET    /api/products            - Get all products');
  console.log('   POST   /api/products            - Create new product');
  console.log('   GET    /api/products/categories/list - Get all categories');
  console.log('   PUT    /api/products/:id/stock  - Update stock');
  console.log('   GET    /api/customers/search    - Search customer');
  console.log('   POST   /api/pos/create-bill     - Create bill');
  console.log('   POST   /api/pos/complete-transaction - Complete sale');
  console.log('   ');
  console.log('   📦 INVENTORY MANAGEMENT:');
  console.log('   GET    /api/admin/inventory/list          - List all products (with filters)');
  console.log('   GET    /api/admin/inventory/categories    - Get all categories');
  console.log('   GET    /api/admin/inventory/stats         - Get inventory stats');
  console.log('   POST   /api/admin/inventory/add           - Add new product');
  console.log('   PUT    /api/admin/inventory/:id           - Update product (price, stock)');
  console.log('   DELETE /api/admin/inventory/:id           - Delete product');
  console.log('   ');
  console.log('   ❤️  WISHLIST MANAGEMENT:');
  console.log('   GET    /api/wishlist/customer/:id         - Get customer wishlist');
  console.log('   POST   /api/wishlist/add                  - Add to wishlist');
  console.log('   DELETE /api/wishlist/:id                  - Remove from wishlist');
  console.log('   ');
  console.log('   💰 DISCOUNT MANAGEMENT:');
  console.log('   GET    /api/discounts/all                 - Get all discounts');
  console.log('   GET    /api/discounts/active              - Get active discounts');
  console.log('   GET    /api/discounts/:id                 - Get discount details');
  console.log('   POST   /api/discounts/create              - Create new discount');
  console.log('   PUT    /api/discounts/:id                 - Update discount');
  console.log('   DELETE /api/discounts/:id                 - Delete discount');
  console.log('   ');
  console.log('   📊 PURCHASE HISTORY:');
  console.log('   GET    /api/purchase-history/customer/:id - Get customer purchase history');
  console.log('   GET    /api/purchase-history/transaction/:id - Get transaction details');
  console.log('   GET    /api/purchase-history/customer/:id/summary - Get purchase summary');
  console.log('   GET    /api/purchase-history/customer/:id/reorder-suggestions - Get reorder suggestions');
  console.log('   ');
  console.log('   📈 SALES ANALYTICS:');
  console.log('   GET    /api/analytics/sales/daily         - Daily sales analytics');
  console.log('   GET    /api/analytics/sales/weekly        - Weekly sales analytics');
  console.log('   GET    /api/analytics/sales/monthly       - Monthly sales analytics');
  console.log('   GET    /api/analytics/products/top-selling - Top selling products');
  console.log('   GET    /api/analytics/sales/by-category   - Sales by category');
  console.log('   GET    /api/analytics/revenue/summary     - Revenue summary');
  console.log('   GET    /api/analytics/payment-methods     - Payment method distribution');
  console.log('   GET    /api/analytics/discount-impact     - Discount impact analytics');
  console.log('   GET    /api/analytics/customers/acquisition - Customer acquisition analytics\n');
});
