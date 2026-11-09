import pool from '../config/db.js';

// Dashboard ("Asosiy") uchun umumiy sonlar
export default {
  async getStats() {
    const { rows } = await pool.query(`
      select
        (select count(*)::int from users where role = 'admin')     as administrators,
        (select count(*)::int from users where role = 'mentor')    as mentors,
        (select count(*)::int from users where role = 'assistant') as assistants,
        (select count(*)::int from users where role = 'student')   as students,
        (select count(*)::int from courses)                        as courses
    `);
    return rows[0];
  },
};
