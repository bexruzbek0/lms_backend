import CrudService from './base.js';

export default new CrudService({
  table: 'tasks',
  fields: ['lesson_id', 'title', 'file'],
  required: ['lesson_id', 'title'],
  select: `select t.*, l.name as lesson_name
           from tasks t join lessons l on l.id = t.lesson_id`,
  search: ['t.title', 'l.name'],
  filters: ['lesson_id'],
  label: 'Vazifa',
});
