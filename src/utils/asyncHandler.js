// Async funksiyadagi xatoni avtomatik next() ga uzatadi
export default (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
