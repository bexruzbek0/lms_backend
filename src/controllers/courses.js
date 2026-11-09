import asyncHandler from '../utils/asyncHandler.js';
import coursesService from '../services/courses.js';
import crudController from './crud.js';
import ErrorException from '../utils/ErrorException.js';
import { IMAGE_EXT, VIDEO_EXT } from '../utils/upload.js';

const base = crudController(coursesService, {
  files: {
    banner: { folder: 'banner', ext: IMAGE_EXT },
    intro_video: { folder: 'introVideo', ext: VIDEO_EXT },
  },
});

export default {
  ...base,

  // PUT /courses/:id/assistant  { "assistant_id": 5 }
  assignAssistant: asyncHandler(async (req, res) => {
    if (!req.body.assistant_id) throw new ErrorException('assistant_id majburiy', 400);
    const data = await coursesService.assignAssistant(req.params.id, req.body.assistant_id);
    res.json({ status: 200, message: 'Assistent biriktirildi', data });
  }),

  // DELETE /courses/:id/assistant
  removeAssistant: asyncHandler(async (req, res) => {
    const data = await coursesService.assignAssistant(req.params.id, null);
    res.json({ status: 200, message: 'Assistent olib tashlandi', data });
  }),
};
