import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a connection pool
let pool: Pool | null = null;

try {
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'battleship_carnage',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });
  
  // Test the connection
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.warn('Database connection failed:', err.message);
      console.warn('Continuing without database connection...');
    } else {
      console.log('Database connected successfully');
    }
  });
} catch (error) {
  console.warn('Failed to initialize database pool:', error);
  console.warn('Continuing without database connection...');
}

export default {
  query: async (text: string, params?: any[]) => {
    if (!pool) {
      console.warn('Database not connected, skipping query');
      return { rows: [] };
    }
    
    try {
      return await pool.query(text, params);
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },
  getPool: () => pool,
}; 