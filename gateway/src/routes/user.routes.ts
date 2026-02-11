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

// Get favorites
router.get('/favorites', requireAuth, (req: AuthRequest, res) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;

  userClient.GetFavorites(
    {
      user_id: req.userId,
      limit,
      offset,
    },
    (err: any, response: any) => {
      if (err) {
        console.error('GetFavorites error:', err);
        return res.status(500).json({ error: 'Failed to retrieve favorites' });
      }

      res.json({
        favorites: response.favorites,
        total_count: response.total_count,
      });
    }
  );
});

// Add favorite
router.post('/favorites/:listingId', requireAuth, (req: AuthRequest, res) => {
  const { listingId } = req.params;

  userClient.AddFavorite(
    {
      user_id: req.userId,
      listing_id: listingId,
    },
    (err: any, response: any) => {
      if (err) {
        console.error('AddFavorite error:', err);
        return res.status(500).json({ error: 'Failed to add favorite' });
      }

      res.json({ success: response.success, message: response.message });
    }
  );
});

// Remove favorite
router.delete('/favorites/:listingId', requireAuth, (req: AuthRequest, res) => {
  const { listingId } = req.params;

  userClient.RemoveFavorite(
    {
      user_id: req.userId,
      listing_id: listingId,
    },
    (err: any, response: any) => {
      if (err) {
        console.error('RemoveFavorite error:', err);
        return res.status(500).json({ error: 'Failed to remove favorite' });
      }

      res.json({ success: response.success, message: response.message });
    }
  );
});

// Check if listing is favorited
router.get('/favorites/:listingId/check', requireAuth, (req: AuthRequest, res) => {
  const { listingId } = req.params;

  userClient.IsFavorite(
    {
      user_id: req.userId,
      listing_id: listingId,
    },
    (err: any, response: any) => {
      if (err) {
        console.error('IsFavorite error:', err);
        return res.status(500).json({ error: 'Failed to check favorite status' });
      }

      res.json({ is_favorite: response.is_favorite });
    }
  );
});

export default router;
