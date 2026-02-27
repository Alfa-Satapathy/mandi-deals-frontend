import express from 'express';
import { getRecords, getRecord, runQuery } from '../database.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

const getStatus = (current_stock) => {
  if (current_stock === 0) return 'out-of-stock';
  if (current_stock <= 20) return 'low-stock';
  return 'in-stock';
};

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;

    let query = 'SELECT * FROM products';
    let params = [];

    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }

    if (search) {
      query += (category ? ' AND ' : ' WHERE ') + 'name LIKE ?';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY name';

    const products = await getRecords(query, params);

    const productsWithStatus = products.map(p => ({
      ...p,
      quantity: p.current_stock, // Alias for frontend compatibility
      status: getStatus(p.current_stock)
    }));

    res.json(productsWithStatus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await getRecord('SELECT * FROM products WHERE id = ?', [req.params.id]);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      ...product,
      quantity: product.current_stock, // Alias for frontend compatibility
      status: getStatus(product.current_stock)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product stock
router.put('/:id/stock', async (req, res) => {
  try {
    const { new_stock, reason } = req.body;

    if (new_stock === undefined) {
      return res.status(400).json({ error: 'new_stock required' });
    }

    const product = await getRecord('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await runQuery(
      'UPDATE products SET current_stock = ?, status = ?, updated_at = datetime("now") WHERE id = ?',
      [new_stock, getStatus(new_stock), req.params.id]
    );

    res.json({
      message: 'Stock updated',
      product: {
        ...product,
        current_stock: new_stock,
        quantity: new_stock, // Alias for frontend compatibility
        status: getStatus(new_stock)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new product (vendor/admin)
router.post('/', async (req, res) => {
  try {
    const { name, category, price, current_stock, unit, vendor_name } = req.body;

    if (!name || !category || price === undefined || current_stock === undefined) {
      return res.status(400).json({ error: 'name, category, price, and current_stock required' });
    }

    const productId = uuidv4();
    const status = getStatus(current_stock);

    await runQuery(
      'INSERT INTO products (id, name, category, price, current_stock, unit, status, vendor_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime("now"), datetime("now"))',
      [productId, name, category, price, current_stock, unit || 'kg', status, vendor_name || 'Default Vendor']
    );

    res.json({
      message: 'Product created',
      product: {
        id: productId,
        name,
        category,
        price,
        current_stock,
        unit: unit || 'kg',
        vendor_name: vendor_name || 'Default Vendor',
        status
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get categories
router.get('/categories/list', async (req, res) => {
  try {
    const rows = await getRecords('SELECT DISTINCT category FROM products ORDER BY category');
    const categories = rows.map(r => r.category);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
