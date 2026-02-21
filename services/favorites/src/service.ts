import * as grpc from '@grpc/grpc-js';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://uta:uta@postgres:5432/uta_marketplace',
});

export const FavoritesServiceHandlers = {
  async AddFavorite(call: any, callback: any) {
    const { user_id, listing_id } = call.request;

    try {
      // Check if already favorited
      const existing = await pool.query(
        'SELECT 1 FROM favorites WHERE user_id = $1 AND listing_id = $2',
        [user_id, listing_id]
      );

      if (existing.rows.length > 0) {
        return callback(null, {
          success: true,
          message: 'Already in favorites',
        });
      }

      // Add to favorites
      await pool.query(
        'INSERT INTO favorites (user_id, listing_id) VALUES ($1, $2)',
        [user_id, listing_id]
      );

      callback(null, {
        success: true,
        message: 'Added to favorites',
      });
    } catch (error) {
      console.error('AddFavorite error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Internal server error',
      });
    }
  },

  async RemoveFavorite(call: any, callback: any) {
    const { user_id, listing_id } = call.request;

    try {
      const result = await pool.query(
        'DELETE FROM favorites WHERE user_id = $1 AND listing_id = $2',
        [user_id, listing_id]
      );

      callback(null, {
        success: true,
        message: (result.rowCount ?? 0) > 0 ? 'Removed from favorites' : 'Not in favorites',
      });
    } catch (error) {
      console.error('RemoveFavorite error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Internal server error',
      });
    }
  },

  async GetFavorites(call: any, callback: any) {
    const { user_id, limit, offset } = call.request;

    try {
      // Get total count
      const countResult = await pool.query(
        'SELECT COUNT(*) FROM favorites WHERE user_id = $1',
        [user_id]
      );
      const total_count = parseInt(countResult.rows[0].count);

      // Get favorites with listing details
      const result = await pool.query(
        `SELECT f.listing_id, l.title, l.price, l.image_url,
                EXTRACT(EPOCH FROM f.favorited_at)::bigint as favorited_at
         FROM favorites f
         JOIN listings l ON f.listing_id = l.id
         WHERE f.user_id = $1
         ORDER BY f.favorited_at DESC
         LIMIT $2 OFFSET $3`,
        [user_id, limit || 20, offset || 0]
      );

      const favorites = result.rows.map((row) => ({
        listing_id: row.listing_id,
        title: row.title,
        price: row.price,
        image_url: row.image_url || '',
        favorited_at: row.favorited_at,
      }));

      callback(null, {
        success: true,
        favorites,
        total_count,
      });
    } catch (error) {
      console.error('GetFavorites error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Internal server error',
      });
    }
  },

  async IsFavorite(call: any, callback: any) {
    const { user_id, listing_id } = call.request;

    try {
      const result = await pool.query(
        'SELECT 1 FROM favorites WHERE user_id = $1 AND listing_id = $2',
        [user_id, listing_id]
      );

      callback(null, {
        is_favorite: result.rows.length > 0,
      });
    } catch (error) {
      console.error('IsFavorite error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Internal server error',
      });
    }
  },
};
