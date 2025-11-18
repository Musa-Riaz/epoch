import { Router } from 'express';
import { addComment, getCommentsByTask, updateComment, deleteComment, getCommentAvatar } from '../controllers/comment.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateRequest, commentSchema } from '../validators/schemas';

const router = Router();

router.post('/', authMiddleware, validateRequest(commentSchema), addComment);
router.get('/:taskId', authMiddleware, getCommentsByTask);
router.get('/avatar', authMiddleware, getCommentAvatar);
router.patch('/:id', authMiddleware, updateComment);
router.delete('/:id', authMiddleware, deleteComment);

export default router;
