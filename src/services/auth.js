import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import pool from '../config/db.js';
import ErrorException from '../utils/ErrorException.js';

const PUBLIC = 'id, full_name, phone, role, avatar, email, status, notifications, created_at';

// Tasdiqlash kodlari xotirada saqlanadi (haqiqiy loyihada SMS yuboriladi)
const codes = new Map();
const verified = new Map();
const TTL = 5 * 60 * 1000;

const sign = (user) => jwt.sign({ id: user.id, role: user.role }, config.jwtSecret, { expiresIn: config.jwtExpires });

class AuthService {
  async login(phone, password) {
    if (!phone || !password) throw new ErrorException('Telefon raqam va parol kiritilishi shart', 400);
    const { rows } = await pool.query('select * from users where phone = $1', [phone]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(String(password), user.password))) {
      throw new ErrorException("Login yoki parol noto'g'ri", 401);
    }
    if (user.status !== 'active') throw new ErrorException('Hisob faol emas', 403);
    delete user.password;
    return { token: sign(user), user };
  }

  sendCode(phone) {
    if (!phone) throw new ErrorException('Telefon raqam kiritilishi shart', 400);
    const code = String(Math.floor(10000 + Math.random() * 90000));
    codes.set(phone, { code, expires: Date.now() + TTL });
    console.log(`[SMS] ${phone} uchun tasdiqlash kodi: ${code}`);
    // Ishlab chiqish rejimida kod javobda ham qaytariladi (Postman'da tekshirish oson bo'lishi uchun)
    return config.isProd ? {} : { code };
  }

  verifyCode(phone, code) {
    const item = codes.get(phone);
    if (!item || item.expires < Date.now() || item.code !== String(code)) {
      throw new ErrorException("Tasdiqlash kodi noto'g'ri yoki eskirgan", 400);
    }
    codes.delete(phone);
    verified.set(phone, Date.now() + TTL);
    return true;
  }

  assertVerified(phone) {
    const exp = verified.get(phone);
    if (!exp || exp < Date.now()) throw new ErrorException('Avval telefon raqamni tasdiqlang', 400);
    verified.delete(phone);
  }

  async register({ full_name, phone, password }) {
    if (!full_name || !phone || !password) throw new ErrorException("Ism, telefon va parol majburiy", 400);
    this.assertVerified(phone);
    const hash = await bcrypt.hash(String(password), 10);
    await pool.query("insert into users (full_name, phone, password, role) values ($1, $2, $3, 'student')", [full_name, phone, hash]);
    return this.login(phone, password);
  }

  async resetPassword({ phone, password }) {
    if (!phone || !password) throw new ErrorException('Telefon va yangi parol majburiy', 400);
    this.assertVerified(phone);
    const { rowCount } = await pool.query('update users set password = $1 where phone = $2', [await bcrypt.hash(String(password), 10), phone]);
    if (!rowCount) throw new ErrorException('Foydalanuvchi topilmadi', 404);
    return true;
  }

  async me(id) {
    const { rows } = await pool.query(`select ${PUBLIC} from users where id = $1`, [id]);
    if (!rows.length) throw new ErrorException('Foydalanuvchi topilmadi', 404);
    return rows[0];
  }

  async updateMe(id, body) {
    const allowed = ['full_name', 'phone', 'email', 'avatar', 'notifications'];
    const cols = allowed.filter((k) => body[k] !== undefined && body[k] !== '');
    if (!cols.length) throw new ErrorException("O'zgartirish uchun ma'lumot yuborilmadi", 400);
    await pool.query(
      `update users set ${cols.map((c, i) => `${c} = $${i + 1}`).join(', ')} where id = $${cols.length + 1}`,
      [...cols.map((c) => body[c]), id],
    );
    return this.me(id);
  }

  async changePassword(id, { old_password, new_password, confirm_password }) {
    if (!old_password || !new_password) throw new ErrorException('Eski va yangi parol majburiy', 400);
    if (confirm_password !== undefined && confirm_password !== new_password) {
      throw new ErrorException('Yangi parollar bir xil emas', 400);
    }
    const { rows } = await pool.query('select password from users where id = $1', [id]);
    if (!rows.length || !(await bcrypt.compare(String(old_password), rows[0].password))) {
      throw new ErrorException("Joriy parol noto'g'ri", 400);
    }
    await pool.query('update users set password = $1 where id = $2', [await bcrypt.hash(String(new_password), 10), id]);
    return true;
  }
}

export default new AuthService();
