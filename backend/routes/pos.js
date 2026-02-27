import express from 'express';
import { getRecord, getRecords, runQuery } from '../database.js';
import { v4 as uuidv4 } from 'uuid';
import { sendReceiptNotification, sendPointsNotification } from '../notifications.js';

const router = express.Router();

// In-memory bills for current session (cleared when server restarts)
let activeBills = {};

// Create bill
router.post('/create-bill', async (req, res) => {
  try {
    const { staff_id, counter_id, customer_id } = req.body;

    if (!staff_id) {
      return res.status(400).json({ error: 'staff_id required' });
    }

    const billId = uuidv4();
    activeBills[billId] = {
      id: billId,
      staff_id,
      counter_id: counter_id || 'counter-1',
      customer_id: customer_id || null,
      items: [],
      subtotal: 0,
      discount: 0,
      total: 0,
      created_at: new Date().toISOString()
    };

    res.json({
      message: 'Bill created',
      bill_id: billId,
      bill: activeBills[billId]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add item to bill
router.post('/add-item', async (req, res) => {
  try {
    const { bill_id, product_id, quantity, price } = req.body;

    if (!bill_id || !product_id || !quantity || !price) {
      return res.status(400).json({ error: 'bill_id, product_id, quantity, and price required' });
    }

    if (!activeBills[bill_id]) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    const bill = activeBills[bill_id];

    // Check if item already in bill
    const existingItem = bill.items.find(i => i.product_id === product_id);
    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.total_price = existingItem.quantity * existingItem.unit_price;
    } else {
      bill.items.push({
        product_id,
        quantity,
        unit_price: price,
        total_price: quantity * price
      });
    }

    // Recalculate subtotal
    bill.subtotal = bill.items.reduce((sum, item) => sum + item.total_price, 0);
    bill.total = bill.subtotal - bill.discount;

    res.json({
      message: 'Item added',
      bill_id,
      items_count: bill.items.length,
      subtotal: bill.subtotal,
      total: bill.total,
      bill
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove item from bill
router.post('/remove-item', async (req, res) => {
  try {
    const { bill_id, product_id } = req.body;

    if (!bill_id || !product_id) {
      return res.status(400).json({ error: 'bill_id and product_id required' });
    }

    if (!activeBills[bill_id]) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    const bill = activeBills[bill_id];
    bill.items = bill.items.filter(i => i.product_id !== product_id);

    bill.subtotal = bill.items.reduce((sum, item) => sum + item.total_price, 0);
    bill.total = bill.subtotal - bill.discount;

    res.json({
      message: 'Item removed',
      bill_id,
      subtotal: bill.subtotal,
      total: bill.total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get bill
router.get('/bill/:bill_id', async (req, res) => {
  try {
    const { bill_id } = req.params;

    if (!activeBills[bill_id]) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    res.json(activeBills[bill_id]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Apply points to bill
router.post('/apply-points', async (req, res) => {
  try {
    const { bill_id, points_to_use } = req.body;

    if (!bill_id || !points_to_use) {
      return res.status(400).json({ error: 'bill_id and points_to_use required' });
    }

    if (!activeBills[bill_id]) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    const bill = activeBills[bill_id];

    // 10 points = ₹1
    const discount = Math.min(points_to_use / 10, bill.subtotal * 0.5);

    bill.discount = discount;
    bill.total = bill.subtotal - discount;

    res.json({
      message: 'Points applied',
      bill_id,
      points_used: Math.floor(discount * 10),
      discount,
      new_total: bill.total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Complete transaction
router.post('/complete-transaction', async (req, res) => {
  try {
    const { bill_id, customer_id, payment_method, points_used, points_earned, allocate_points } = req.body;

    if (!bill_id || !payment_method) {
      return res.status(400).json({ error: 'bill_id and payment_method required' });
    }

    if (!activeBills[bill_id]) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    const bill = activeBills[bill_id];

    // Create transaction in database
    const transactionId = uuidv4();
    
    await runQuery(
      'INSERT INTO transactions (id, customer_id, staff_id, total_amount, discount_amount, points_used, payment_method, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        transactionId,
        customer_id || null,
        bill.staff_id,
        bill.total,
        bill.discount,
        points_used || 0,
        payment_method,
        'completed'
      ]
    );

    // Add transaction items
    for (const item of bill.items) {
      const itemId = uuidv4();
      await runQuery(
        'INSERT INTO transaction_items (id, transaction_id, product_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?, ?)',
        [itemId, transactionId, item.product_id, item.quantity, item.unit_price, item.total_price]
      );

      // Update product stock
      const product = await getRecord('SELECT * FROM products WHERE id = ?', [item.product_id]);
      if (product) {
        const newQuantity = Math.max(0, product.current_stock - item.quantity);
        await runQuery(
          'UPDATE products SET current_stock = ?, updated_at = datetime("now") WHERE id = ?',
          [newQuantity, item.product_id]
        );
      }
    }

    // Update customer points if applicable
    let newWalletBalance = null;
    if (customer_id) {
      const wallet = await getRecord('SELECT * FROM wallets WHERE customer_id = ?', [customer_id]);
      if (wallet) {
        let newAvailable = wallet.available_points || 0;
        let newRedeemable = wallet.redeemable_points || 0;

        // Deduct points used
        if (points_used && points_used > 0) {
          const pointsToDeduct = Math.ceil(points_used / 10);
          newRedeemable = Math.max(0, newRedeemable - pointsToDeduct);
          newAvailable = Math.max(0, newAvailable - pointsToDeduct);
        }

        // Add points earned
        if (allocate_points && points_earned && points_earned > 0) {
          newAvailable = newAvailable + points_earned;
          newRedeemable = newRedeemable + points_earned;
        }

        // Update wallet with both changes
        await runQuery(
          'UPDATE wallets SET available_points = ?, redeemable_points = ?, updated_at = CURRENT_TIMESTAMP WHERE customer_id = ?',
          [newAvailable, newRedeemable, customer_id]
        );
        newWalletBalance = newAvailable;
      }
    }

    // Fetch customer info for notification
    let customer = null;
    if (customer_id) {
      customer = await getRecord('SELECT * FROM customer_profiles WHERE id = ?', [customer_id]);
      if (!customer) {
        customer = await getRecord('SELECT * FROM users WHERE id = ?', [customer_id]);
      }
    }

    // Send SMS receipt notification
    if (customer) {
      const transactionData = {
        transaction_id: transactionId,
        final_amount: bill.total,
        points_used: points_used || 0
      };
      // Send asynchronously without waiting
      sendReceiptNotification(customer, transactionData).catch(err => 
        console.error('Failed to send receipt notification:', err)
      );
    }

    // Clear bill from memory
    delete activeBills[bill_id];

    res.json({
      message: 'Transaction completed',
      transaction_id: transactionId,
      final_amount: bill.total,
      items_sold: bill.items.length,
      new_wallet_balance: newWalletBalance
    });
  } catch (error) {
    console.error('Complete transaction error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get receipt
router.get('/receipt/:transaction_id', async (req, res) => {
  try {
    const { transaction_id } = req.params;

    const transaction = await getRecord('SELECT * FROM transactions WHERE id = ?', [transaction_id]);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const items = await getRecords('SELECT * FROM transaction_items WHERE transaction_id = ?', [transaction_id]);

    res.json({
      receipt_number: transaction.id,
      date: transaction.created_at,
      items: items,
      subtotal: transaction.total_amount + transaction.discount_amount,
      discount: transaction.discount_amount,
      final_amount: transaction.total_amount,
      payment_method: transaction.payment_method,
      points_used: transaction.points_used
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
