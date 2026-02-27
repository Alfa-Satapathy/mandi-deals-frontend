import express from 'express';
import { getRecord, getRecords, runQuery } from '../database.js';

const router = express.Router();

// Get daily sales analytics
router.get('/sales/daily', async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const dailySales = await getRecords(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as transaction_count,
        SUM(total_amount) as total_sales,
        SUM(discount_amount) as total_discounts,
        AVG(total_amount) as avg_transaction,
        COUNT(DISTINCT customer_id) as unique_customers
       FROM transactions
       WHERE created_at >= datetime('now', '-' || ? || ' days')
       GROUP BY DATE(created_at)
       ORDER BY date DESC`,
      [days]
    );

    res.json({ 
      daily_sales: dailySales,
      period_days: parseInt(days)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get weekly sales analytics
router.get('/sales/weekly', async (req, res) => {
  try {
    const { weeks = 12 } = req.query;

    const weeklySales = await getRecords(
      `SELECT 
        strftime('%Y-W%W', created_at) as week,
        COUNT(*) as transaction_count,
        SUM(total_amount) as total_sales,
        SUM(discount_amount) as total_discounts,
        AVG(total_amount) as avg_transaction,
        COUNT(DISTINCT customer_id) as unique_customers
       FROM transactions
       WHERE created_at >= datetime('now', '-' || ? || ' weeks')
       GROUP BY strftime('%Y-W%W', created_at)
       ORDER BY week DESC`,
      [weeks]
    );

    res.json({ 
      weekly_sales: weeklySales,
      period_weeks: parseInt(weeks)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get monthly sales analytics
router.get('/sales/monthly', async (req, res) => {
  try {
    const { months = 12 } = req.query;

    const monthlySales = await getRecords(
      `SELECT 
        strftime('%Y-%m', created_at) as month,
        COUNT(*) as transaction_count,
        SUM(total_amount) as total_sales,
        SUM(discount_amount) as total_discounts,
        AVG(total_amount) as avg_transaction,
        COUNT(DISTINCT customer_id) as unique_customers
       FROM transactions
       WHERE created_at >= datetime('now', '-' || ? || ' months')
       GROUP BY strftime('%Y-%m', created_at)
       ORDER BY month DESC`,
      [months]
    );

    res.json({ 
      monthly_sales: monthlySales,
      period_months: parseInt(months)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get top selling products
router.get('/products/top-selling', async (req, res) => {
  try {
    const { limit = 20, days = 30 } = req.query;

    const topProducts = await getRecords(
      `SELECT 
        p.id,
        p.name,
        p.category,
        p.price,
        COUNT(*) as times_sold,
        SUM(ti.quantity) as total_quantity,
        SUM(ti.total_price) as total_revenue,
        AVG(ti.quantity) as avg_quantity_per_sale
       FROM transaction_items ti
       JOIN products p ON ti.product_id = p.id
       JOIN transactions t ON ti.transaction_id = t.id
       WHERE t.created_at >= datetime('now', '-' || ? || ' days')
       GROUP BY p.id
       ORDER BY total_revenue DESC
       LIMIT ?`,
      [days, parseInt(limit)]
    );

    res.json({ 
      top_products: topProducts,
      limit: parseInt(limit),
      period_days: parseInt(days)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get sales by category
router.get('/sales/by-category', async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const salesByCategory = await getRecords(
      `SELECT 
        p.category,
        COUNT(*) as transaction_count,
        SUM(ti.quantity) as total_items_sold,
        SUM(ti.total_price) as total_revenue,
        AVG(p.price) as avg_product_price,
        COUNT(DISTINCT p.id) as unique_products
       FROM transaction_items ti
       JOIN products p ON ti.product_id = p.id
       JOIN transactions t ON ti.transaction_id = t.id
       WHERE t.created_at >= datetime('now', '-' || ? || ' days')
       GROUP BY p.category
       ORDER BY total_revenue DESC`,
      [days]
    );

    res.json({ 
      sales_by_category: salesByCategory,
      period_days: parseInt(days)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get revenue summary
router.get('/revenue/summary', async (req, res) => {
  try {
    const today = await getRecord(
      `SELECT 
        SUM(total_amount) as total_sales,
        COUNT(*) as transaction_count,
        AVG(total_amount) as avg_transaction,
        SUM(discount_amount) as total_discounts
       FROM transactions
       WHERE DATE(created_at) = DATE('now')`
    );

    const thisWeek = await getRecord(
      `SELECT 
        SUM(total_amount) as total_sales,
        COUNT(*) as transaction_count,
        AVG(total_amount) as avg_transaction
       FROM transactions
       WHERE created_at >= datetime('now', '-7 days')`
    );

    const thisMonth = await getRecord(
      `SELECT 
        SUM(total_amount) as total_sales,
        COUNT(*) as transaction_count,
        AVG(total_amount) as avg_transaction
       FROM transactions
       WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')`
    );

    const allTime = await getRecord(
      `SELECT 
        SUM(total_amount) as total_sales,
        COUNT(*) as transaction_count,
        AVG(total_amount) as avg_transaction,
        COUNT(DISTINCT customer_id) as total_customers
       FROM transactions`
    );

    res.json({ 
      today,
      this_week: thisWeek,
      this_month: thisMonth,
      all_time: allTime
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payment method distribution
router.get('/payment-methods', async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const paymentMethods = await getRecords(
      `SELECT 
        COALESCE(payment_method, 'unknown') as payment_method,
        COUNT(*) as transaction_count,
        SUM(total_amount) as total_amount,
        AVG(total_amount) as avg_amount
       FROM transactions
       WHERE created_at >= datetime('now', '-' || ? || ' days')
       GROUP BY payment_method
       ORDER BY total_amount DESC`,
      [days]
    );

    res.json({ 
      payment_methods: paymentMethods,
      period_days: parseInt(days)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get discount impact analytics
router.get('/discount-impact', async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const discountAnalytics = await getRecords(
      `SELECT 
        COUNT(*) as transactions_with_discount,
        SUM(discount_amount) as total_discount_given,
        AVG(discount_amount) as avg_discount,
        SUM(total_amount) as total_sales_with_discount,
        (SELECT COUNT(*) FROM transactions WHERE created_at >= datetime('now', '-' || ? || ' days')) as total_transactions,
        (SELECT SUM(total_amount) FROM transactions WHERE created_at >= datetime('now', '-' || ? || ' days')) as total_revenue
       FROM transactions
       WHERE discount_amount > 0 AND created_at >= datetime('now', '-' || ? || ' days')`,
      [days, days, days]
    );

    const result = discountAnalytics[0] || {};
    
    res.json({ 
      discount_impact: result,
      discount_percentage: result.total_discount_given && result.total_sales_with_discount 
        ? ((result.total_discount_given / result.total_sales_with_discount) * 100).toFixed(2)
        : 0,
      period_days: parseInt(days)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get customer acquisition analytics
router.get('/customers/acquisition', async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const newCustomers = await getRecords(
      `SELECT 
        DATE(t.created_at) as date,
        COUNT(DISTINCT t.customer_id) as new_customers
       FROM transactions t
       WHERE NOT EXISTS (
         SELECT 1 FROM transactions t2 
         WHERE t2.customer_id = t.customer_id 
         AND DATE(t2.created_at) < DATE(t.created_at)
       )
       AND t.created_at >= datetime('now', '-' || ? || ' days')
       GROUP BY DATE(t.created_at)
       ORDER BY date DESC`,
      [days]
    );

    const repeatCustomers = await getRecords(
      `SELECT 
        COUNT(DISTINCT customer_id) as repeat_customers_count,
        AVG(purchase_count) as avg_purchases_per_customer
       FROM (
         SELECT customer_id, COUNT(*) as purchase_count
         FROM transactions
         WHERE created_at >= datetime('now', '-' || ? || ' days')
         GROUP BY customer_id
         HAVING COUNT(*) > 1
       )`,
      [days]
    );

    res.json({ 
      new_customers: newCustomers,
      repeat_customers: repeatCustomers[0] || {},
      period_days: parseInt(days)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
