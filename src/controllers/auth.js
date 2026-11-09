import asyncHandler from '../utils/asyncHandler.js';
import authService from '../services/auth.js';
import { saveFile, IMAGE_EXT } from '../utils/upload.js';

export default {
  login: asyncHandler(async (req, res) => {
    const data = await authService.login(req.body.phone, req.body.password);
    res.json({ status: 200, message: 'Muvaffaqiyatli kirdingiz', data });
  }),

  sendCode: asyncHandler(async (req, res) => {
    const data = authService.sendCode(req.body.phone);
    res.json({ status: 200, message: 'Tasdiqlash kodi yuborildi', data });
  }),

  verifyCode: asyncHandler(async (req, res) => {
    authService.verifyCode(req.body.phone, req.body.code);
    res.json({ status: 200, message: 'Telefon raqam tasdiqlandi' });
  }),

  register: asyncHandler(async (req, res) => {
    const data = await authService.register(req.body);
    res.status(201).json({ status: 201, message: "Muvaffaqiyatli ro'yxatdan o'tdingiz", data });
  }),

  resetPassword: asyncHandler(async (req, res) => {
    await authService.resetPassword(req.body);
    res.json({ status: 200, message: 'Parol muvaffaqiyatli yangilandi' });
  }),

  me: asyncHandler(async (req, res) => {
    res.json({ status: 200, data: await authService.me(req.user.id) });
  }),

  updateMe: asyncHandler(async (req, res) => {
    const body = { ...req.body };
    const avatar = Array.isArray(req.files?.avatar) ? req.files.avatar[0] : req.files?.avatar;
    if (avatar) body.avatar = await saveFile(avatar, 'avatars', IMAGE_EXT);
    res.json({ status: 200, message: "Muvaffaqiyatli o'zgartirildi", data: await authService.updateMe(req.user.id, body) });
  }),

  changePassword: asyncHandler(async (req, res) => {
    await authService.changePassword(req.user.id, req.body);
    res.json({ status: 200, message: "Parol muvaffaqiyatli o'zgartirildi" });
  }),
};
