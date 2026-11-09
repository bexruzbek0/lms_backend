import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import ErrorException from '../utils/ErrorException.js';

// Token tekshiradi: Authorization: Bearer <token>
export default function authGuard(req, res, next) {
  const header = req.headers.authorization || '';
  const [type, token] = header.split(' ');
  if (type !== 'Bearer' || !token) return next(new ErrorException('Avval tizimga kiring (token yo\'q)', 401));
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch {
    next(new ErrorException('Token yaroqsiz yoki muddati tugagan', 401));
  }
}
