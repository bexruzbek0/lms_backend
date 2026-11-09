import pool from '../config/db.js';
import CrudService from './base.js';
import ErrorException from '../utils/ErrorException.js';

class PaymentsService extends CrudService {
  constructor() {
    super({
      table: 'payments',
      fields: ['user_id', 'course_id', 'amount', 'payment_type', 'status'],
      required: ['user_id', 'course_id', 'payment_type'],
      select: `select t.*, u.full_name as buyer_name, u.avatar as buyer_avatar,
                      c.name as course_name, cat.name as category_name
               from payments t
               join users u on u.id = t.user_id
               join courses c on c.id = t.course_id
               left join categories cat on cat.id = c.category_id`,
      search: ['u.full_name', 'c.name'],
      filters: ['user_id', 'course_id', 'status', 'payment_type'],
      label: "To'lov",
    });
  }

  async prepare(data, isCreate) {
    // Summa yuborilmasa, kurs narxi olinadi
    if (isCreate && data.amount === undefined) {
      const { rows } = await pool.query('select price from courses where id = $1', [Number(data.course_id)]);
      if (!rows.length) throw new ErrorException('Kurs topilmadi', 404);
      data.amount = rows[0].price;
    }
    return data;
  }
}

export default new PaymentsService();
