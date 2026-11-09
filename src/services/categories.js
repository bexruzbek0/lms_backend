import CrudService from './base.js';

export default new CrudService({
  table: 'categories',
  fields: ['name'],
  required: ['name'],
  search: ['t.name'],
  label: 'Kategoriya',
});
