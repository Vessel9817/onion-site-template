import express from 'express';
import { ChatController, HomeController } from '../controllers';

const APP_ROUTER = express.Router();

// Building home routes
APP_ROUTER.get('/', HomeController.getHome);
APP_ROUTER.get('/status', HomeController.getStatus);

// Building chat routes
APP_ROUTER.get('/chat', ChatController.getChat);
APP_ROUTER.post('/chat/send', ChatController.sendMsg);
APP_ROUTER.post('/chat/edit', ChatController.editMsg);
APP_ROUTER.post('/chat/delete', ChatController.deleteMsg);

export default APP_ROUTER;
