import CrudService from './base.js';

export default new CrudService({
  table: 'materials',
  fields: ['lesson_id', 'description', 'file'],
  required: ['lesson_id', 'description'],
  select: `select t.*, l.name as lesson_name
           from materials t join lessons l on l.id = t.lesson_id`,
  search: ['t.description', 'l.name'],
  filters: ['lesson_id'],
  label: 'Material',
});
