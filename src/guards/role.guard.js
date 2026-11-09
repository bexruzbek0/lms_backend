import ErrorException from '../utils/ErrorException.js';

// roles('admin', 'mentor') - faqat shu rollarga ruxsat
export default (...allowed) =>
  (req, res, next) => {
    if (!req.user || !allowed.includes(req.user.role)) {
      return next(new ErrorException("Sizda bu amal uchun ruxsat yo'q", 403));
    }
    next();
  };
