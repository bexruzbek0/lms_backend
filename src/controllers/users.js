import asyncHandler from '../utils/asyncHandler.js';
import crudController from './crud.js';
import { IMAGE_EXT } from '../utils/upload.js';

// service - UsersService (administrators, mentors, assistants yoki students)
export default function usersController(service) {
  return {
    ...crudController(service, { files: { avatar: { folder: 'avatars', ext: IMAGE_EXT } } }),

    getWithCourses: asyncHandler(async (req, res) => {
      res.json({ status: 200, data: await service.getWithCourses(req.params.id) });
    }),
  };
}
