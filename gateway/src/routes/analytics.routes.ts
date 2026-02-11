import { Router } from 'express';
import { analyticsClient } from '../grpc-clients.js';
import { requireAuth, optionalAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Track a listing view
router.post('/track/view', optionalAuth, (req: AuthRequest, res) => {
  const { listing_id, referrer } = req.body;

  analyticsClient.TrackView(
    {
      listing_id,
      user_id: req.userId || '',
      timestamp: Date.now(),
      referrer: referrer || '',
    },
    (err: any, response: any) => {
      if (err) {
        console.error('TrackView error:', err);
        return res.status(500).json({ error: 'Failed to track view' });
      }

      res.json({ success: response.success });
    }
  );
});

// Get listing view stats
router.get('/listings/:id/views', (req, res) => {
  const { id } = req.params;

  analyticsClient.GetListingViews({ listing_id: id }, (err: any, response: any) => {
    if (err) {
      console.error('GetListingViews error:', err);
      return res.status(500).json({ error: 'Failed to retrieve view stats' });
    }

    res.json({
      total_views: response.total_views,
      unique_views: response.unique_views,
      views_today: response.views_today,
      views_week: response.views_week,
    });
  });
});

// Get trending listings
router.get('/trending', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const time_window = (req.query.time_window as string) || 'week';

  analyticsClient.GetTrendingListings(
    {
      limit,
      time_window,
    },
    (err: any, response: any) => {
      if (err) {
        console.error('GetTrendingListings error:', err);
        return res.status(500).json({ error: 'Failed to retrieve trending listings' });
      }

      res.json(response.listings);
    }
  );
});

// Get personalized recommendations (requires auth)
router.get('/recommendations', requireAuth, (req: AuthRequest, res) => {
  const limit = parseInt(req.query.limit as string) || 10;

  analyticsClient.GetRecommendations(
    {
      user_id: req.userId,
      limit,
    },
    (err: any, response: any) => {
      if (err) {
        console.error('GetRecommendations error:', err);
        return res.status(500).json({ error: 'Failed to retrieve recommendations' });
      }

      res.json(response.recommendations);
    }
  );
});

// Get user analytics (requires auth)
router.get('/user/stats', requireAuth, (req: AuthRequest, res) => {
  analyticsClient.GetUserAnalytics({ user_id: req.userId }, (err: any, response: any) => {
    if (err) {
      console.error('GetUserAnalytics error:', err);
      return res.status(500).json({ error: 'Failed to retrieve user analytics' });
    }

    res.json(response.analytics);
  });
});

export default router;
