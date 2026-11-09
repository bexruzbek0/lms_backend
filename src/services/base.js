import pool from '../config/db.js';
import ErrorException from '../utils/ErrorException.js';
import { paging } from '../utils/upload.js';

/**
 * Oddiy CRUD (ro'yxat, bitta, qo'shish, o'zgartirish, o'chirish) uchun umumiy servis.
 * Har bir jadval o'z servisini shu klassdan meros qilib oladi.
 *
 *  table     - jadval nomi
 *  fields    - yozishga ruxsat berilgan ustunlar (boshqa ustun qabul qilinmaydi)
 *  required  - qo'shishda majburiy maydonlar
 *  select    - ro'yxat uchun SELECT (asosiy jadval alias'i: t)
 *  search    - ?search= qaysi ustunlar bo'yicha qidiradi
 *  filters   - ?course_id=1 kabi filtrlar
 *  baseWhere - doim qo'shiladigan shart (faqat kod ichidagi ishonchli matn)
 */
export default class CrudService {
  constructor({ table, fields, required = [], select, search = [], filters = [], baseWhere = '', orderBy = 't.id desc', label = "Ma'lumot" }) {
    this.table = table;
    this.fields = fields;
    this.required = required;
    this.select = select || `select t.* from ${table} t`;
    this.search = search;
    this.baseWhere = baseWhere;
    this.orderBy = orderBy;
    this.label = label;
    this.filters = filters.map((f) => (typeof f === 'string' ? { param: f, column: `t.${f}`, op: '=' } : { op: '=', ...f }));
  }

  toId(id) {
    const n = Number(id);
    if (!Number.isInteger(n) || n < 1) throw new ErrorException("ID noto'g'ri", 400);
    return n;
  }

  pick(body = {}) {
    const data = {};
    for (const f of this.fields) {
      if (body[f] !== undefined && body[f] !== '') data[f] = body[f];
    }
    return data;
  }

  // Saqlashdan oldin ma'lumotni tayyorlash (parolni hashlash va h.k.) - kerak bo'lsa override qilinadi
  async prepare(data) {
    return data;
  }

  async getAll(query = {}) {
    const { page, limit, offset } = paging(query);
    const where = this.baseWhere ? [this.baseWhere] : [];
    const values = [];

    if (query.search && this.search.length) {
      values.push(`%${query.search}%`);
      where.push('(' + this.search.map((c) => `${c}::text ilike $${values.length}`).join(' or ') + ')');
    }
    for (const f of this.filters) {
      const v = query[f.param];
      if (v !== undefined && v !== '') {
        values.push(v);
        where.push(`${f.column} ${f.op} $${values.length}`);
      }
    }

    const w = where.length ? ` where ${where.join(' and ')}` : '';
    const total = (await pool.query(`select count(*)::int as c from (${this.select}${w}) q`, values)).rows[0].c;
    const { rows } = await pool.query(`${this.select}${w} order by ${this.orderBy} limit ${limit} offset ${offset}`, values);
    return { data: rows, total, page, limit };
  }

  async getOne(id) {
    const where = this.baseWhere ? ` and ${this.baseWhere}` : '';
    const { rows } = await pool.query(`${this.select} where t.id = $1${where}`, [this.toId(id)]);
    if (!rows.length) throw new ErrorException(`${this.label} topilmadi`, 404);
    return rows[0];
  }

  async create(body) {
    let data = this.pick(body);
    for (const r of this.required) {
      if (data[r] === undefined && !(this.defaults && r in this.defaults)) {
        throw new ErrorException(`"${r}" maydoni majburiy`, 400);
      }
    }
    data = await this.prepare(data, true, body);
    const cols = Object.keys(data);
    const { rows } = await pool.query(
      `insert into ${this.table} (${cols.join(', ')}) values (${cols.map((_, i) => `$${i + 1}`).join(', ')}) returning id`,
      cols.map((c) => data[c]),
    );
    return this.getOne(rows[0].id);
  }

  async update(id, body) {
    await this.getOne(id); // mavjudligini tekshiradi (yo'q bo'lsa 404)
    let data = this.pick(body);
    data = await this.prepare(data, false, body);
    const cols = Object.keys(data);
    if (!cols.length) throw new ErrorException("O'zgartirish uchun ma'lumot yuborilmadi", 400);
    await pool.query(
      `update ${this.table} set ${cols.map((c, i) => `${c} = $${i + 1}`).join(', ')} where id = $${cols.length + 1}`,
      [...cols.map((c) => data[c]), Number(id)],
    );
    return this.getOne(id);
  }

  async remove(id) {
    await this.getOne(id);
    await pool.query(`delete from ${this.table} where id = $1`, [Number(id)]);
    return { id: Number(id) };
  }
}
