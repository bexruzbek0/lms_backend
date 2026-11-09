// Ishlatish: npm run postman  ->  postman/lms_backend.postman_collection.json yaratiladi
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));

const url = (p, query = []) => ({
  raw: `{{baseUrl}}${p}${query.length ? '?' + query.map((q) => q.join('=')).join('&') : ''}`,
  host: ['{{baseUrl}}'],
  path: p.split('/').filter(Boolean),
  query: query.map(([key, value]) => ({ key, value })),
});

function req(name, method, p, { json, form, query, noAuth, test } = {}) {
  const item = { name, request: { method, header: [], url: url(p, query) } };
  if (noAuth) item.request.auth = { type: 'noauth' };
  if (json) {
    item.request.header.push({ key: 'Content-Type', value: 'application/json' });
    item.request.body = { mode: 'raw', raw: JSON.stringify(json, null, 2), options: { raw: { language: 'json' } } };
  }
  if (form) {
    item.request.body = {
      mode: 'formdata',
      formdata: Object.entries(form).map(([key, v]) =>
        v === '@file' ? { key, type: 'file', src: [] } : { key, value: String(v), type: 'text' },
      ),
    };
  }
  if (test) item.event = [{ listen: 'test', script: { type: 'text/javascript', exec: test } }];
  return item;
}

// Har bir resurs uchun 5 ta standart so'rov
function crud(folder, p, { create, update, form, query = [] }) {
  const body = form ? { form } : { json: create };
  return {
    name: folder,
    item: [
      req(`${folder} ro'yxati`, 'GET', p, { query: [['page', '1'], ['limit', '10'], ['search', ''], ...query] }),
      req('Bitta olish', 'GET', `${p}/1`),
      req("Qo'shish", 'POST', p, body),
      req("O'zgartirish", 'PUT', `${p}/1`, form ? { form: update } : { json: update }),
      req("O'chirish", 'DELETE', `${p}/1`),
    ],
  };
}

const user = (extra = {}) => ({ full_name: 'Ism Familiya', phone: '+998901112233', password: '123456', ...extra });

