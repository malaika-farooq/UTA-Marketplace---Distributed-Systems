import * as grpc from '@grpc/grpc-js';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://uta:uta@postgres:5432/uta_marketplace',
});

export const UserServiceHandlers = {
  async GetUserProfile(call: any, callback: any) {
    const { user_id } = call.request;

    try {
      const result = await pool.query(
        `SELECT id, email, full_name, phone, whatsapp, avatar_url,
                EXTRACT(EPOCH FROM created_at)::bigint as created_at,
                EXTRACT(EPOCH FROM updated_at)::bigint as updated_at
         FROM users
         WHERE id = $1`,
        [user_id]
      );

      if (result.rows.length === 0) {
        return callback(null, {
          success: false,
          message: 'User not found',
          profile: null,
        });
      }

      const user = result.rows[0];

      callback(null, {
        success: true,
        message: 'User profile retrieved successfully',
        profile: {
          user_id: user.id,
          email: user.email,
          full_name: user.full_name || '',
          phone: user.phone || '',
          whatsapp: user.whatsapp || '',
          avatar_url: user.avatar_url || '',
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
      });
    } catch (error) {
      console.error('GetUserProfile error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Internal server error',
      });
    }
  },

  async UpdateUserProfile(call: any, callback: any) {
    const { user_id, full_name, phone, whatsapp, avatar_url } = call.request;

    try {
      // Build dynamic update query
      let updateFields: string[] = [];
      let params: any[] = [];
      let paramCount = 1;

      if (full_name !== undefined && full_name !== null) {
        updateFields.push(`full_name = $${paramCount}`);
        params.push(full_name);
        paramCount++;
      }

      if (phone !== undefined && phone !== null) {
        updateFields.push(`phone = $${paramCount}`);
        params.push(phone);
        paramCount++;
      }

      if (whatsapp !== undefined && whatsapp !== null) {
        updateFields.push(`whatsapp = $${paramCount}`);
        params.push(whatsapp);
        paramCount++;
      }

      if (avatar_url !== undefined && avatar_url !== null) {
        updateFields.push(`avatar_url = $${paramCount}`);
        params.push(avatar_url);
        paramCount++;
      }

      if (updateFields.length === 0) {
        // No fields to update, just return current profile
        const result = await pool.query(
          `SELECT id, email, full_name, phone, whatsapp, avatar_url,
                  EXTRACT(EPOCH FROM created_at)::bigint as created_at,
                  EXTRACT(EPOCH FROM updated_at)::bigint as updated_at
           FROM users WHERE id = $1`,
          [user_id]
        );

        if (result.rows.length === 0) {
          return callback(null, {
            success: false,
            message: 'User not found',
            profile: null,
          });
        }

        const user = result.rows[0];
        return callback(null, {
          success: true,
          message: 'No updates provided',
          profile: {
            user_id: user.id,
            email: user.email,
            full_name: user.full_name || '',
            phone: user.phone || '',
            whatsapp: user.whatsapp || '',
            avatar_url: user.avatar_url || '',
            created_at: user.created_at,
            updated_at: user.updated_at,
          },
        });
      }

      updateFields.push(`updated_at = NOW()`);
      params.push(user_id);

      const updateQuery = `
        UPDATE users
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING id, email, full_name, phone, whatsapp, avatar_url,
                  EXTRACT(EPOCH FROM created_at)::bigint as created_at,
                  EXTRACT(EPOCH FROM updated_at)::bigint as updated_at
      `;

      const result = await pool.query(updateQuery, params);

      if (result.rows.length === 0) {
        return callback(null, {
          success: false,
          message: 'User not found',
          profile: null,
        });
      }

      const user = result.rows[0];

      callback(null, {
        success: true,
        message: 'Profile updated successfully',
        profile: {
          user_id: user.id,
          email: user.email,
          full_name: user.full_name || '',
          phone: user.phone || '',
          whatsapp: user.whatsapp || '',
          avatar_url: user.avatar_url || '',
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
      });
    } catch (error) {
      console.error('UpdateUserProfile error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Internal server error',
      });
    }
  },

  async AddFavorite(call: any, callback: any) {
    const { user_id, listing_id } = call.request;

    try {
      // Check if already favorited
      const existing = await pool.query(
        'SELECT id FROM favorites WHERE user_id = $1 AND listing_id = $2',
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
        'SELECT id FROM favorites WHERE user_id = $1 AND listing_id = $2',
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
