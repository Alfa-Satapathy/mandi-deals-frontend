import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getRecord, runQuery, getRecords } from './database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production_12345';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

// Hash password
export const hashPassword = async (password) => {
  const salt = await bcryptjs.genSalt(10);
  return await bcryptjs.hash(password, salt);
};

// Compare password
export const comparePassword = async (password, hash) => {
  return await bcryptjs.compare(password, hash);
};

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Middleware to check authentication
export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Get user from database
    const user = await getRecord('SELECT * FROM users WHERE id = ?', [decoded.userId]);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create user
export const createUser = async (phone, name, password, role = 'customer') => {
  const userId = uuidv4();
  const hashedPassword = await hashPassword(password);

  await runQuery(
    'INSERT INTO users (id, phone, name, password_hash, role) VALUES (?, ?, ?, ?, ?)',
    [userId, phone, name, hashedPassword, role]
  );

  // Create customer profile if customer role
  if (role === 'customer') {
    const profileId = uuidv4();
    await runQuery(
      'INSERT INTO customer_profiles (id, user_id) VALUES (?, ?)',
      [profileId, userId]
    );

    // Create wallet for customer
    const walletId = uuidv4();
    await runQuery(
      'INSERT INTO wallets (id, customer_id) VALUES (?, ?)',
      [walletId, profileId]
    );
  }

  return userId;
};

// Get user by phone
export const getUserByPhone = async (phone) => {
  return await getRecord('SELECT * FROM users WHERE phone = ?', [phone]);
};

// Get user by ID
export const getUserById = async (id) => {
  return await getRecord('SELECT * FROM users WHERE id = ?', [id]);
};

// Get customer by user ID
export const getCustomerByUserId = async (userId) => {
  return await getRecord('SELECT * FROM customer_profiles WHERE user_id = ?', [userId]);
};

// Get customer by phone
export const getCustomerByPhone = async (phone) => {
  const user = await getRecord('SELECT id FROM users WHERE phone = ?', [phone]);
  if (!user) return null;
  return await getRecord('SELECT * FROM customer_profiles WHERE user_id = ?', [user.id]);
};

// Get wallet by customer ID
export const getWallet = async (customerId) => {
  return await getRecord('SELECT * FROM wallets WHERE customer_id = ?', [customerId]);
};

// Update wallet points
export const updateWalletPoints = async (customerId, availablePoints, redeemablePoints, remainingPoints) => {
  await runQuery(
    'UPDATE wallets SET available_points = ?, redeemable_points = ?, remaining_points = ?, updated_at = CURRENT_TIMESTAMP WHERE customer_id = ?',
    [availablePoints, redeemablePoints, remainingPoints, customerId]
  );
};

// Add points to wallet
export const addPointsToWallet = async (customerId, points) => {
  const wallet = await getWallet(customerId);
  if (!wallet) throw new Error('Wallet not found');

  const newAvailable = (wallet.available_points || 0) + points;
  const newTotal = (wallet.total_points_earned || 0) + points;

  await runQuery(
    'UPDATE wallets SET available_points = ?, total_points_earned = ?, updated_at = CURRENT_TIMESTAMP WHERE customer_id = ?',
    [newAvailable, newTotal, customerId]
  );

  return { available_points: newAvailable, total_points_earned: newTotal };
};

// Redeem points from wallet
export const redeemPoints = async (customerId, pointsToRedeem) => {
  const wallet = await getWallet(customerId);
  if (!wallet) throw new Error('Wallet not found');

  if (wallet.redeemable_points < pointsToRedeem) {
    throw new Error('Insufficient redeemable points');
  }

  const newRedeemable = wallet.redeemable_points - pointsToRedeem;
  const newAvailable = (wallet.available_points || 0) - pointsToRedeem;

  await runQuery(
    'UPDATE wallets SET available_points = ?, redeemable_points = ?, updated_at = CURRENT_TIMESTAMP WHERE customer_id = ?',
    [Math.max(0, newAvailable), newRedeemable, customerId]
  );

  return { available_points: Math.max(0, newAvailable), redeemable_points: newRedeemable };
};

export default {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  authMiddleware,
  createUser,
  getUserByPhone,
  getUserById,
  getCustomerByUserId,
  getWallet,
  updateWalletPoints,
  addPointsToWallet,
  redeemPoints
};
