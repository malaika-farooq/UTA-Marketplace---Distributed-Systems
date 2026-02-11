import { Router } from 'express';
import { searchClient } from '../grpc-clients.js';

const router = Router();

// Search listings
router.get('/listings', (req, res) => {
  const {
    query,
    category_id,
    condition_id,
    min_price,
    max_price,
    meet_spot_id,
    sort_by,
    limit,
    offset,
  } = req.query;

  searchClient.SearchListings(
    {
      query: query as string,
      category_id: category_id as string,
      condition_id: condition_id as string,
      min_price: min_price ? parseFloat(min_price as string) : undefined,
      max_price: max_price ? parseFloat(max_price as string) : undefined,
      meet_spot_id: meet_spot_id as string,
      sort_by: (sort_by as string) || 'date_desc',
      limit: parseInt((limit as string) || '20'),
      offset: parseInt((offset as string) || '0'),
    },
    (err: any, response: any) => {
      if (err) {
        console.error('SearchListings error:', err);
        return res.status(500).json({ error: 'Search failed' });
      }

      res.json({
        results: response.results,
        total_count: response.total_count,
      });
    }
  );
});

// Get categories
router.get('/categories', (req, res) => {
  searchClient.GetCategories({}, (err: any, response: any) => {
    if (err) {
      console.error('GetCategories error:', err);
      return res.status(500).json({ error: 'Failed to retrieve categories' });
    }

    res.json(response.categories);
  });
});

// Get conditions
router.get('/conditions', (req, res) => {
  searchClient.GetConditions({}, (err: any, response: any) => {
    if (err) {
      console.error('GetConditions error:', err);
      return res.status(500).json({ error: 'Failed to retrieve conditions' });
    }

    res.json(response.conditions);
  });
});

// Get meet spots
router.get('/meetspots', (req, res) => {
  searchClient.GetMeetSpots({}, (err: any, response: any) => {
    if (err) {
      console.error('GetMeetSpots error:', err);
      return res.status(500).json({ error: 'Failed to retrieve meet spots' });
    }

    res.json(response.meet_spots);
  });
});

export default router;
