import asyncHandler from '../utils/asyncHandler.js';
import { saveFile } from '../utils/upload.js';

/**
 * Servis uchun tayyor controller yaratadi.
 *  files  - yuklanadigan fayl maydonlari: { maydon: { folder, ext } }
 *  owner  - qo'shishda shu maydonga tizimga kirgan foydalanuvchi ID'si yoziladi
 *  scope  - ro'yxat so'rovini rolga qarab cheklash (masalan, o'quvchi faqat o'zinikini ko'radi)
 */
export default function crudController(service, { files = {}, owner, scope } = {}) {
  async function collect(req) {
    const body = { ...req.body };
    for (const [field, { folder, ext }] of Object.entries(files)) {
      let file = req.files?.[field];
      if (Array.isArray(file)) file = file[0];
      if (file) body[field] = await saveFile(file, folder, ext);
    }
    return body;
  }

  return {
    getAll: asyncHandler(async (req, res) => {
      const query = { ...req.query };
      scope?.(req, query);
      res.json({ status: 200, ...(await service.getAll(query)) });
    }),

    getOne: asyncHandler(async (req, res) => {
      res.json({ status: 200, data: await service.getOne(req.params.id) });
    }),

    create: asyncHandler(async (req, res) => {
      const body = await collect(req);
      if (owner && body[owner] === undefined) body[owner] = req.user.id;
      const data = await service.create(body);
      res.status(201).json({ status: 201, message: "Muvaffaqiyatli qo'shildi", data });
    }),

    update: asyncHandler(async (req, res) => {
      const data = await service.update(req.params.id, await collect(req));
      res.json({ status: 200, message: "Muvaffaqiyatli o'zgartirildi", data });
    }),

    remove: asyncHandler(async (req, res) => {
      const data = await service.remove(req.params.id);
      res.json({ status: 200, message: "Muvaffaqiyatli o'chirildi", data });
    }),
  };
}
