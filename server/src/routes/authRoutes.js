
import express from 'express';
import { registerUser, authUser, getCurrentUser } from '../controllers/userController.js';
import { validateRegister, validateLogin } from '../validators/authValidator.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, authUser);
router.get('/me', authMiddleware, getCurrentUser);

export default router;