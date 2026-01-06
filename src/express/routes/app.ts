import express from 'express';
import { ChatController, HomeController } from '../controllers';
import { Chat } from '../middleware';

const router = express.Router();

// Building home routes
router.get('/', HomeController.getHome);

// Building chat routes
router.get('/chat', ChatController.getChat);
router.post('/chat/send', Chat.sendMsgValidator, ChatController.sendMsg);
router.post('/chat/edit', Chat.editMsgValidator, ChatController.editMsg);
router.post('/chat/delete', Chat.deleteMsgValidator, ChatController.deleteMsg);

export default router;