const collection = {
  info: {
    name: 'iTLive LMS backend',
    description: "Avval 'Auth > Login' so'rovini yuboring: token avtomatik saqlanadi va qolgan so'rovlarga qo'shiladi.",
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  auth: { type: 'bearer', bearer: [{ key: 'token', value: '{{token}}', type: 'string' }] },
  variable: [
    { key: 'baseUrl', value: 'http://localhost:3000/api' },
    { key: 'token', value: '' },
  ],
  item: [
    {
      name: 'Auth',
      item: [
        req('Login', 'POST', '/auth/login', {
          noAuth: true,
          json: { phone: '+998901234567', password: 'admin123' },
          test: ["const r = pm.response.json();", "if (r.data && r.data.token) pm.collectionVariables.set('token', r.data.token);"],
        }),
        req('Tasdiqlash kodi yuborish', 'POST', '/auth/send-code', { noAuth: true, json: { phone: '+998977777777' } }),
        req('Kodni tasdiqlash', 'POST', '/auth/verify-code', { noAuth: true, json: { phone: '+998977777777', code: '12345' } }),
        req("Ro'yxatdan o'tish", 'POST', '/auth/register', {
          noAuth: true,
          json: { full_name: 'Yangi Talaba', phone: '+998977777777', password: '123456' },
        }),
        req('Parolni tiklash', 'POST', '/auth/reset-password', { noAuth: true, json: { phone: '+998977777777', password: 'yangi123' } }),
        req("Mening profilim", 'GET', '/auth/me'),
        req("Profilni o'zgartirish", 'PUT', '/auth/me', { form: { full_name: 'Istamov Xurshid', phone: '+998901234567', email: 'a@gmail.com', avatar: '@file' } }),
        req("Parolni o'zgartirish", 'PUT', '/auth/me/password', {
          json: { old_password: 'admin123', new_password: 'yangi123', confirm_password: 'yangi123' },
        }),
      ],
    },
    { name: 'Dashboard', item: [req('Umumiy sonlar', 'GET', '/stats')] },
    crud('Administratorlar', '/administrators', { create: user(), update: { full_name: 'Yangi ism' } }),
    {
      ...crud('Mentorlar', '/mentors', {
        create: user({ experience: 3, profession: 'UI/UX Designer', website: 'http://sdex.uz', bio: 'Qisqacha', facebook: 'facebook.com', telegram: 'telegram.me', linkedin: 'linkedin.com', instagram: 'instagram.com', github: 'github.com' }),
        update: { profession: 'Full-stack engineer' },
      }),
    },
    crud('Assistentlar', '/assistants', { create: user(), update: { full_name: 'Yangi ism' } }),
    crud("O'quvchilar", '/students', { create: user(), update: { full_name: 'Yangi ism' } }),
    crud('Kategoriyalar', '/categories', { create: { name: 'Web dasturlash' }, update: { name: 'Yangi nom' } }),
    crud('Kurslar', '/courses', {
      form: { name: 'Frontend dasturlash', description: 'Kurs haqida', level: 'Beginner', price: 250000, category_id: 1, mentor_id: 2, banner: '@file', intro_video: '@file' },
      update: { price: 300000, status: 'inactive' },
      query: [['category_id', ''], ['mentor_id', '']],
    }),
    crud("Bo'limlar", '/sections', { create: { course_id: 1, name: 'CSS asoslari' }, update: { name: 'Yangi nom' }, query: [['course_id', '1']] }),
    crud('Darslar', '/lessons', {
      form: { section_id: 1, name: 'Veb dasturlashga kirish', description: 'Dars haqida', video: '@file' },
      update: { name: 'Yangi nom' },
      query: [['section_id', '1']],
    }),
    crud('Materiallar', '/materials', { form: { lesson_id: 1, description: 'Material izohi', file: '@file' }, update: { description: 'Yangi izoh' }, query: [['lesson_id', '1']] }),
    crud('Vazifalar', '/tasks', { form: { lesson_id: 1, title: 'Vazifani bajaring', file: '@file' }, update: { title: 'Yangi topshiriq' }, query: [['lesson_id', '1']] }),
    crud('Imtihon savollari', '/exams', {
      create: { lesson_id: 1, question: 'CSS kengaytmasini toping', variant_a: 'Cascading Style Sheets', variant_b: 'Computer Style Sheets', variant_c: 'Creative Style System', variant_d: 'Colorful Style Sheets', correct: 'a' },
      update: { correct: 'b' },
      query: [['lesson_id', '1']],
    }),
    crud("To'lovlar", '/payments', { create: { user_id: 4, course_id: 1, payment_type: 'Payme', status: 'paid' }, update: { status: 'pending' } }),
    crud('Izohlar', '/comments', { create: { course_id: 1, text: "Zo'r kurs" }, update: { text: 'Yangi matn' } }),
    crud('Natijalar', '/results', {
      create: { user_id: 4, course_id: 1, section_id: 1, correct: 25, wrong: 5 },
      update: { passed: true },
      query: [['from', '2024-08-04'], ['to', '2030-08-05']],
    }),
  ],
};

// Qo'shimcha yo'nalishlar
collection.item.find((i) => i.name === 'Mentorlar').item.push(req('Mentorning kurslari', 'GET', '/mentors/2/courses'));
const courses = collection.item.find((i) => i.name === 'Kurslar');
courses.item.push(
  req('Assistent biriktirish', 'PUT', '/courses/1/assistant', { json: { assistant_id: 3 } }),
  req('Assistentni olib tashlash', 'DELETE', '/courses/1/assistant'),
);

const file = path.join(dir, 'lms_backend.postman_collection.json');
fs.writeFileSync(file, JSON.stringify(collection, null, 2));
console.log('Yaratildi:', file);
