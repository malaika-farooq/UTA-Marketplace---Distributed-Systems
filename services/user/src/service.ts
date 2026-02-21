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

};
