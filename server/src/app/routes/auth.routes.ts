import {Router} from 'express';
import {signup, login, getProfile, getAllUsers, getUserById, getManagerAnalytics, updateProfile, forgotPassword, resetPassword, sendLoginOtp, loginWithOtp} from '../controllers/auth.controller';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware';
import { validateRequest, signupSchema, loginSchema } from '../validators/schemas';

const router = Router();

// Standard Auth
router.post('/signup', validateRequest(signupSchema), signup);
router.post('/login', validateRequest(loginSchema), login);

// OTP & Password Reset Auth
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/otp/send', sendLoginOtp);
router.post('/otp/login', loginWithOtp);

// Profiles
router.put('/updateProfile/:userId', authMiddleware, updateProfile);
router.get('/profile', getProfile);

// Admin routes
router.get('/users', authMiddleware, requireRole(['admin']), getAllUsers);
router.get('/user/:userId', authMiddleware, requireRole(['admin', 'manager']), getUserById);

// Manager routes
router.get('/manager/analytics/:id', authMiddleware, requireRole(['manager']), getManagerAnalytics)

export default router;