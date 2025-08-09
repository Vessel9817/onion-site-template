import express from 'express';
import { ChatController, HomeController } from '../controllers';

const APP_ROUTER = express.Router();

// Building home routes
APP_ROUTER.get('/', HomeController.getHome);

// Building chat routes
APP_ROUTER.get('/chat', ChatController.getChat);
APP_ROUTER.post('/chat/send', ChatController.sendMsg);

export default APP_ROUTER;
