import pool from '../config/db.js';
import CrudService from './base.js';
import ErrorException from '../utils/ErrorException.js';

class CoursesService extends CrudService {
  constructor() {
    super({
      table: 'courses',
      fields: ['name', 'description', 'level', 'price', 'banner', 'intro_video', 'category_id', 'mentor_id', 'assistant_id', 'status'],
      required: ['name', 'price', 'category_id'],
      select: `select t.*,
                 c.name as category_name,
                 m.full_name as mentor_name,
                 a.full_name as assistant_name,
                 (select count(distinct p.user_id)::int from payments p where p.course_id = t.id) as students_count
               from courses t
               left join categories c on c.id = t.category_id
               left join users m on m.id = t.mentor_id
               left join users a on a.id = t.assistant_id`,
      search: ['t.name'],
      filters: ['category_id', 'mentor_id', 'assistant_id', 'status', 'level'],
      label: 'Kurs',
    });
  }

  async assignAssistant(courseId, assistantId) {
    await this.getOne(courseId);
    if (assistantId !== null) {
      const { rowCount } = await pool.query("select 1 from users where id = $1 and role = 'assistant'", [Number(assistantId)]);
      if (!rowCount) throw new ErrorException('Assistent topilmadi', 404);
    }
    await pool.query('update courses set assistant_id = $1 where id = $2', [assistantId, Number(courseId)]);
    return this.getOne(courseId);
  }
}

export default new CoursesService();
