import { Router } from 'express';
import { listingClient } from '../grpc-clients.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Create listing (requires auth)
router.post('/', requireAuth, (req: AuthRequest, res) => {
  const {
    title,
    description,
    price,
    category_id,
    condition_id,
    seller_email,
    seller_whatsapp,
    image_url,
    meet_spot_id,
  } = req.body;

  listingClient.CreateListing(
    {
      user_id: req.userId,
      title,
      description,
      price,
      category_id,
      condition_id,
      seller_email,
      seller_whatsapp,
      image_url,
      meet_spot_id,
    },
    (err: any, response: any) => {
      if (err) {
        console.error('CreateListing error:', err);
        return res.status(500).json({ error: 'Failed to create listing' });
      }

      res.json(response);
    }
  );
});

// Get single listing
router.get('/:id', (req, res) => {
  const { id } = req.params;

  listingClient.GetListing({ listing_id: id }, (err: any, response: any) => {
    if (err) {
      console.error('GetListing error:', err);
      return res.status(500).json({ error: 'Failed to retrieve listing' });
    }

    if (!response.success) {
      return res.status(404).json({ error: response.message });
    }

    res.json(response.listing);
  });
});

// Update listing (requires auth)
router.put('/:id', requireAuth, (req: AuthRequest, res) => {
  const { id } = req.params;
  const updates = req.body;

  listingClient.UpdateListing(
    {
      listing_id: id,
      user_id: req.userId,
      ...updates,
    },
    (err: any, response: any) => {
      if (err) {
        console.error('UpdateListing error:', err);
        return res.status(500).json({ error: 'Failed to update listing' });
      }

      if (!response.success) {
        return res.status(403).json({ error: response.message });
      }

      res.json(response.listing);
    }
  );
});

// Delete listing (requires auth)
router.delete('/:id', requireAuth, (req: AuthRequest, res) => {
  const { id } = req.params;

  listingClient.DeleteListing(
    {
      listing_id: id,
      user_id: req.userId,
    },
    (err: any, response: any) => {
      if (err) {
        console.error('DeleteListing error:', err);
        return res.status(500).json({ error: 'Failed to delete listing' });
      }

      if (!response.success) {
        return res.status(403).json({ error: response.message });
      }

      res.json({ success: true, message: response.message });
    }
  );
});

// Get all listings
router.get('/', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;

  listingClient.GetAllListings({ limit, offset }, (err: any, response: any) => {
    if (err) {
      console.error('GetAllListings error:', err);
      return res.status(500).json({ error: 'Failed to retrieve listings' });
    }

    res.json({
      listings: response.listings,
      total_count: response.total_count,
    });
  });
});

// Get user's listings (requires auth)
router.get('/user/my-listings', requireAuth, (req: AuthRequest, res) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;

  listingClient.GetUserListings(
    {
      user_id: req.userId,
      limit,
      offset,
    },
    (err: any, response: any) => {
      if (err) {
        console.error('GetUserListings error:', err);
        return res.status(500).json({ error: 'Failed to retrieve listings' });
      }

      res.json({
        listings: response.listings,
        total_count: response.total_count,
      });
    }
  );
});

export default router;
