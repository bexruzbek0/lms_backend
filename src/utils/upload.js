import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import config from '../config/index.js';
import ErrorException from './ErrorException.js';

export const IMAGE_EXT = ['.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp'];
export const VIDEO_EXT = ['.mp4', '.mov', '.mkv', '.webm'];
export const DOC_EXT = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.ppt', '.pptx', '.zip', '.txt'];

// Faylni uploads/<folder>/ ichiga saqlaydi va brauzer uchun yo'lni qaytaradi
export async function saveFile(file, folder, allowed) {
  const ext = path.extname(file.name).toLowerCase();
  if (allowed && !allowed.includes(ext)) {
    throw new ErrorException(`Fayl turi qo'llab-quvvatlanmaydi: ${ext || file.name}`, 400);
  }
  const name = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`;
  const dir = path.join(config.uploadsDir, folder);
  await fs.mkdir(dir, { recursive: true });
  await file.mv(path.join(dir, name));
  return `/uploads/${folder}/${name}`;
}

export function paging(query) {
  const page = Math.max(parseInt(query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit) || 10, 1), 100);
  return { page, limit, offset: (page - 1) * limit };
}
