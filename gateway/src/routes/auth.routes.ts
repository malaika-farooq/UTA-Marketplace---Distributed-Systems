import { Router } from 'express';
import { authClient } from '../grpc-clients.js';

const router = Router();

// Register
router.post('/register', (req, res) => {
  const { email, password, full_name, phone } = req.body;

  authClient.Register(
    { email, password, full_name, phone },
    (err: any, response: any) => {
      if (err) {
        console.error('Register error:', err);
        return res.status(500).json({ error: 'Registration failed' });
      }

      if (!response.success) {
        return res.status(400).json({ error: response.message });
      }

      res.json({
        success: true,
        message: response.message,
        user_id: response.user_id,
        token: response.token,
      });
    }
  );
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  authClient.Login({ email, password }, (err: any, response: any) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Login failed' });
    }

    if (!response.success) {
      return res.status(401).json({ error: response.message });
    }

    res.json({
      success: true,
      message: response.message,
      user_id: response.user_id,
      token: response.token,
    });
  });
});

// Refresh token
router.post('/refresh', (req, res) => {
  const { token } = req.body;

  authClient.RefreshToken({ token }, (err: any, response: any) => {
    if (err) {
      console.error('Refresh token error:', err);
      return res.status(500).json({ error: 'Token refresh failed' });
    }

    if (!response.success) {
      return res.status(401).json({ error: response.message });
    }

    res.json({
      success: true,
      token: response.new_token,
    });
  });
});

export default router;
