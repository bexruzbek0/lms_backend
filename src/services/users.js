import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import CrudService from './base.js';

const SOCIALS = ['facebook', 'telegram', 'linkedin', 'instagram', 'github', 'portfolio'];

// Administrator, mentor, assistent va o'quvchilar uchun bitta servis (role bilan ajratiladi)
export class UsersService extends CrudService {
  constructor(role, label) {
    super({
      table: 'users',
      fields: ['full_name', 'phone', 'password', 'avatar', 'email', 'status', 'experience', 'profession', 'website', 'bio', 'socials'],
      required: ['full_name', 'phone', 'password'],
      select: `select t.id, t.full_name, t.phone, t.role, t.avatar, t.email, t.status,
                      t.experience, t.profession, t.website, t.bio, t.socials, t.created_at,
                      (select count(*)::int from courses c where c.mentor_id = t.id) as courses_count,
                      (select count(*)::int from payments p where p.user_id = t.id) as payments_count
               from users t`,
      search: ['t.full_name', 't.phone'],
      filters: ['status'],
      baseWhere: `t.role = '${role}'`,
      label,
    });
    this.role = role;
  }

  async prepare(data, isCreate, body = {}) {
    if (isCreate) data.role = this.role;
    if (data.password) data.password = await bcrypt.hash(String(data.password), 10);

    // Ijtimoiy tarmoqlar: yoki socials={...}, yoki alohida facebook, telegram... maydonlari
    let socials = data.socials;
    if (typeof socials === 'string') {
      try {
        socials = JSON.parse(socials);
      } catch {
        socials = undefined;
      }
    }
    const flat = {};
    for (const k of SOCIALS) if (body[k]) flat[k] = body[k];
    if (Object.keys(flat).length) socials = { ...(socials || {}), ...flat };
    if (socials) data.socials = JSON.stringify(socials);
    else delete data.socials;
    return data;
  }

  // Mentorning kurslari (kartalar sahifasi uchun)
  async getWithCourses(id) {
    const mentor = await this.getOne(id);
    const { rows } = await pool.query(
      `select c.id, c.name, c.description, c.price, c.banner, c.status, cat.name as category_name
       from courses c left join categories cat on cat.id = c.category_id
       where c.mentor_id = $1 order by c.id desc`,
      [mentor.id],
    );
    return { ...mentor, courses: rows };
  }
}

export const administrators = new UsersService('admin', 'Administrator');
export const mentors = new UsersService('mentor', 'Mentor');
export const assistants = new UsersService('assistant', 'Assistent');
export const students = new UsersService('student', "O'quvchi");
