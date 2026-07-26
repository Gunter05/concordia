
import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { 
    sendMessage, 
    getConversation, 
    getConversations, 
    getUnreadMessages, 
    blockUser, 
    unblockUser, 
    deleteConversation 
} from '../controllers/chatController.js';
import { validateMessage, validateConversationId } from '../validators/messageValidator.js';

const router = express.Router();

// Routes protégées
router.post('/send', validateMessage, sendMessage);
router.post('/conversation/messages', getConversation);
router.post('/conversations', getConversations);
router.get('/unread', authMiddleware, getUnreadMessages);
router.post('/block/:userId', authMiddleware, validateConversationId, blockUser);
router.post('/unblock/:userId', authMiddleware, validateConversationId, unblockUser);
router.delete('/conversation/:userId', authMiddleware, validateConversationId, deleteConversation);

export default router;