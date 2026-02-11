import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.post('/contact', authenticateToken, async (req: AuthRequest, res) => {
  const { listing_id, seller_id, contact_method } = req.body;

  try {
    const sellerResult = await pool.query(
      'SELECT email, whatsapp FROM users WHERE id = $1',
      [seller_id]
    );

    if (sellerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found',
      });
    }

    const seller = sellerResult.rows[0];
    let contact_url = '';
    let contact_info = '';

    if (contact_method === 'whatsapp') {
      if (!seller.whatsapp) {
        return res.status(400).json({
          success: false,
          message: 'WhatsApp not available for this seller',
        });
      }
      const phoneNumber = seller.whatsapp.replace(/\D/g, '');
      contact_url = `https://wa.me/${phoneNumber}`;
      contact_info = seller.whatsapp;
    } else if (contact_method === 'email') {
      if (!seller.email) {
        return res.status(400).json({
          success: false,
          message: 'Email not available for this seller',
        });
      }
      contact_url = `mailto:${seller.email}`;
      contact_info = seller.email;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid contact method',
      });
    }

    await pool.query(
      `INSERT INTO contact_attempts (id, user_id, listing_id, seller_id, contact_method)
       VALUES ($1, $2, $3, $4, $5)`,
      [uuidv4(), req.userId, listing_id, seller_id, contact_method]
    );

    res.json({
      success: true,
      message: 'Contact information retrieved successfully',
      contact_url,
      contact_info,
    });
  } catch (error) {
    console.error('InitiateContact error:', error);
    res.status(500).json({ error: 'Failed to initiate contact' });
  }
});

router.get('/contact/:seller_id', async (req, res) => {
  const { seller_id } = req.params;
  const { listing_id } = req.query;

  try {
    const result = await pool.query(
      'SELECT email, whatsapp FROM users WHERE id = $1',
      [seller_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found',
      });
    }

    const seller = result.rows[0];

    res.json({
      success: true,
      message: 'Contact information retrieved',
      contact_info: {
        seller_id,
        email: seller.email || '',
        whatsapp: seller.whatsapp || '',
        email_available: !!seller.email,
        whatsapp_available: !!seller.whatsapp,
      },
    });
  } catch (error) {
    console.error('GetContactInfo error:', error);
    res.status(500).json({ error: 'Failed to retrieve contact info' });
  }
});

router.get('/history', authenticateToken, async (req: AuthRequest, res) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;

  try {
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM contact_attempts WHERE user_id = $1',
      [req.userId]
    );
    const total_count = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT ca.listing_id, l.title as listing_title, ca.seller_id,
              ca.contact_method,
              EXTRACT(EPOCH FROM ca.timestamp)::bigint as timestamp
       FROM contact_attempts ca
       LEFT JOIN listings l ON ca.listing_id = l.id
       WHERE ca.user_id = $1
       ORDER BY ca.timestamp DESC
       LIMIT $2 OFFSET $3`,
      [req.userId, limit, offset]
    );

    const attempts = result.rows.map((row) => ({
      listing_id: row.listing_id,
      listing_title: row.listing_title || 'Unknown',
      seller_id: row.seller_id,
      contact_method: row.contact_method,
      timestamp: row.timestamp,
    }));

    res.json({
      success: true,
      attempts,
      total_count,
    });
  } catch (error) {
    console.error('GetContactHistory error:', error);
    res.status(500).json({ error: 'Failed to retrieve contact history' });
  }
});

export default router;
