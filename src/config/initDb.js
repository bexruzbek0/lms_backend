// Ishlatish:  npm run db:init   (bazani va jadvallarni yaratadi, admin qo'shadi)
//             npm run db:seed   (qo'shimcha namuna ma'lumotlar ham qo'shadi)
import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import pg from 'pg';
import config, { ROOT } from './index.js';
import pool from './db.js';

const withSeed = process.argv.includes('--seed');

async function ensureDatabase() {
  const admin = new pg.Client({ ...config.db, database: 'postgres' });
  await admin.connect();
  const { rowCount } = await admin.query('select 1 from pg_database where datname = $1', [config.db.database]);
  if (!rowCount) {
    await admin.query(`create database "${config.db.database}"`);
    console.log(`Baza yaratildi: ${config.db.database}`);
  }
  await admin.end();
}

async function createTables() {
  const sql = fs.readFileSync(path.join(ROOT, 'src', 'config', 'schema.sql'), 'utf8');
  await pool.query(sql);
  console.log('Jadvallar tayyor');
}

async function addUser(full_name, phone, password, role, extra = {}) {
  const hash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    `insert into users (full_name, phone, password, role, experience, profession)
     values ($1, $2, $3, $4, $5, $6)
     on conflict (phone) do update set phone = excluded.phone
     returning id`,
    [full_name, phone, hash, role, extra.experience ?? null, extra.profession ?? null],
  );
  return rows[0].id;
}

async function seed() {
  await addUser('Istamov Xurshid', '+998901234567', 'admin123', 'admin');
  console.log('Admin: +998901234567 / admin123');
  if (!withSeed) return;

  const mentor = await addUser('Safarov Oybek', '+998911111111', 'mentor123', 'mentor', {
    experience: 3,
    profession: 'Full-stack software engineer',
  });
  const assistant = await addUser('Karimov Anvar', '+998922222222', 'assist123', 'assistant');
  const student1 = await addUser('Istamov Xurshid Hazratqul', '+998933333333', 'student123', 'student');
  const student2 = await addUser('Avazmov Akmal', '+998944444444', 'student123', 'student');

  const { rowCount } = await pool.query('select 1 from categories');
  if (rowCount) return console.log('Namuna ma\'lumotlar oldin qo\'shilgan');

  const cat = (await pool.query("insert into categories (name) values ('Web dasturlash'), ('Sun''iy intellekt') returning id")).rows[0].id;
  const course = (
    await pool.query(
      `insert into courses (name, description, level, price, category_id, mentor_id, assistant_id)
       values ('Frontend dasturlash', 'Frontend asoslari va React', 'Beginner', 250000, $1, $2, $3) returning id`,
      [cat, mentor, assistant],
    )
  ).rows[0].id;
  await pool.query(
    `insert into courses (name, description, level, price, category_id, mentor_id, status)
     values ('Backend dasturlash', 'Node.js va PostgreSQL', 'Beginner', 300000, $1, $2, 'inactive')`,
    [cat, mentor],
  );
  const section = (await pool.query("insert into sections (course_id, name) values ($1, 'CSS asoslari') returning id", [course])).rows[0].id;
  const lesson = (
    await pool.query(
      "insert into lessons (section_id, name, description) values ($1, 'Veb dasturlashga kirish', 'Frontend dasturlash veb dasturlashning bir qismi hisoblanadi') returning id",
      [section],
    )
  ).rows[0].id;
  await pool.query("insert into materials (lesson_id, description) values ($1, 'Frontend dasturlash veb dasturlashning bir qismi hisoblanadi')", [lesson]);
  await pool.query("insert into tasks (lesson_id, title) values ($1, 'Vazifani bajaring')", [lesson]);
  await pool.query(
    `insert into exams (lesson_id, question, variant_a, variant_b, variant_c, variant_d, correct)
     values ($1, 'CSS kengaytmasini toping', 'Cascading Style Sheets', 'Computer Style Sheets', 'Creative Style System', 'Colorful Style Sheets', 'a')`,
    [lesson],
  );
  await pool.query(
    `insert into payments (user_id, course_id, amount, payment_type, status)
     values ($1, $3, 250000, 'Payme', 'paid'), ($2, $3, 250000, 'Naqd', 'paid')`,
    [student1, student2, course],
  );
  await pool.query(
    "insert into comments (user_id, course_id, text) values ($1, $2, 'SMM sohasini 0 dan o''rganing va faoliyatingizni eng yaxshi kompaniyada olib boring')",
    [student1, course],
  );
  await pool.query(
    `insert into results (user_id, course_id, section_id, correct, wrong, passed)
     values ($1, $3, $4, 25, 5, true), ($2, $3, $4, 10, 20, false)`,
    [student1, student2, course, section],
  );
  console.log('Namuna ma\'lumotlar qo\'shildi');
}

try {
  await ensureDatabase();
  await createTables();
  await seed();
} catch (err) {
  console.error('Xato:', err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
