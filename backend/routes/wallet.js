import express from 'express';
import { getRecord, runQuery } from '../database.js';
import { authMiddleware } from '../auth.js';

const router = express.Router();

// Get wallet balance
router.get('/:customer_id/balance', async (req, res) => {
  try {
    const { customer_id } = req.params;

    let wallet = await getRecord('SELECT * FROM wallets WHERE customer_id = ?', [customer_id]);

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    res.json({
      wallet_id: wallet.id,
      customer_id: wallet.customer_id,
      available_points: wallet.available_points || 0,
      redeemable_points: wallet.redeemable_points || 0,
      remaining_points: wallet.remaining_points || 0,
      total_points_earned: wallet.total_points_earned || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Redeem points
router.post('/:customer_id/redeem-points', async (req, res) => {
  try {
    const { customer_id } = req.params;
    const { points_amount, bill_total } = req.body;

    if (!points_amount || !bill_total) {
      return res.status(400).json({ error: 'points_amount and bill_total required' });
    }

    let wallet = await getRecord('SELECT * FROM wallets WHERE customer_id = ?', [customer_id]);
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    // Validate redemption
    const maxRedeemableAmount = (wallet.redeemable_points || 0) * 10;
    if (points_amount > maxRedeemableAmount) {
      return res.status(400).json({ 
        error: 'Insufficient redeemable points',
        available: maxRedeemableAmount,
        requested: points_amount
      });
    }

    // Max 50% of bill
    const maxDiscount = bill_total * 0.5;
    const discountFromPoints = Math.min(points_amount / 10, maxDiscount);

    if (discountFromPoints > maxDiscount) {
      return res.status(400).json({ error: 'Discount exceeds 50% of bill total' });
    }

    // Update wallet
    const pointsToDeduct = Math.floor(discountFromPoints * 10);
    const newRedeemable = Math.max(0, (wallet.redeemable_points || 0) - Math.ceil(pointsToDeduct / 10));
    const newAvailable = Math.max(0, (wallet.available_points || 0) - Math.ceil(pointsToDeduct / 10));

    await runQuery(
      'UPDATE wallets SET redeemable_points = ?, available_points = ?, updated_at = CURRENT_TIMESTAMP WHERE customer_id = ?',
      [newRedeemable, newAvailable, customer_id]
    );

    res.json({
      message: 'Points applied',
      discount_amount: discountFromPoints,
      points_used: Math.ceil(pointsToDeduct / 10),
      new_balance: {
        available_points: newAvailable,
        redeemable_points: newRedeemable
      }
    });
  } catch (error) {
    console.error('Redeem error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add points to wallet
router.post('/:customer_id/add-points', async (req, res) => {
  try {
    const { customer_id } = req.params;
    const { points } = req.body;

    if (!points) {
      return res.status(400).json({ error: 'Points required' });
    }

    let wallet = await getRecord('SELECT * FROM wallets WHERE customer_id = ?', [customer_id]);
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const newAvailable = (wallet.available_points || 0) + points;
    const newRedeemable = (wallet.redeemable_points || 0) + points;
    const newTotal = (wallet.total_points_earned || 0) + points;

    await runQuery(
      'UPDATE wallets SET available_points = ?, redeemable_points = ?, total_points_earned = ?, updated_at = CURRENT_TIMESTAMP WHERE customer_id = ?',
      [newAvailable, newRedeemable, newTotal, customer_id]
    );

    res.json({
      message: 'Points added',
      new_balance: {
        available_points: newAvailable,
        redeemable_points: newRedeemable,
        total_points_earned: newTotal
      }
    });
  } catch (error) {
    console.error('Add points error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
