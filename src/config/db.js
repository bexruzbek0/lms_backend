import pg from 'pg';
import config from './index.js';

const pool = new pg.Pool(config.db);

pool.on('error', (err) => {
  console.error('PostgreSQL xatosi:', err.message);
});

export default pool;
