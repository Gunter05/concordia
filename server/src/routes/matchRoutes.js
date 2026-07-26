
import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { likeUser, getMatches, passUser } from '../controllers/matchController.js';
import validateUserId from '../validators/matchValidator.js';

const router = express.Router();

router.post('/like/:targetId', authMiddleware, validateUserId, likeUser);
router.post('/pass/:targetId', authMiddleware, validateUserId, passUser);
router.get('/', authMiddleware, getMatches);

export default router;