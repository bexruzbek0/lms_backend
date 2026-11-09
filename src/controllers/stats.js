import asyncHandler from '../utils/asyncHandler.js';
import statsService from '../services/stats.js';

export default {
  getStats: asyncHandler(async (req, res) => {
    res.json({ status: 200, data: await statsService.getStats() });
  }),
};
