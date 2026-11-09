import CrudService from './base.js';

class ResultsService extends CrudService {
  constructor() {
    super({
      table: 'results',
      fields: ['user_id', 'course_id', 'section_id', 'correct', 'wrong', 'passed'],
      required: ['user_id', 'course_id'],
      select: `select t.*, u.full_name, u.avatar, c.name as course_name, s.name as section_name
               from results t
               join users u on u.id = t.user_id
               join courses c on c.id = t.course_id
               left join sections s on s.id = t.section_id`,
      search: ['u.full_name'],
      filters: [
        'user_id',
        'course_id',
        'passed',
        { param: 'from', column: 't.created_at::date', op: '>=' },
        { param: 'to', column: 't.created_at::date', op: '<=' },
      ],
      label: 'Natija',
    });
  }

  async prepare(data, isCreate) {
    // "passed" yuborilmasa: kamida 60% to'g'ri javob bo'lsa, imtihondan o'tgan hisoblanadi
    if (isCreate && data.passed === undefined) {
      const correct = Number(data.correct || 0);
      const wrong = Number(data.wrong || 0);
      data.passed = correct + wrong > 0 && correct / (correct + wrong) >= 0.6;
    }
    return data;
  }
}

export default new ResultsService();
