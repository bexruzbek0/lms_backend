import CrudService from './base.js';

export default new CrudService({
  table: 'sections',
  fields: ['course_id', 'name'],
  required: ['course_id', 'name'],
  select: `select t.*, c.name as course_name
           from sections t join courses c on c.id = t.course_id`,
  search: ['t.name'],
  filters: ['course_id'],
  label: "Bo'lim",
});
