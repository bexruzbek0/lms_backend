import fs from 'node:fs';
import config from '../config/index.js';
import ErrorException from '../utils/ErrorException.js';

// Xatolar src/log/logger.txt fayliga yoziladi
function writeLog(req, status, message) {
  const line = `${new Date().toISOString()} ${req.method} ${req.originalUrl} [${status}] ${message}\n`;
  fs.appendFile(config.logFile, line, () => {});
}

const PG_ERRORS = {
  '23505': [409, 'Bunday ma\'lumot allaqachon mavjud (takrorlanmas maydon)'],
  '23503': [400, "Bog'langan ma'lumot topilmadi yoki o'chirib bo'lmaydi"],
  '23502': [400, 'Majburiy maydon bo\'sh qoldi'],
  '22P02': [400, "Maydon qiymati noto'g'ri formatda"],
  '23514': [400, "Maydon qiymati ruxsat etilgan qiymatlardan tashqarida"],
};

export function notFound(req, res, next) {
  next(new ErrorException(`Manzil topilmadi: ${req.method} ${req.originalUrl}`, 404));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let status = 500;
  let message = 'Serverda xatolik yuz berdi';

  if (err instanceof ErrorException) {
    status = err.status;
    message = err.message;
  } else if (err.code && PG_ERRORS[err.code]) {
    [status, message] = PG_ERRORS[err.code];
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = "JSON noto'g'ri formatda";
  }

  writeLog(req, status, status === 500 ? err.stack || err.message : message);
  if (status === 500) console.error(err);

  res.status(status).json({ status, message });
}
