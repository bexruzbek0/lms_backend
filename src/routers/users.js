import { Router } from 'express';
import usersController from '../controllers/users.js';
import crudRouter from './crud.js';
import authGuard from '../guards/auth.guard.js';
import roles from '../guards/role.guard.js';
import { administrators, mentors, assistants, students } from '../services/users.js';

const staffRead = ['admin', 'mentor', 'assistant'];

export const administratorsRouter = crudRouter(usersController(administrators), { read: ['admin'] });
export const assistantsRouter = crudRouter(usersController(assistants), { read: staffRead });
export const studentsRouter = crudRouter(usersController(students), { read: staffRead });

// Mentorlar: oddiy CRUD + mentorning kurslari (GET /mentors/:id/courses)
const mentorsController = usersController(mentors);
export const mentorsRouter = Router();
mentorsRouter.get('/:id/courses', authGuard, roles(...staffRead), mentorsController.getWithCourses);
mentorsRouter.use(crudRouter(mentorsController, { read: staffRead }));
