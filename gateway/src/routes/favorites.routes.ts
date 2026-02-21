import { Router } from 'express';
import { favoritesClient } from '../grpc-clients.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get favorites
router.get('/', requireAuth, (req: AuthRequest, res) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;

  favoritesClient.GetFavorites(
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
router.post('/:listingId', requireAuth, (req: AuthRequest, res) => {
  const { listingId } = req.params;

  favoritesClient.AddFavorite(
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
router.delete('/:listingId', requireAuth, (req: AuthRequest, res) => {
  const { listingId } = req.params;

  favoritesClient.RemoveFavorite(
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
router.get('/:listingId/check', requireAuth, (req: AuthRequest, res) => {
  const { listingId } = req.params;

  favoritesClient.IsFavorite(
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
