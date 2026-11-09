import { Router } from 'express';
import courses from '../controllers/courses.js';
import crudRouter from './crud.js';
import authGuard from '../guards/auth.guard.js';
import roles from '../guards/role.guard.js';

const router = Router();

// Assistent biriktirish / olib tashlash (faqat admin) - umumiy CRUD'dan oldin e'lon qilinadi
router.put('/:id/assistant', authGuard, roles('admin'), courses.assignAssistant);
router.delete('/:id/assistant', authGuard, roles('admin'), courses.removeAssistant);

router.use(crudRouter(courses, { write: ['admin'] }));

export default router;
