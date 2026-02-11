import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;

  try {
    const result = await pool.query(
      'SELECT * FROM listings WHERE is_active = true ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM listings WHERE is_active = true'
    );

    const listings = result.rows.map((listing) => ({
      id: listing.id,
      title: listing.title,
      description: listing.description,
      price: parseFloat(listing.price),
      category_id: listing.category_id,
      condition_id: listing.condition_id,
      seller_id: listing.seller_id,
      seller_email: listing.seller_email,
      seller_whatsapp: listing.seller_whatsapp,
      image_url: listing.image_url,
      meet_spot_id: listing.meet_spot_id,
      created_at: new Date(listing.created_at).getTime(),
      updated_at: new Date(listing.updated_at).getTime(),
      is_active: listing.is_active,
    }));

    res.json({
      success: true,
      listings,
      total_count: parseInt(countResult.rows[0].count),
    });
  } catch (error) {
    console.error('GetAllListings error:', error);
    res.status(500).json({ error: 'Failed to retrieve listings' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM listings WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    const listing = result.rows[0];

    res.json({
      success: true,
      message: 'Listing retrieved successfully',
      listing: {
        id: listing.id,
        title: listing.title,
        description: listing.description,
        price: parseFloat(listing.price),
        category_id: listing.category_id,
        condition_id: listing.condition_id,
        seller_id: listing.seller_id,
        seller_email: listing.seller_email,
        seller_whatsapp: listing.seller_whatsapp,
        image_url: listing.image_url,
        meet_spot_id: listing.meet_spot_id,
        created_at: new Date(listing.created_at).getTime(),
        updated_at: new Date(listing.updated_at).getTime(),
        is_active: listing.is_active,
      },
    });
  } catch (error) {
    console.error('GetListing error:', error);
    res.status(500).json({ error: 'Failed to retrieve listing' });
  }
});

router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  const {
    title,
    description,
    price,
    category_id,
    condition_id,
    seller_email,
    seller_whatsapp,
    image_url,
    meet_spot_id,
  } = req.body;

  try {
    const listing_id = uuidv4();

    const result = await pool.query(
      `INSERT INTO listings
      (id, title, description, price, category_id, condition_id, seller_id,
       seller_email, seller_whatsapp, image_url, meet_spot_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        listing_id,
        title,
        description,
        price,
        category_id,
        condition_id,
        req.userId,
        seller_email,
        seller_whatsapp,
        image_url,
        meet_spot_id,
      ]
    );

    const listing = result.rows[0];

    res.json({
      success: true,
      message: 'Listing created successfully',
      listing: {
        id: listing.id,
        title: listing.title,
        description: listing.description,
        price: parseFloat(listing.price),
        category_id: listing.category_id,
        condition_id: listing.condition_id,
        seller_id: listing.seller_id,
        seller_email: listing.seller_email,
        seller_whatsapp: listing.seller_whatsapp,
        image_url: listing.image_url,
        meet_spot_id: listing.meet_spot_id,
        created_at: new Date(listing.created_at).getTime(),
        updated_at: new Date(listing.updated_at).getTime(),
        is_active: listing.is_active,
      },
    });
  } catch (error) {
    console.error('CreateListing error:', error);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const ownerCheck = await pool.query(
      'SELECT seller_id FROM listings WHERE id = $1',
      [id]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    if (ownerCheck.rows[0].seller_id !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only update your own listings',
      });
    }

    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        updateFields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
      });
    }

    values.push(id);
    const query = `UPDATE listings SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
                   WHERE id = $${paramCount} RETURNING *`;

    const result = await pool.query(query, values);
    const listing = result.rows[0];

    res.json({
      success: true,
      message: 'Listing updated successfully',
      listing: {
        id: listing.id,
        title: listing.title,
        description: listing.description,
        price: parseFloat(listing.price),
        category_id: listing.category_id,
        condition_id: listing.condition_id,
        seller_id: listing.seller_id,
        seller_email: listing.seller_email,
        seller_whatsapp: listing.seller_whatsapp,
        image_url: listing.image_url,
        meet_spot_id: listing.meet_spot_id,
        created_at: new Date(listing.created_at).getTime(),
        updated_at: new Date(listing.updated_at).getTime(),
        is_active: listing.is_active,
      },
    });
  } catch (error) {
    console.error('UpdateListing error:', error);
    res.status(500).json({ error: 'Failed to update listing' });
  }
});

router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  const { id } = req.params;

  try {
    const ownerCheck = await pool.query(
      'SELECT seller_id FROM listings WHERE id = $1',
      [id]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    if (ownerCheck.rows[0].seller_id !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only delete your own listings',
      });
    }

    await pool.query('DELETE FROM listings WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Listing deleted successfully',
    });
  } catch (error) {
    console.error('DeleteListing error:', error);
    res.status(500).json({ error: 'Failed to delete listing' });
  }
});

router.get('/user/my-listings', authenticateToken, async (req: AuthRequest, res) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;

  try {
    const result = await pool.query(
      'SELECT * FROM listings WHERE seller_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [req.userId, limit, offset]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM listings WHERE seller_id = $1',
      [req.userId]
    );

    const listings = result.rows.map((listing) => ({
      id: listing.id,
      title: listing.title,
      description: listing.description,
      price: parseFloat(listing.price),
      category_id: listing.category_id,
      condition_id: listing.condition_id,
      seller_id: listing.seller_id,
      seller_email: listing.seller_email,
      seller_whatsapp: listing.seller_whatsapp,
      image_url: listing.image_url,
      meet_spot_id: listing.meet_spot_id,
      created_at: new Date(listing.created_at).getTime(),
      updated_at: new Date(listing.updated_at).getTime(),
      is_active: listing.is_active,
    }));

    res.json({
      success: true,
      listings,
      total_count: parseInt(countResult.rows[0].count),
    });
  } catch (error) {
    console.error('GetUserListings error:', error);
    res.status(500).json({ error: 'Failed to retrieve user listings' });
  }
});

export default router;
