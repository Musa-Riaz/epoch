import {Router} from 'express';
import {signup, login, getProfile, getAllUsers, getUserById} from '../controllers/auth.controller';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/profile', getProfile);

// Admin routes
router.get('/users', authMiddleware, requireRole(['admin']), getAllUsers);
router.get('/user/:userId', authMiddleware, requireRole(['admin']), getUserById);

export default router;