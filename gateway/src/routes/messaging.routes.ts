import { Router } from 'express';
import { messagingClient } from '../grpc-clients.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.post('/initiate', requireAuth, (req: AuthRequest, res) => {
  const { listing_id, seller_id, contact_method } = req.body;

  messagingClient.InitiateContact(
    {
      user_id: req.userId,
      listing_id,
      seller_id,
      contact_method,
    },
    (err: any, response: any) => {
      if (err) {
        console.error('InitiateContact error:', err);
        return res.status(500).json({ error: 'Failed to initiate contact' });
      }

      // 🔥 LOG CONTACT ATTEMPT
      messagingClient.LogContactAttempt(
        {
          user_id: req.userId,
          listing_id,
          seller_id,
          contact_method,
          timestamp: Date.now(),
        },
        () => {
          // we don’t block response if logging fails
        }
      );

      res.json({
        success: response.success,
        message: response.message,
        contact_url: response.contact_url,
        contact_info: response.contact_info,
      });
    }
  );
});

// Get contact info for a seller
router.get('/contact/:sellerId/:listingId', (req, res) => {
  const { sellerId, listingId } = req.params;

  messagingClient.GetContactInfo(
    {
      seller_id: sellerId,
      listing_id: listingId,
    },
    (err: any, response: any) => {
      if (err) {
        console.error('GetContactInfo error:', err);
        return res.status(500).json({ error: 'Failed to retrieve contact info' });
      }

      res.json(response.contact_info);
    }
  );
});

// Get contact history (requires auth)
router.get('/history', requireAuth, (req: AuthRequest, res) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;

  messagingClient.GetContactHistory(
    {
      user_id: req.userId,
      limit,
      offset,
    },
    (err: any, response: any) => {
      if (err) {
        console.error('GetContactHistory error:', err);
        return res.status(500).json({ error: 'Failed to retrieve contact history' });
      }

      res.json({
        attempts: response.attempts,
        total_count: response.total_count,
      });
    }
  );
});

export default router;
