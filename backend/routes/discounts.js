import express from 'express';
import { getRecord, getRecords, runQuery } from '../database.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get all discounts (admin only)
router.get('/all', async (req, res) => {
  try {
    const discounts = await getRecords(
      `SELECT * FROM discounts ORDER BY created_at DESC`
    );

    res.json({ 
      discounts,
      count: discounts.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get active discounts
router.get('/active', async (req, res) => {
  try {
    const discounts = await getRecords(
      `SELECT * FROM discounts WHERE is_active = 1 ORDER BY created_at DESC`
    );

    res.json({ 
      discounts,
      count: discounts.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get discount by ID with applications
router.get('/:discount_id', async (req, res) => {
  try {
    const { discount_id } = req.params;

    const discount = await getRecord(
      'SELECT * FROM discounts WHERE id = ?',
      [discount_id]
    );

    if (!discount) {
      return res.status(404).json({ error: 'Discount not found' });
    }

    const applications = await getRecords(
      `SELECT da.id, da.discount_id, da.product_id, da.category,
              p.name, p.category as prod_category
       FROM discount_applications da
       LEFT JOIN products p ON da.product_id = p.id
       WHERE da.discount_id = ?`,
      [discount_id]
    );

    res.json({ 
      discount,
      applications
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new discount (admin only)
router.post('/create', async (req, res) => {
  try {
    const { name, description, type, value, applicable_to, created_by, products = [], categories = [] } = req.body;

    if (!name || !type || !value || !created_by) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const discount_id = uuidv4();
    
    // Create discount
    await runQuery(
      `INSERT INTO discounts (id, name, description, type, value, applicable_to, created_by, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [discount_id, name, description || '', type, value, applicable_to || 'all', created_by]
    );

    // Add product applications
    if (applicable_to === 'product' && products.length > 0) {
      for (const product_id of products) {
        const app_id = uuidv4();
        await runQuery(
          'INSERT INTO discount_applications (id, discount_id, product_id) VALUES (?, ?, ?)',
          [app_id, discount_id, product_id]
        );
      }
    }

    // Add category applications
    if (applicable_to === 'category' && categories.length > 0) {
      for (const category of categories) {
        const app_id = uuidv4();
        await runQuery(
          'INSERT INTO discount_applications (id, discount_id, category) VALUES (?, ?, ?)',
          [app_id, discount_id, category]
        );
      }
    }

    res.json({ 
      message: 'Discount created',
      discount_id,
      discount: {
        id: discount_id,
        name,
        type,
        value,
        applicable_to
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update discount (admin only)
router.put('/:discount_id', async (req, res) => {
  try {
    const { discount_id } = req.params;
    const { name, description, value, is_active } = req.body;

    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (value !== undefined) {
      updates.push('value = ?');
      values.push(value);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(discount_id);
    updates.push('updated_at = CURRENT_TIMESTAMP');

    await runQuery(
      `UPDATE discounts SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({ message: 'Discount updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete discount (admin only)
router.delete('/:discount_id', async (req, res) => {
  try {
    const { discount_id } = req.params;

    await runQuery('DELETE FROM discount_applications WHERE discount_id = ?', [discount_id]);
    await runQuery('DELETE FROM discounts WHERE id = ?', [discount_id]);

    res.json({ message: 'Discount deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get applicable discounts for a product
router.get('/product/:product_id/applicable', async (req, res) => {
  try {
    const { product_id } = req.params;

    // Get product category
    const product = await getRecord(
      'SELECT category FROM products WHERE id = ?',
      [product_id]
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get applicable discounts
    const discounts = await getRecords(
      `SELECT DISTINCT d.* FROM discounts d
       LEFT JOIN discount_applications da ON d.id = da.discount_id
       WHERE d.is_active = 1 AND (
         d.applicable_to = 'all' OR
         (d.applicable_to = 'product' AND da.product_id = ?) OR
         (d.applicable_to = 'category' AND da.category = ?)
       )`,
      [product_id, product.category]
    );

    res.json({ 
      discounts,
      count: discounts.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
