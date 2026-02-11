import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const SALT_ROUNDS = 10;

router.post('/register', async (req, res) => {
  const { email, password, full_name, phone } = req.body;

  try {
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user_id = uuidv4();

    await pool.query(
      'INSERT INTO users (id, email, password_hash, full_name, phone) VALUES ($1, $2, $3, $4, $5)',
      [user_id, email, password_hash, full_name, phone || null]
    );

    const token = jwt.sign({ userId: user_id, email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      success: true,
      message: 'Registration successful',
      user_id,
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT id, password_hash FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = jwt.sign({ userId: user.id, email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      success: true,
      message: 'Login successful',
      user_id: user.id,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/validate', async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    res.json({
      valid: true,
      user_id: decoded.userId,
      message: 'Token is valid',
    });
  } catch (error) {
    res.json({
      valid: false,
      user_id: '',
      message: 'Invalid or expired token',
    });
  }
});

router.post('/refresh', async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const new_token = jwt.sign(
      { userId: decoded.userId, email: decoded.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      new_token,
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      new_token: '',
      message: 'Invalid or expired token',
    });
  }
});

export default router;
