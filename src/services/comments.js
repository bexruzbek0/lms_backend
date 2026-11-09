import CrudService from './base.js';

export default new CrudService({
  table: 'comments',
  fields: ['user_id', 'course_id', 'parent_id', 'text'],
  required: ['user_id', 'course_id', 'text'],
  select: `select t.*, u.full_name as user_name, c.name as course_name,
                  (select count(*)::int from comments r where r.parent_id = t.id) as replies_count
           from comments t
           join users u on u.id = t.user_id
           join courses c on c.id = t.course_id`,
  search: ['t.text', 'u.full_name'],
  filters: ['course_id', 'user_id', 'parent_id'],
  label: 'Izoh',
});
