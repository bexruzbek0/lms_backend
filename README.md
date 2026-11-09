# iTLive LMS backend

Node.js + Express + PostgreSQL. Tuzilma: `routers` → `controllers` → `services`.

## Ishga tushirish

1. **PostgreSQL** o'rnatilgan va ishlab turgan bo'lsin (pgAdmin bilan ishlatadigan baza).
2. `.env` faylini oching va `DB_PASSWORD` ga PostgreSQL parolingizni yozing (`DB_USER` odatda `postgres`).
3. Terminalda:
   ```
   npm install
   npm run db:seed     # baza + jadvallar + admin + namuna ma'lumotlar
   npm run dev         # server: http://localhost:3000
   ```
   Faqat bo'sh baza va admin kerak bo'lsa: `npm run db:init`.

**Admin:** `+998901234567` / `admin123`
Namuna: mentor `+998911111111` / `mentor123`, assistent `+998922222222` / `assist123`, o'quvchi `+998933333333` / `student123`.

## Postman

1. Postman → **Import** → `postman/lms_backend.postman_collection.json`.
2. **Auth → Login** ni yuboring. Token o'zi saqlanadi va qolgan so'rovlarga qo'shiladi.
3. Fayl yuboriladigan so'rovlarda (kurs, dars, material, vazifa) **Body → form-data** ishlatiladi, fayl maydonining turini `File` qilib tanlang.

Ro'yxatdan o'tish: `send-code` javobida `code` qaytadi (SMS o'rniga, faqat ishlab chiqishda) → uni `verify-code` ga yuboring → `register`.

## Endpointlar (hammasi `/api` ostida)

| Yo'nalish | Nima |
|---|---|
| `POST /auth/login`, `send-code`, `verify-code`, `register`, `reset-password` | Kirish va ro'yxatdan o'tish |
| `GET/PUT /auth/me`, `PUT /auth/me/password` | Profil sozlamalari |
| `/administrators` `/mentors` `/assistants` `/students` | Foydalanuvchilar CRUD |
| `GET /mentors/:id/courses` | Mentor va uning kurslari |
| `/categories` `/courses` `/sections` `/lessons` `/materials` `/tasks` `/exams` | Kurslar va kontent CRUD |
| `PUT/DELETE /courses/:id/assistant` | Assistent biriktirish / olib tashlash |
| `/payments` `/comments` `/results` | To'lovlar, izohlar, natijalar |
| `GET /stats` | Dashboard sonlari |

Har bir CRUD: `GET /` (ro'yxat), `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`.
Ro'yxat parametrlari: `?page=1&limit=10&search=...` va filtrlar (`?course_id=1`, `?lesson_id=1`, natijalarda `?from=2024-08-04&to=2024-08-05`).

## Rollar

- `admin`: hammasiga ruxsat.
- `mentor`: bo'lim, dars, material, vazifa, imtihonni boshqaradi; qolganini ko'radi.
- `assistant`: ko'rish.
- `student`: kurslarni ko'radi, o'z natijasini yuboradi va faqat o'zinikini ko'radi.

## Papkalar

```
src/
  config/       db ulanishi, sozlamalar, schema.sql, initDb.js
  controllers/  so'rovni qabul qilib, javob qaytaradi
  guards/       auth.guard (token), role.guard (rol)
  log/          logger.txt (xatolar shu yerga yoziladi)
  middleware/   xatolarni boshqarish
  routers/      yo'nalishlar
  services/     asosiy mantiq va SQL so'rovlar
  utils/        ErrorException, fayl yuklash
uploads/        banner, introVideo, lessons, materials, tasks, avatars
postman/        Postman collection
```
Yuklangan fayllar `http://localhost:3000/uploads/...` orqali ochiladi.
