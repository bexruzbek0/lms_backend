import { Router } from 'express';
import authRouter from './auth.js';
import coursesRouter from './courses.js';
import crudRouter from './crud.js';
import crudController from '../controllers/crud.js';
import stats from '../controllers/stats.js';
import authGuard from '../guards/auth.guard.js';
import roles from '../guards/role.guard.js';
import { administratorsRouter, mentorsRouter, assistantsRouter, studentsRouter } from './users.js';
import { DOC_EXT, VIDEO_EXT } from '../utils/upload.js';

import categories from '../services/categories.js';
import sections from '../services/sections.js';
import lessons from '../services/lessons.js';
import materials from '../services/materials.js';
import tasks from '../services/tasks.js';
import exams from '../services/exams.js';
import payments from '../services/payments.js';
import comments from '../services/comments.js';
import results from '../services/results.js';

const router = Router();
const content = ['admin', 'mentor']; // kontentni (bo'lim, dars, material...) boshqara oladigan rollar

router.use('/auth', authRouter);

// Foydalanuvchilar
router.use('/administrators', administratorsRouter);
router.use('/mentors', mentorsRouter);
router.use('/assistants', assistantsRouter);
router.use('/students', studentsRouter);

// Kurslar va ularning ichidagi kontent
router.use('/courses', coursesRouter);
router.use('/categories', crudRouter(crudController(categories), { write: ['admin'] }));
router.use('/sections', crudRouter(crudController(sections), { write: content }));
router.use(
  '/lessons',
  crudRouter(crudController(lessons, { files: { video: { folder: 'lessons', ext: VIDEO_EXT } } }), { write: content }),
);
router.use(
  '/materials',
  crudRouter(crudController(materials, { files: { file: { folder: 'materials', ext: DOC_EXT } } }), { write: content }),
);
router.use(
  '/tasks',
  crudRouter(crudController(tasks, { files: { file: { folder: 'tasks', ext: DOC_EXT } } }), { write: content }),
);
router.use('/exams', crudRouter(crudController(exams), { write: content }));

// To'lovlar, izohlar, natijalar
router.use('/payments', crudRouter(crudController(payments), { read: ['admin'], write: ['admin'] }));
router.use(
  '/comments',
  crudRouter(crudController(comments, { owner: 'user_id' }), { read: ['admin', 'mentor', 'assistant'], write: ['admin'] }),
);
router.use(
  '/results',
  crudRouter(
    crudController(results, {
      owner: 'user_id',
      // o'quvchi faqat o'z natijalarini ko'radi
      scope: (req, query) => {
        if (req.user.role === 'student') query.user_id = req.user.id;
      },
    }),
    { write: ['admin', 'mentor', 'student'] },
  ),
);

// Dashboard
router.get('/stats', authGuard, roles('admin', 'mentor', 'assistant'), stats.getStats);

export default router;
