import CrudService from './base.js';

export default new CrudService({
  table: 'lessons',
  fields: ['section_id', 'name', 'description', 'video'],
  required: ['section_id', 'name'],
  select: `select t.*, s.name as section_name, s.course_id, c.name as course_name
           from lessons t
           join sections s on s.id = t.section_id
           join courses c on c.id = s.course_id`,
  search: ['t.name', 't.description'],
  filters: ['section_id', { param: 'course_id', column: 's.course_id' }],
  label: 'Dars',
});
