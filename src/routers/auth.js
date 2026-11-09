import { Router } from 'express';
import auth from '../controllers/auth.js';
import authGuard from '../guards/auth.guard.js';

const router = Router();

// Ochiq yo'nalishlar
router.post('/login', auth.login);
router.post('/send-code', auth.sendCode);
router.post('/verify-code', auth.verifyCode);
router.post('/register', auth.register);
router.post('/reset-password', auth.resetPassword);

// Tizimga kirganlar uchun (profil sozlamalari)
router.get('/me', authGuard, auth.me);
router.put('/me', authGuard, auth.updateMe);
router.put('/me/password', authGuard, auth.changePassword);

export default router;
