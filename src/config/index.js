import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '..', '..');

export default {
  port: Number(process.env.PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_change_me',
  jwtExpires: process.env.JWT_EXPIRES || '7d',
  isProd: process.env.NODE_ENV === 'production',
  uploadsDir: path.join(ROOT, 'uploads'),
  logFile: path.join(ROOT, 'src', 'log', 'logger.txt'),
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'lms_itlive',
  },
};
