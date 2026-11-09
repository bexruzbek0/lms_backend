import app from './app.js';
import config from './config/index.js';
import pool from './config/db.js';

try {
  await pool.query('select 1');
} catch (err) {
  console.error(`PostgreSQL'ga ulanib bo'lmadi: ${err.message}`);
  console.error('.env faylidagi DB_* sozlamalarini va PostgreSQL ishlayotganini tekshiring.');
  process.exit(1);
}

app.listen(config.port, () => {
  console.log(`Server ishga tushdi: http://localhost:${config.port}`);
});
