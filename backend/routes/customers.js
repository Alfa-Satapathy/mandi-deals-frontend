import express from 'express';
import { getRecord, getRecords, runQuery } from '../database.js';
import { getCustomerByPhone, createUser } from '../auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Search customer by phone
router.get('/search', async (req, res) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({ error: 'Phone required' });
    }

    const customer = await getCustomerByPhone(phone);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Get wallet info
    const wallet = await getRecord('SELECT * FROM wallets WHERE customer_id = ?', [customer.id]);

    res.json({
      found: true,
      customer: {
        id: customer.id,
        phone: phone,
        name: (await getRecord('SELECT name FROM users WHERE id = ?', [customer.user_id])).name,
        tier: customer.tier,
        available_points: wallet?.available_points || 0,
        redeemable_points: wallet?.redeemable_points || 0,
        remaining_points: wallet?.remaining_points || 0
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Quick register new customer
router.post('/quick-register', async (req, res) => {
  try {
    const { phone, name } = req.body;

    if (!phone || !name) {
      return res.status(400).json({ error: 'Phone and name required' });
    }

    // Check if already exists
    const existingCustomer = await getCustomerByPhone(phone);
    if (existingCustomer) {
      return res.status(400).json({ error: 'Customer already exists' });
    }

    // Create user and customer
    const userId = await createUser(phone, name, 'password123', 'customer');
    const customer = await getRecord('SELECT * FROM customer_profiles WHERE user_id = ?', [userId]);

    res.json({
      message: 'Customer registered',
      customer_id: customer.id,
      customer: {
        id: customer.id,
        phone,
        name,
        tier: customer.tier,
        available_points: 0,
        redeemable_points: 0,
        remaining_points: 0
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get customer by ID
router.get('/:id', async (req, res) => {
  try {
    const customer = await getRecord('SELECT * FROM customer_profiles WHERE id = ?', [req.params.id]);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Get user info
    const user = await getRecord('SELECT name, phone FROM users WHERE id = ?', [customer.user_id]);
    
    // Get wallet
    const wallet = await getRecord('SELECT * FROM wallets WHERE customer_id = ?', [customer.id]);

    res.json({
      id: customer.id,
      phone: user.phone,
      name: user.name,
      tier: customer.tier,
      available_points: wallet?.available_points || 0,
      redeemable_points: wallet?.redeemable_points || 0,
      remaining_points: wallet?.remaining_points || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
