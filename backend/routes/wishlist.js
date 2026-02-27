import express from 'express';
import { getRecord, getRecords, runQuery } from '../database.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get wishlist for a customer
router.get('/customer/:customer_id', async (req, res) => {
  try {
    const { customer_id } = req.params;

    const wishlistItems = await getRecords(
      `SELECT w.id, w.product_id, w.created_at, 
              p.id as prod_id, p.name, p.category, p.price, p.current_stock, p.unit
       FROM wishlist w
       JOIN products p ON w.product_id = p.id
       WHERE w.customer_id = ?
       ORDER BY w.created_at DESC`,
      [customer_id]
    );

    res.json({ 
      wishlist: wishlistItems,
      count: wishlistItems.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add product to wishlist
router.post('/add', async (req, res) => {
  try {
    const { customer_id, product_id } = req.body;

    if (!customer_id || !product_id) {
      return res.status(400).json({ error: 'customer_id and product_id required' });
    }

    // Check if already in wishlist
    const existing = await getRecord(
      'SELECT id FROM wishlist WHERE customer_id = ? AND product_id = ?',
      [customer_id, product_id]
    );

    if (existing) {
      return res.status(400).json({ error: 'Product already in wishlist' });
    }

    const id = uuidv4();
    await runQuery(
      'INSERT INTO wishlist (id, customer_id, product_id) VALUES (?, ?, ?)',
      [id, customer_id, product_id]
    );

    res.json({ 
      message: 'Added to wishlist',
      id,
      product_id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove from wishlist
router.delete('/:wishlist_id', async (req, res) => {
  try {
    const { wishlist_id } = req.params;

    await runQuery('DELETE FROM wishlist WHERE id = ?', [wishlist_id]);

    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove product from wishlist by product_id
router.delete('/product/:product_id/customer/:customer_id', async (req, res) => {
  try {
    const { product_id, customer_id } = req.params;

    await runQuery(
      'DELETE FROM wishlist WHERE product_id = ? AND customer_id = ?',
      [product_id, customer_id]
    );

    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear entire wishlist
router.delete('/clear/:customer_id', async (req, res) => {
  try {
    const { customer_id } = req.params;

    await runQuery('DELETE FROM wishlist WHERE customer_id = ?', [customer_id]);

    res.json({ message: 'Wishlist cleared' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
