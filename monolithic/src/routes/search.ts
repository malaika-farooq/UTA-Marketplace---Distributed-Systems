import { Router } from 'express';
import pool from '../db.js';

const router = Router();

router.get('/listings', async (req, res) => {
  const {
    query,
    category_id,
    condition_id,
    min_price,
    max_price,
    meet_spot_id,
    sort_by,
  } = req.query;

  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;

  try {
    let whereConditions = ['is_active = true'];
    let params: any[] = [];
    let paramCount = 1;

    if (query) {
      whereConditions.push(`(title ILIKE $${paramCount} OR description ILIKE $${paramCount})`);
      params.push(`%${query}%`);
      paramCount++;
    }

    if (category_id) {
      whereConditions.push(`category_id = $${paramCount}`);
      params.push(category_id);
      paramCount++;
    }

    if (condition_id) {
      whereConditions.push(`condition_id = $${paramCount}`);
      params.push(condition_id);
      paramCount++;
    }

    if (min_price) {
      whereConditions.push(`price >= $${paramCount}`);
      params.push(parseFloat(min_price as string));
      paramCount++;
    }

    if (max_price) {
      whereConditions.push(`price <= $${paramCount}`);
      params.push(parseFloat(max_price as string));
      paramCount++;
    }

    if (meet_spot_id) {
      whereConditions.push(`meet_spot_id = $${paramCount}`);
      params.push(meet_spot_id);
      paramCount++;
    }

    const whereClause = whereConditions.join(' AND ');

    let orderBy = 'created_at DESC';
    switch (sort_by) {
      case 'price_asc':
        orderBy = 'price ASC';
        break;
      case 'price_desc':
        orderBy = 'price DESC';
        break;
      case 'date_asc':
        orderBy = 'created_at ASC';
        break;
      case 'date_desc':
        orderBy = 'created_at DESC';
        break;
    }

    const countQuery = `SELECT COUNT(*) FROM listings WHERE ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const total_count = parseInt(countResult.rows[0].count);

    const searchQuery = `
      SELECT * FROM listings
      WHERE ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    params.push(limit, offset);

    const result = await pool.query(searchQuery, params);

    const results = result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      price: parseFloat(row.price),
      category_id: row.category_id,
      condition_id: row.condition_id,
      seller_id: row.seller_id,
      image_url: row.image_url || '',
      meet_spot_id: row.meet_spot_id || '',
      created_at: new Date(row.created_at).getTime(),
      relevance_score: query ? 1.0 : 0.0,
    }));

    res.json({
      success: true,
      results,
      total_count,
      message: 'Search completed successfully',
    });
  } catch (error) {
    console.error('SearchListings error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, description FROM categories ORDER BY name'
    );

    const categories = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description || '',
    }));

    res.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error('GetCategories error:', error);
    res.status(500).json({ error: 'Failed to retrieve categories' });
  }
});

router.get('/conditions', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, description FROM conditions ORDER BY name'
    );

    const conditions = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description || '',
    }));

    res.json({
      success: true,
      conditions,
    });
  } catch (error) {
    console.error('GetConditions error:', error);
    res.status(500).json({ error: 'Failed to retrieve conditions' });
  }
});

router.get('/meet-spots', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, description FROM meet_spots ORDER BY name'
    );

    const meet_spots = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description || '',
    }));

    res.json({
      success: true,
      meet_spots,
    });
  } catch (error) {
    console.error('GetMeetSpots error:', error);
    res.status(500).json({ error: 'Failed to retrieve meet spots' });
  }
});

export default router;
