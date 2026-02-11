import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.post('/track-view', async (req, res) => {
  const { listing_id, user_id, referrer } = req.body;

  try {
    await pool.query(
      `INSERT INTO listing_views (id, listing_id, user_id, referrer)
       VALUES ($1, $2, $3, $4)`,
      [uuidv4(), listing_id, user_id || null, referrer || null]
    );

    res.json({
      success: true,
      message: 'View tracked successfully',
    });
  } catch (error) {
    console.error('TrackView error:', error);
    res.status(500).json({ error: 'Failed to track view' });
  }
});

router.get('/listing-views/:listing_id', async (req, res) => {
  const { listing_id } = req.params;

  try {
    const totalResult = await pool.query(
      'SELECT COUNT(*) as count FROM listing_views WHERE listing_id = $1',
      [listing_id]
    );
    const total_views = parseInt(totalResult.rows[0].count);

    const uniqueResult = await pool.query(
      'SELECT COUNT(DISTINCT user_id) as count FROM listing_views WHERE listing_id = $1 AND user_id IS NOT NULL',
      [listing_id]
    );
    const unique_views = parseInt(uniqueResult.rows[0].count);

    const todayResult = await pool.query(
      `SELECT COUNT(*) as count FROM listing_views
       WHERE listing_id = $1 AND timestamp >= CURRENT_DATE`,
      [listing_id]
    );
    const views_today = parseInt(todayResult.rows[0].count);

    const weekResult = await pool.query(
      `SELECT COUNT(*) as count FROM listing_views
       WHERE listing_id = $1 AND timestamp >= CURRENT_DATE - INTERVAL '7 days'`,
      [listing_id]
    );
    const views_week = parseInt(weekResult.rows[0].count);

    res.json({
      success: true,
      total_views,
      unique_views,
      views_today,
      views_week,
    });
  } catch (error) {
    console.error('GetListingViews error:', error);
    res.status(500).json({ error: 'Failed to retrieve listing views' });
  }
});

router.get('/trending', async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const time_window = (req.query.time_window as string) || 'week';

  try {
    let timeCondition = '';
    switch (time_window) {
      case 'day':
        timeCondition = "AND lv.timestamp >= CURRENT_DATE";
        break;
      case 'week':
        timeCondition = "AND lv.timestamp >= CURRENT_DATE - INTERVAL '7 days'";
        break;
      case 'month':
        timeCondition = "AND lv.timestamp >= CURRENT_DATE - INTERVAL '30 days'";
        break;
      default:
        timeCondition = "AND lv.timestamp >= CURRENT_DATE - INTERVAL '7 days'";
    }

    const query = `
      SELECT l.id as listing_id, l.title, l.price, l.image_url,
             COUNT(lv.id) as view_count,
             COUNT(DISTINCT ca.id) as contact_count,
             (COUNT(lv.id) * 1.0 + COUNT(DISTINCT ca.id) * 5.0) as trend_score
      FROM listings l
      LEFT JOIN listing_views lv ON l.id = lv.listing_id ${timeCondition}
      LEFT JOIN contact_attempts ca ON l.id = ca.listing_id ${timeCondition.replace('lv.', 'ca.')}
      WHERE l.is_active = true
      GROUP BY l.id, l.title, l.price, l.image_url
      HAVING COUNT(lv.id) > 0
      ORDER BY trend_score DESC
      LIMIT $1
    `;

    const result = await pool.query(query, [limit]);

    const listings = result.rows.map((row) => ({
      listing_id: row.listing_id,
      title: row.title,
      price: parseFloat(row.price),
      image_url: row.image_url || '',
      view_count: parseInt(row.view_count),
      contact_count: parseInt(row.contact_count),
      trend_score: parseFloat(row.trend_score),
    }));

    res.json({
      success: true,
      listings,
    });
  } catch (error) {
    console.error('GetTrendingListings error:', error);
    res.status(500).json({ error: 'Failed to retrieve trending listings' });
  }
});

