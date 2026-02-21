import * as grpc from '@grpc/grpc-js';
import { v4 as uuidv4 } from 'uuid';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://uta:uta@postgres:5432/uta_marketplace',
});

export const MessagingServiceHandlers = {
  async InitiateContact(call: any, callback: any) {
    const { user_id, listing_id, seller_id, contact_method } = call.request;

    try {
      // Get seller's contact information
      const sellerResult = await pool.query(
        'SELECT email, whatsapp FROM users WHERE id = $1',
        [seller_id]
      );

      if (sellerResult.rows.length === 0) {
        return callback(null, {
          success: false,
          message: 'Seller not found',
          contact_url: '',
          contact_info: '',
        });
      }

      const seller = sellerResult.rows[0];
      let contact_url = '';
      let contact_info = '';

      if (contact_method === 'whatsapp') {
        if (!seller.whatsapp) {
          return callback(null, {
            success: false,
            message: 'WhatsApp not available for this seller',
            contact_url: '',
            contact_info: '',
          });
        }
        // Create WhatsApp URL
        const phoneNumber = seller.whatsapp.replace(/\D/g, ''); // Remove non-digits
        contact_url = `https://wa.me/${phoneNumber}`;
        contact_info = seller.whatsapp;
      } else if (contact_method === 'email') {
        if (!seller.email) {
          return callback(null, {
            success: false,
            message: 'Email not available for this seller',
            contact_url: '',
            contact_info: '',
          });
        }
        // Create mailto URL
        contact_url = `mailto:${seller.email}`;
        contact_info = seller.email;
      } else {
        return callback(null, {
          success: false,
          message: 'Invalid contact method',
          contact_url: '',
          contact_info: '',
        });
      }

      // Log the contact attempt
      await pool.query(
        `INSERT INTO contact_attempts (id, user_id, listing_id, seller_id, contact_method)
         VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), user_id, listing_id, seller_id, contact_method]
      );

      callback(null, {
        success: true,
        message: 'Contact information retrieved successfully',
        contact_url,
        contact_info,
      });
    } catch (error) {
      console.error('InitiateContact error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Internal server error',
      });
    }
  },

  async GetContactInfo(call: any, callback: any) {
    const { seller_id, listing_id } = call.request;

    try {
      const result = await pool.query(
        'SELECT full_name, email, phone, whatsapp FROM users WHERE id = $1',
        [seller_id]
      );

      if (result.rows.length === 0) {
        return callback(null, {
          success: false,
          message: 'Seller not found',
          contact_info: null,
        });
      }

      const seller = result.rows[0];

      callback(null, {
        success: true,
        message: 'Contact information retrieved',
        contact_info: {
          seller_id,
          full_name: seller.full_name || '',
          email: seller.email || '',
          phone: seller.phone || '',
          whatsapp: seller.whatsapp || '',
          email_available: !!seller.email,
          phone_available: !!seller.phone,
          whatsapp_available: !!seller.whatsapp,
        },
      });
    } catch (error) {
      console.error('GetContactInfo error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Internal server error',
      });
    }
  },

  async LogContactAttempt(call: any, callback: any) {
    const { user_id, listing_id, seller_id, contact_method, timestamp } = call.request;

    try {
      await pool.query(
        `INSERT INTO contact_attempts (id, user_id, listing_id, seller_id, contact_method, timestamp)
         VALUES ($1, $2, $3, $4, $5, to_timestamp($6))`,
        [uuidv4(), user_id, listing_id, seller_id, contact_method, timestamp]
      );

      callback(null, {
        success: true,
        message: 'Contact attempt logged successfully',
      });
    } catch (error) {
      console.error('LogContactAttempt error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Internal server error',
      });
    }
  },

  async GetContactHistory(call: any, callback: any) {
    const { user_id, limit, offset } = call.request;

    try {
      // Get total count
      const countResult = await pool.query(
        'SELECT COUNT(*) FROM contact_attempts WHERE user_id = $1',
        [user_id]
      );
      const total_count = parseInt(countResult.rows[0].count);

      // Get contact history
      const result = await pool.query(
        `SELECT ca.listing_id, l.title as listing_title, ca.seller_id,
                ca.contact_method,
                EXTRACT(EPOCH FROM ca.timestamp)::bigint as contacted_at
         FROM contact_attempts ca
         LEFT JOIN listings l ON ca.listing_id = l.id
         WHERE ca.user_id = $1
         ORDER BY ca.timestamp DESC
         LIMIT $2 OFFSET $3`,
        [user_id, limit || 20, offset || 0]
      );

      const attempts = result.rows.map((row: any) => ({
        listing_id: row.listing_id,
        listing_title: row.listing_title || 'Unknown',
        seller_id: row.seller_id,
        contact_method: row.contact_method,
        timestamp: row.contacted_at,
      }));

      callback(null, {
        success: true,
        attempts,
        total_count,
      });
    } catch (error) {
      console.error('GetContactHistory error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Internal server error',
      });
    }
  },
};
