import * as grpc from '@grpc/grpc-js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://uta:uta@postgres:5432/uta_marketplace',
});

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const SALT_ROUNDS = 10;

export const AuthServiceHandlers = {
  async Register(call: any, callback: any) {
    const { email, password, full_name, phone } = call.request;

    try {
      // Check if user already exists
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return callback(null, {
          success: false,
          message: 'Email already registered',
          user_id: '',
          token: '',
        });
      }

      // Hash password
      const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
      const user_id = uuidv4();

      // Insert new user
      await pool.query(
        'INSERT INTO users (id, email, password_hash, full_name, phone) VALUES ($1, $2, $3, $4, $5)',
        [user_id, email, password_hash, full_name, phone || null]
      );

      // Generate JWT token
      const token = jwt.sign({ userId: user_id, email }, JWT_SECRET, {
        expiresIn: '7d',
      });

      callback(null, {
        success: true,
        message: 'Registration successful',
        user_id,
        token,
      });
    } catch (error) {
      console.error('Register error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Internal server error',
      });
    }
  },

  async Login(call: any, callback: any) {
    const { email, password } = call.request;

    try {
      // Find user
      const result = await pool.query(
        'SELECT id, password_hash FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return callback(null, {
          success: false,
          message: 'Invalid email or password',
          user_id: '',
          token: '',
        });
      }

      const user = result.rows[0];

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password_hash);

      if (!validPassword) {
        return callback(null, {
          success: false,
          message: 'Invalid email or password',
          user_id: '',
          token: '',
        });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id, email }, JWT_SECRET, {
        expiresIn: '7d',
      });

      callback(null, {
        success: true,
        message: 'Login successful',
        user_id: user.id,
        token,
      });
    } catch (error) {
      console.error('Login error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Internal server error',
      });
    }
  },

  async ValidateToken(call: any, callback: any) {
    const { token } = call.request;

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      callback(null, {
        valid: true,
        user_id: decoded.userId,
        message: 'Token is valid',
      });
    } catch (error) {
      callback(null, {
        valid: false,
        user_id: '',
        message: 'Invalid or expired token',
      });
    }
  },

  async RefreshToken(call: any, callback: any) {
    const { token } = call.request;

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      // Generate new token
      const new_token = jwt.sign(
        { userId: decoded.userId, email: decoded.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      callback(null, {
        success: true,
        new_token,
        message: 'Token refreshed successfully',
      });
    } catch (error) {
      callback(null, {
        success: false,
        new_token: '',
        message: 'Invalid or expired token',
      });
    }
  },
};
