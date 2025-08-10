import express from 'express';
import { ChatController, HomeController } from '../controllers';

const router = express.Router();

// Building home routes
router.get('/', HomeController.getHome);

// Building chat routes
router.get('/chat', ChatController.getChat);
router.post('/chat/send', ChatController.sendMsg);
router.post('/chat/edit', ChatController.editMsg);
router.post('/chat/delete', ChatController.deleteMsg);

export default router;
