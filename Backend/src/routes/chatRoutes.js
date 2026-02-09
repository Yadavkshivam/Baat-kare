import express from 'express';
import {
  createChat,
  joinChat,
  getChatById,
  getUserChats,
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All routes are protected

router.post('/create', createChat);
router.post('/join/:link', joinChat);
router.get('/', getUserChats);
router.get('/:chatId', getChatById);

export default router;
