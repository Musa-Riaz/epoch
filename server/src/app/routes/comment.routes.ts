import { Router } from 'express';
import { addComment, getCommentsByTask, updateComment, deleteComment } from '../controllers/comment.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', authMiddleware, addComment);
router.get('/:taskId', authMiddleware, getCommentsByTask);
router.patch('/:id', authMiddleware, updateComment);
router.delete('/:id', authMiddleware, deleteComment);

export default router;
