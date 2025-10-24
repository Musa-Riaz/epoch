import {Router} from 'express';
import {signup, login, getProfile, getAllUsers, getUserById, getManagerAnalytics} from '../controllers/auth.controller';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware';
import { validateRequest, signupSchema, loginSchema } from '../validators/schemas';

const router = Router();

router.post('/signup', validateRequest(signupSchema), signup);
router.post('/login', validateRequest(loginSchema), login);
router.get('/profile', getProfile);

// Admin routes
router.get('/users', authMiddleware, requireRole(['admin']), getAllUsers);
router.get('/user/:userId', authMiddleware, requireRole(['admin', 'manager']), getUserById);

// Manager routes
router.get('/manager/analytics/:id', authMiddleware, requireRole(['manager']), getManagerAnalytics)

export default router;