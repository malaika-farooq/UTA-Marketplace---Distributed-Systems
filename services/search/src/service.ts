import * as grpc from '@grpc/grpc-js';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://uta:uta@postgres:5432/uta_marketplace',
});

export const SearchServiceHandlers = {
  async SearchListings(call: any, callback: any) {
    const { query, category_id, condition_id, min_price, max_price, meet_spot_id, sort_by, limit, offset } = call.request;

    try {
      let whereConditions = ["status = 'active'"];
      let params: any[] = [];
      let paramCount = 1;

      // Build WHERE clause dynamically
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

      if (min_price !== undefined && min_price !== null) {
        whereConditions.push(`price >= $${paramCount}`);
        params.push(min_price);
        paramCount++;
      }

      if (max_price !== undefined && max_price !== null) {
        whereConditions.push(`price <= $${paramCount}`);
        params.push(max_price);
        paramCount++;
      }

      if (meet_spot_id) {
        whereConditions.push(`meet_spot_id = $${paramCount}`);
        params.push(meet_spot_id);
        paramCount++;
      }

      const whereClause = whereConditions.join(' AND ');

      // Determine ORDER BY clause
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

      // Get total count
      const countQuery = `SELECT COUNT(*) FROM listings WHERE ${whereClause}`;
      const countResult = await pool.query(countQuery, params);
      const total_count = parseInt(countResult.rows[0].count);

      // Get listings
      const searchQuery = `
        SELECT id, title, description, price, category_id, condition_id,
               seller_id, image_url, meet_spot_id,
               EXTRACT(EPOCH FROM created_at)::bigint as created_at
        FROM listings
        WHERE ${whereClause}
        ORDER BY ${orderBy}
        LIMIT $${paramCount} OFFSET $${paramCount + 1}
      `;
      params.push(limit || 20, offset || 0);

      const result = await pool.query(searchQuery, params);

      const results = result.rows.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        price: row.price,
        category_id: row.category_id,
        condition_id: row.condition_id,
        seller_id: row.seller_id,
        image_url: row.image_url || '',
        meet_spot_id: row.meet_spot_id || '',
        created_at: row.created_at,
        relevance_score: query ? 1.0 : 0.0, // Simple relevance score
      }));

      callback(null, {
        success: true,
        results,
        total_count,
        message: 'Search completed successfully',
      });
    } catch (error) {
      console.error('SearchListings error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Internal server error',
      });
    }
  },

  async GetCategories(call: any, callback: any) {
    try {
      const result = await pool.query(
        'SELECT id, name, description FROM categories ORDER BY name'
      );

      const categories = result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description || '',
      }));

      callback(null, {
        success: true,
        categories,
      });
    } catch (error) {
      console.error('GetCategories error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Internal server error',
      });
    }
  },

  async GetConditions(call: any, callback: any) {
    try {
      const result = await pool.query(
        'SELECT id, name, description FROM conditions ORDER BY name'
      );

      const conditions = result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description || '',
      }));

      callback(null, {
        success: true,
        conditions,
      });
    } catch (error) {
      console.error('GetConditions error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Internal server error',
      });
    }
  },

  async GetMeetSpots(call: any, callback: any) {
    try {
      const result = await pool.query(
        'SELECT id, name, description FROM meet_spots ORDER BY name'
      );

      const meet_spots = result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description || '',
      }));

      callback(null, {
        success: true,
        meet_spots,
      });
    } catch (error) {
      console.error('GetMeetSpots error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Internal server error',
      });
    }
  },
};
