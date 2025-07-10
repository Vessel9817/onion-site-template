import express from 'express';
import { HomeController } from '../controllers';

const APP_ROUTER = express.Router();

// Building routes
APP_ROUTER.get('/', HomeController.getHome);
APP_ROUTER.get('/status', HomeController.getStatus);

export default APP_ROUTER;
