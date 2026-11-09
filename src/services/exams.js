import CrudService from './base.js';
import ErrorException from '../utils/ErrorException.js';

class ExamsService extends CrudService {
  constructor() {
    super({
      table: 'exams',
      fields: ['lesson_id', 'question', 'variant_a', 'variant_b', 'variant_c', 'variant_d', 'correct'],
      required: ['lesson_id', 'question', 'variant_a', 'variant_b', 'variant_c', 'variant_d', 'correct'],
      select: `select t.*, l.name as lesson_name
               from exams t join lessons l on l.id = t.lesson_id`,
      search: ['t.question', 'l.name'],
      filters: ['lesson_id'],
      label: 'Savol',
    });
  }

  async prepare(data) {
    if (data.correct !== undefined) {
      data.correct = String(data.correct).toLowerCase();
      if (!['a', 'b', 'c', 'd'].includes(data.correct)) {
        throw new ErrorException("To'g'ri javob a, b, c yoki d bo'lishi kerak", 400);
      }
    }
    return data;
  }
}

export default new ExamsService();
