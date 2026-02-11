import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/profile', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, full_name, phone, whatsapp, avatar_url,
              EXTRACT(EPOCH FROM created_at)::bigint as created_at,
              EXTRACT(EPOCH FROM updated_at)::bigint as updated_at
       FROM users
       WHERE id = $1`,
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const user = result.rows[0];

    res.json({
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
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

router.put('/profile', authenticateToken, async (req: AuthRequest, res) => {
  const { full_name, phone, whatsapp, avatar_url } = req.body;

  try {
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
      const result = await pool.query(
        `SELECT id, email, full_name, phone, whatsapp, avatar_url,
                EXTRACT(EPOCH FROM created_at)::bigint as created_at,
                EXTRACT(EPOCH FROM updated_at)::bigint as updated_at
         FROM users WHERE id = $1`,
        [req.userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      const user = result.rows[0];
      return res.json({
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
    params.push(req.userId);

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
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const user = result.rows[0];

    res.json({
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
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.post('/favorites', authenticateToken, async (req: AuthRequest, res) => {
  const { listing_id } = req.body;

  try {
    const existing = await pool.query(
      'SELECT id FROM favorites WHERE user_id = $1 AND listing_id = $2',
      [req.userId, listing_id]
    );

    if (existing.rows.length > 0) {
      return res.json({
        success: true,
        message: 'Already in favorites',
      });
    }

    await pool.query(
      'INSERT INTO favorites (user_id, listing_id) VALUES ($1, $2)',
      [req.userId, listing_id]
    );

    res.json({
      success: true,
      message: 'Added to favorites',
    });
  } catch (error) {
    console.error('AddFavorite error:', error);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

router.delete('/favorites/:listing_id', authenticateToken, async (req: AuthRequest, res) => {
  const { listing_id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND listing_id = $2',
      [req.userId, listing_id]
    );

    res.json({
      success: true,
      message: result.rowCount > 0 ? 'Removed from favorites' : 'Not in favorites',
    });
  } catch (error) {
    console.error('RemoveFavorite error:', error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

router.get('/favorites', authenticateToken, async (req: AuthRequest, res) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;

  try {
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM favorites WHERE user_id = $1',
      [req.userId]
    );
    const total_count = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT f.listing_id, l.title, l.price, l.image_url,
              EXTRACT(EPOCH FROM f.favorited_at)::bigint as favorited_at
       FROM favorites f
       JOIN listings l ON f.listing_id = l.id
       WHERE f.user_id = $1
       ORDER BY f.favorited_at DESC
       LIMIT $2 OFFSET $3`,
      [req.userId, limit, offset]
    );

    const favorites = result.rows.map((row) => ({
      listing_id: row.listing_id,
      title: row.title,
      price: parseFloat(row.price),
      image_url: row.image_url || '',
      favorited_at: row.favorited_at,
    }));

    res.json({
      success: true,
      favorites,
      total_count,
    });
  } catch (error) {
    console.error('GetFavorites error:', error);
    res.status(500).json({ error: 'Failed to retrieve favorites' });
  }
});

router.get('/favorites/:listing_id/check', authenticateToken, async (req: AuthRequest, res) => {
  const { listing_id } = req.params;

  try {
    const result = await pool.query(
      'SELECT id FROM favorites WHERE user_id = $1 AND listing_id = $2',
      [req.userId, listing_id]
    );

    res.json({
      is_favorite: result.rows.length > 0,
    });
  } catch (error) {
    console.error('IsFavorite error:', error);
    res.status(500).json({ error: 'Failed to check favorite status' });
  }
});

export default router;
