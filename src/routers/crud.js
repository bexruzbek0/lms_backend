import { Router } from 'express';
import authGuard from '../guards/auth.guard.js';
import roles from '../guards/role.guard.js';

/**
 * Standart CRUD yo'nalishlari:
 *   GET    /        ro'yxat        (read rollari)
 *   GET    /:id     bitta          (read rollari)
 *   POST   /        qo'shish       (write rollari)
 *   PUT    /:id     o'zgartirish   (write rollari)
 *   DELETE /:id     o'chirish      (write rollari)
 * read bo'sh bo'lsa - tizimga kirgan har kim ko'ra oladi.
 */
export default function crudRouter(controller, { read = [], write = ['admin'] } = {}) {
  const router = Router();
  const canRead = read.length ? [roles(...read)] : [];
  const canWrite = roles(...write);

  router.use(authGuard);
  router.get('/', ...canRead, controller.getAll);
  router.get('/:id', ...canRead, controller.getOne);
  router.post('/', canWrite, controller.create);
  router.put('/:id', canWrite, controller.update);
  router.delete('/:id', canWrite, controller.remove);
  return router;
}
