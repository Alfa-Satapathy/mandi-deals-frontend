import express from 'express';
import { 
  hashPassword, 
  comparePassword, 
  generateToken, 
  verifyToken,
  createUser, 
  getUserByPhone,
  getUserById,
  getCustomerByUserId,
  authMiddleware 
} from '../auth.js';
import { getRecord } from '../database.js';

const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
  try {
    const { phone, name, password, role } = req.body;

    if (!phone || !name || !password) {
      return res.status(400).json({ error: 'Phone, name, and password required' });
    }

    // Check if user already exists
    const existingUser = await getUserByPhone(phone);
    if (existingUser) {
      return res.status(400).json({ error: 'Phone already registered' });
    }

    // Create user
    const userId = await createUser(phone, name, password, role || 'customer');
    const user = await getUserById(userId);

    res.json({
      message: 'User registered successfully',
      user_id: user.id,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone and password required' });
    }

    // Get user
    const user = await getUserByPhone(phone);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const passwordMatch = await comparePassword(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get current user (requires auth)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    
    // Get customer profile if customer
    let customer = null;
    if (user.role === 'customer') {
      customer = await getCustomerByUserId(user.id);
    }

    res.json({
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role
      },
      customer
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
