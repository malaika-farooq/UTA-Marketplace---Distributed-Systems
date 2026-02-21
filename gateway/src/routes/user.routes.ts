import { Router } from 'express';
import { userClient } from '../grpc-clients.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get user profile
router.get('/profile', requireAuth, (req: AuthRequest, res) => {
  userClient.GetUserProfile({ user_id: req.userId }, (err: any, response: any) => {
    if (err) {
      console.error('GetUserProfile error:', err);
      return res.status(500).json({ error: 'Failed to retrieve profile' });
    }

    if (!response.success) {
      return res.status(404).json({ error: response.message });
    }

    res.json(response.profile);
  });
});

// Update user profile
router.put('/profile', requireAuth, (req: AuthRequest, res) => {
  const { full_name, phone, whatsapp, avatar_url } = req.body;

  userClient.UpdateUserProfile(
    {
      user_id: req.userId,
      full_name,
      phone,
      whatsapp,
      avatar_url,
    },
    (err: any, response: any) => {
      if (err) {
        console.error('UpdateUserProfile error:', err);
        return res.status(500).json({ error: 'Failed to update profile' });
      }

      res.json(response.profile);
    }
  );
});

export default router;
