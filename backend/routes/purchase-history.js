import express from 'express';
import { getRecord, getRecords, runQuery } from '../database.js';

const router = express.Router();

// Get customer purchase history
router.get('/customer/:customer_id', async (req, res) => {
  try {
    const { customer_id } = req.params;
    const { limit = 50, offset = 0, start_date, end_date } = req.query;

    let query = `
      SELECT t.id, t.customer_id, t.staff_id, t.total_amount, t.discount_amount,
             t.points_used, t.points_earned, t.payment_method, t.status, t.created_at
      FROM transactions t
      WHERE t.customer_id = ?
    `;
    const params = [customer_id];

    if (start_date) {
      query += ` AND t.created_at >= ?`;
      params.push(start_date);
    }

    if (end_date) {
      query += ` AND t.created_at <= ?`;
      params.push(end_date);
    }

    query += ` ORDER BY t.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const purchases = await getRecords(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as count FROM transactions WHERE customer_id = ?';
    const countParams = [customer_id];

    if (start_date) {
      countQuery += ` AND created_at >= ?`;
      countParams.push(start_date);
    }

    if (end_date) {
      countQuery += ` AND created_at <= ?`;
      countParams.push(end_date);
    }

    const countResult = await getRecord(countQuery, countParams);

    // Get items for each transaction
    const purchasesWithItems = await Promise.all(
      purchases.map(async (purchase) => {
        const items = await getRecords(
          `SELECT ti.id, ti.product_id, ti.quantity, ti.unit_price, ti.total_price,
                  p.name, p.category, p.unit
           FROM transaction_items ti
           JOIN products p ON ti.product_id = p.id
           WHERE ti.transaction_id = ?`,
          [purchase.id]
        );
        return { ...purchase, items };
      })
    );

    res.json({ 
      purchases: purchasesWithItems,
      total: countResult?.count || 0,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific transaction details
router.get('/transaction/:transaction_id', async (req, res) => {
  try {
    const { transaction_id } = req.params;

    const transaction = await getRecord(
      'SELECT * FROM transactions WHERE id = ?',
      [transaction_id]
    );

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const items = await getRecords(
      `SELECT ti.id, ti.product_id, ti.quantity, ti.unit_price, ti.total_price,
              p.name, p.category, p.unit
       FROM transaction_items ti
       JOIN products p ON ti.product_id = p.id
       WHERE ti.transaction_id = ?`,
      [transaction_id]
    );

    res.json({ 
      transaction: {
        ...transaction,
        items
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get purchase summary for a customer
router.get('/customer/:customer_id/summary', async (req, res) => {
  try {
    const { customer_id } = req.params;

    const summary = await getRecord(
      `SELECT 
        COUNT(*) as total_purchases,
        SUM(total_amount) as total_spent,
        SUM(discount_amount) as total_discounts,
        SUM(points_earned) as total_points_earned,
        AVG(total_amount) as avg_purchase_value,
        MAX(created_at) as last_purchase_date
       FROM transactions 
       WHERE customer_id = ?`,
      [customer_id]
    );

    // Get top purchased categories
    const topCategories = await getRecords(
      `SELECT p.category, COUNT(*) as count, SUM(ti.quantity) as total_quantity
       FROM transaction_items ti
       JOIN products p ON ti.product_id = p.id
       JOIN transactions t ON ti.transaction_id = t.id
       WHERE t.customer_id = ?
       GROUP BY p.category
       ORDER BY count DESC
       LIMIT 5`,
      [customer_id]
    );

    // Get favorite products
    const favoriteProducts = await getRecords(
      `SELECT p.id, p.name, p.category, COUNT(*) as purchase_count, SUM(ti.quantity) as total_quantity
       FROM transaction_items ti
       JOIN products p ON ti.product_id = p.id
       JOIN transactions t ON ti.transaction_id = t.id
       WHERE t.customer_id = ?
       GROUP BY p.id
       ORDER BY purchase_count DESC
       LIMIT 10`,
      [customer_id]
    );

    res.json({ 
      summary,
      topCategories,
      favoriteProducts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get reorder recommendations (frequently bought items)
router.get('/customer/:customer_id/reorder-suggestions', async (req, res) => {
  try {
    const { customer_id } = req.params;

    const suggestions = await getRecords(
      `SELECT p.id, p.name, p.category, p.price, p.current_stock, p.unit,
              COUNT(*) as purchase_frequency, 
              AVG(CAST(ti.quantity AS FLOAT)) as avg_quantity,
              MAX(t.created_at) as last_purchased
       FROM transaction_items ti
       JOIN products p ON ti.product_id = p.id
       JOIN transactions t ON ti.transaction_id = t.id
       WHERE t.customer_id = ?
       GROUP BY p.id
       HAVING COUNT(*) >= 2
       ORDER BY purchase_frequency DESC
       LIMIT 10`,
      [customer_id]
    );

    res.json({ 
      suggestions,
      count: suggestions.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