router.get('/recommendations', authenticateToken, async (req: AuthRequest, res) => {
  const limit = parseInt(req.query.limit as string) || 10;

  try {
    const categoryQuery = `
      SELECT l.category_id, COUNT(*) as count
      FROM favorites f
      JOIN listings l ON f.listing_id = l.id
      WHERE f.user_id = $1
      GROUP BY l.category_id
      ORDER BY count DESC
      LIMIT 3
    `;
    const categoryResult = await pool.query(categoryQuery, [req.userId]);
    const favCategories = categoryResult.rows.map((row) => row.category_id);

    let recommendations = [];

    if (favCategories.length > 0) {
      const recommendQuery = `
        SELECT l.id as listing_id, l.title, l.price, l.image_url,
               COALESCE(view_counts.view_count, 0) as popularity_score
        FROM listings l
        LEFT JOIN (
          SELECT listing_id, COUNT(*) as view_count
          FROM listing_views
          WHERE timestamp >= CURRENT_DATE - INTERVAL '7 days'
          GROUP BY listing_id
        ) view_counts ON l.id = view_counts.listing_id
        WHERE l.category_id = ANY($1)
          AND l.is_active = true
          AND l.seller_id != $2
          AND l.id NOT IN (SELECT listing_id FROM favorites WHERE user_id = $2)
        ORDER BY popularity_score DESC, l.created_at DESC
        LIMIT $3
      `;
      const result = await pool.query(recommendQuery, [favCategories, req.userId, limit]);

      recommendations = result.rows.map((row) => ({
        listing_id: row.listing_id,
        title: row.title,
        price: parseFloat(row.price),
        image_url: row.image_url || '',
        recommendation_score: parseFloat(row.popularity_score) || 1.0,
        reason: 'Based on your favorites',
      }));
    }

    if (recommendations.length < limit) {
      const trendingQuery = `
        SELECT l.id as listing_id, l.title, l.price, l.image_url,
               COUNT(lv.id) as view_count
        FROM listings l
        LEFT JOIN listing_views lv ON l.id = lv.listing_id
          AND lv.timestamp >= CURRENT_DATE - INTERVAL '7 days'
        WHERE l.is_active = true
          AND l.seller_id != $1
          AND l.id NOT IN (SELECT listing_id FROM favorites WHERE user_id = $1)
          ${recommendations.length > 0 ? 'AND l.id NOT IN (' + recommendations.map(r => `'${r.listing_id}'`).join(',') + ')' : ''}
        GROUP BY l.id, l.title, l.price, l.image_url
        ORDER BY view_count DESC, l.created_at DESC
        LIMIT $2
      `;
      const trendingResult = await pool.query(trendingQuery, [req.userId, limit - recommendations.length]);

      const trendingRecs = trendingResult.rows.map((row) => ({
        listing_id: row.listing_id,
        title: row.title,
        price: parseFloat(row.price),
        image_url: row.image_url || '',
        recommendation_score: parseFloat(row.view_count) || 0.5,
        reason: 'Trending now',
      }));

      recommendations = [...recommendations, ...trendingRecs];
    }

    res.json({
      success: true,
      recommendations,
    });
  } catch (error) {
    console.error('GetRecommendations error:', error);
    res.status(500).json({ error: 'Failed to retrieve recommendations' });
  }
});

router.get('/user-stats', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const listingsCreatedResult = await pool.query(
      'SELECT COUNT(*) as count FROM listings WHERE seller_id = $1',
      [req.userId]
    );
    const listings_created = parseInt(listingsCreatedResult.rows[0].count);

    const activeListingsResult = await pool.query(
      "SELECT COUNT(*) as count FROM listings WHERE seller_id = $1 AND is_active = true",
      [req.userId]
    );
    const active_listings = parseInt(activeListingsResult.rows[0].count);

    const viewsResult = await pool.query(
      `SELECT COUNT(*) as count FROM listing_views lv
       JOIN listings l ON lv.listing_id = l.id
       WHERE l.seller_id = $1`,
      [req.userId]
    );
    const total_views_received = parseInt(viewsResult.rows[0].count);

    const contactsResult = await pool.query(
      `SELECT COUNT(*) as count FROM contact_attempts
       WHERE seller_id = $1`,
      [req.userId]
    );
    const contacts_received = parseInt(contactsResult.rows[0].count);

    const favoritesResult = await pool.query(
      'SELECT COUNT(*) as count FROM favorites WHERE user_id = $1',
      [req.userId]
    );
    const favorites_count = parseInt(favoritesResult.rows[0].count);

    const categoriesResult = await pool.query(
      `SELECT c.name, COUNT(*) as count
       FROM listing_views lv
       JOIN listings l ON lv.listing_id = l.id
       JOIN categories c ON l.category_id = c.id
       WHERE lv.user_id = $1
       GROUP BY c.name
       ORDER BY count DESC
       LIMIT 5`,
      [req.userId]
    );
    const most_viewed_categories = categoriesResult.rows.map((row) => row.name);

    res.json({
      success: true,
      analytics: {
        listings_created,
        active_listings,
        total_views_received,
        contacts_received,
        favorites_count,
        most_viewed_categories,
      },
    });
  } catch (error) {
    console.error('GetUserAnalytics error:', error);
    res.status(500).json({ error: 'Failed to retrieve user analytics' });
  }
});

export default router;
