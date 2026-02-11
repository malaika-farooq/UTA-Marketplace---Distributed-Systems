import * as grpc from '@grpc/grpc-js';
import { v4 as uuidv4 } from 'uuid';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://uta:uta@postgres:5432/uta_marketplace',
});

export const AnalyticsServiceHandlers = {
  async TrackView(call: any, callback: any) {
    const { listing_id, user_id, timestamp, referrer } = call.request;

    try {
      await pool.query(
        `INSERT INTO listing_views (id, listing_id, user_id, referrer, timestamp)
         VALUES ($1, $2, $3, $4, to_timestamp($5))`,
        [
          uuidv4(),
          listing_id,
          user_id || null,
          referrer || null,
          timestamp || Math.floor(Date.now() / 1000),
        ]
      );

      callback(null, {
        success: true,
        message: 'View tracked successfully',
      });
    } catch (error) {
      console.error('TrackView error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Internal server error',
      });
    }
  },

  async GetListingViews(call: any, callback: any) {
    const { listing_id } = call.request;

    try {
      // Total views
      const totalResult = await pool.query(
        'SELECT COUNT(*) as count FROM listing_views WHERE listing_id = $1',
        [listing_id]
      );
      const total_views = parseInt(totalResult.rows[0].count);

      // Unique views (by user_id, excluding anonymous)
      const uniqueResult = await pool.query(
        'SELECT COUNT(DISTINCT user_id) as count FROM listing_views WHERE listing_id = $1 AND user_id IS NOT NULL',
        [listing_id]
      );
      const unique_views = parseInt(uniqueResult.rows[0].count);

      // Views today
      const todayResult = await pool.query(
        `SELECT COUNT(*) as count FROM listing_views
         WHERE listing_id = $1 AND timestamp >= CURRENT_DATE`,
        [listing_id]
      );
      const views_today = parseInt(todayResult.rows[0].count);

      // Views this week
      const weekResult = await pool.query(
        `SELECT COUNT(*) as count FROM listing_views
         WHERE listing_id = $1 AND timestamp >= CURRENT_DATE - INTERVAL '7 days'`,
        [listing_id]
      );
      const views_week = parseInt(weekResult.rows[0].count);

      callback(null, {
        success: true,
        total_views,
        unique_views,
        views_today,
        views_week,
      });
    } catch (error) {
      console.error('GetListingViews error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Internal server error',
      });
    }
  },

  async GetTrendingListings(call: any, callback: any) {
    const { limit, time_window } = call.request;

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

      const result = await pool.query(query, [limit || 10]);

      const listings = result.rows.map((row) => ({
        listing_id: row.listing_id,
        title: row.title,
        price: row.price,
        image_url: row.image_url || '',
        view_count: parseInt(row.view_count),
        contact_count: parseInt(row.contact_count),
        trend_score: parseFloat(row.trend_score),
      }));

      callback(null, {
        success: true,
        listings,
      });
    } catch (error) {
      console.error('GetTrendingListings error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Internal server error',
      });
    }
  },

  async GetRecommendations(call: any, callback: any) {
    const { user_id, limit } = call.request;

    try {
      // Get user's favorite categories
      const categoryQuery = `
        SELECT l.category_id, COUNT(*) as count
        FROM favorites f
        JOIN listings l ON f.listing_id = l.id
        WHERE f.user_id = $1
        GROUP BY l.category_id
        ORDER BY count DESC
        LIMIT 3
      `;
      const categoryResult = await pool.query(categoryQuery, [user_id]);
      const favCategories = categoryResult.rows.map((row) => row.category_id);

      let recommendations: any[] = [];

      if (favCategories.length > 0) {
        // Recommend listings from favorite categories
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
          ORDER BY popularity_score DESC, l.timestamp DESC
          LIMIT $3
        `;
        const result = await pool.query(recommendQuery, [favCategories, user_id, limit || 10]);

        recommendations = result.rows.map((row) => ({
          listing_id: row.listing_id,
          title: row.title,
          price: row.price,
          image_url: row.image_url || '',
          recommendation_score: parseFloat(row.popularity_score) || 1.0,
          reason: 'Based on your favorites',
        }));
      }

      // If not enough recommendations, add trending listings
      if (recommendations.length < (limit || 10)) {
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
          ORDER BY view_count DESC, l.timestamp DESC
          LIMIT $2
        `;
        const trendingResult = await pool.query(trendingQuery, [user_id, (limit || 10) - recommendations.length]);

        const trendingRecs = trendingResult.rows.map((row) => ({
          listing_id: row.listing_id,
          title: row.title,
          price: row.price,
          image_url: row.image_url || '',
          recommendation_score: parseFloat(row.view_count) || 0.5,
          reason: 'Trending now',
        }));

        recommendations = [...recommendations, ...trendingRecs];
      }

      callback(null, {
        success: true,
        recommendations,
      });
    } catch (error) {
      console.error('GetRecommendations error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Internal server error',
      });
    }
  },

  async GetUserAnalytics(call: any, callback: any) {
    const { user_id } = call.request;

    try {
      // Total listings created
      const listingsCreatedResult = await pool.query(
        'SELECT COUNT(*) as count FROM listings WHERE seller_id = $1',
        [user_id]
      );
      const listings_created = parseInt(listingsCreatedResult.rows[0].count);

      // Active listings
      const activeListingsResult = await pool.query(
        "SELECT COUNT(*) as count FROM listings WHERE seller_id = $1 AND is_active = true",
        [user_id]
      );
      const active_listings = parseInt(activeListingsResult.rows[0].count);

      // Total views received on user's listings
      const viewsResult = await pool.query(
        `SELECT COUNT(*) as count FROM listing_views lv
         JOIN listings l ON lv.listing_id = l.id
         WHERE l.seller_id = $1`,
        [user_id]
      );
      const total_views_received = parseInt(viewsResult.rows[0].count);

      // Contacts received
      const contactsResult = await pool.query(
        `SELECT COUNT(*) as count FROM contact_attempts
         WHERE seller_id = $1`,
        [user_id]
      );
      const contacts_received = parseInt(contactsResult.rows[0].count);

      // Favorites count
      const favoritesResult = await pool.query(
        'SELECT COUNT(*) as count FROM favorites WHERE user_id = $1',
        [user_id]
      );
      const favorites_count = parseInt(favoritesResult.rows[0].count);

      // Most viewed categories (based on user's viewing history)
      const categoriesResult = await pool.query(
        `SELECT c.name, COUNT(*) as count
         FROM listing_views lv
         JOIN listings l ON lv.listing_id = l.id
         JOIN categories c ON l.category_id = c.id
         WHERE lv.user_id = $1
         GROUP BY c.name
         ORDER BY count DESC
         LIMIT 5`,
        [user_id]
      );
      const most_viewed_categories = categoriesResult.rows.map((row) => row.name);

      callback(null, {
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
      callback({
        code: grpc.status.INTERNAL,
        message: 'Internal server error',
      });
    }
  },
};
