import * as grpc from '@grpc/grpc-js';
import { v4 as uuidv4 } from 'uuid';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://uta:uta@postgres:5432/uta_marketplace',
});

export const ListingServiceHandlers = {
  async CreateListing(call: any, callback: any) {
    const {
      user_id,
      title,
      description,
      price,
      category_id,
      condition_id,
      seller_email,
      seller_whatsapp,
      image_url,
      meet_spot_id,
    } = call.request;

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
          user_id,
          seller_email,
          seller_whatsapp,
          image_url,
          meet_spot_id,
        ]
      );

      const listing = result.rows[0];

      callback(null, {
        success: true,
        message: 'Listing created successfully',
        listing: {
          id: listing.id,
          title: listing.title,
          description: listing.description,
          price: listing.price,
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
      callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to create listing',
      });
    }
  },

  async GetListing(call: any, callback: any) {
    const { listing_id } = call.request;

    try {
      const result = await pool.query(
        'SELECT * FROM listings WHERE id = $1',
        [listing_id]
      );

      if (result.rows.length === 0) {
        return callback(null, {
          success: false,
          message: 'Listing not found',
          listing: null,
        });
      }

      const listing = result.rows[0];

      callback(null, {
        success: true,
        message: 'Listing retrieved successfully',
        listing: {
          id: listing.id,
          title: listing.title,
          description: listing.description,
          price: listing.price,
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
      callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to retrieve listing',
      });
    }
  },

  async UpdateListing(call: any, callback: any) {
    const { listing_id, user_id, ...updates } = call.request;

    try {
      // Verify ownership
      const ownerCheck = await pool.query(
        'SELECT seller_id FROM listings WHERE id = $1',
        [listing_id]
      );

      if (ownerCheck.rows.length === 0) {
        return callback(null, {
          success: false,
          message: 'Listing not found',
          listing: null,
        });
      }

      if (ownerCheck.rows[0].seller_id !== user_id) {
        return callback(null, {
          success: false,
          message: 'Unauthorized: You can only update your own listings',
          listing: null,
        });
      }

      // Build update query dynamically
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
        return callback(null, {
          success: false,
          message: 'No fields to update',
          listing: null,
        });
      }

      values.push(listing_id);
      const query = `UPDATE listings SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
                     WHERE id = $${paramCount} RETURNING *`;

      const result = await pool.query(query, values);
      const listing = result.rows[0];

      callback(null, {
        success: true,
        message: 'Listing updated successfully',
        listing: {
          id: listing.id,
          title: listing.title,
          description: listing.description,
          price: listing.price,
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
      callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to update listing',
      });
    }
  },

  async DeleteListing(call: any, callback: any) {
    const { listing_id, user_id } = call.request;

    try {
      // Verify ownership
      const ownerCheck = await pool.query(
        'SELECT seller_id FROM listings WHERE id = $1',
        [listing_id]
      );

      if (ownerCheck.rows.length === 0) {
        return callback(null, {
          success: false,
          message: 'Listing not found',
        });
      }

      if (ownerCheck.rows[0].seller_id !== user_id) {
        return callback(null, {
          success: false,
          message: 'Unauthorized: You can only delete your own listings',
        });
      }

      await pool.query('DELETE FROM listings WHERE id = $1', [listing_id]);

      callback(null, {
        success: true,
        message: 'Listing deleted successfully',
      });
    } catch (error) {
      console.error('DeleteListing error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to delete listing',
      });
    }
  },

  async GetUserListings(call: any, callback: any) {
    const { user_id, limit = 20, offset = 0 } = call.request;

    try {
      const result = await pool.query(
        'SELECT * FROM listings WHERE seller_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
        [user_id, limit, offset]
      );

      const countResult = await pool.query(
        'SELECT COUNT(*) FROM listings WHERE seller_id = $1',
        [user_id]
      );

      const listings = result.rows.map((listing) => ({
        id: listing.id,
        title: listing.title,
        description: listing.description,
        price: listing.price,
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

      callback(null, {
        success: true,
        listings,
        total_count: parseInt(countResult.rows[0].count),
      });
    } catch (error) {
      console.error('GetUserListings error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to retrieve user listings',
      });
    }
  },

  async GetAllListings(call: any, callback: any) {
    const { limit = 20, offset = 0 } = call.request;

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
        price: listing.price,
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

      callback(null, {
        success: true,
        listings,
        total_count: parseInt(countResult.rows[0].count),
      });
    } catch (error) {
      console.error('GetAllListings error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to retrieve listings',
      });
    }
  },
};
