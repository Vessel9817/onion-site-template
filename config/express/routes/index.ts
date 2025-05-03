import express from 'express';
import { HomeController } from '../controllers';

const appRouter = express.Router();

// Building routes
appRouter.get('/', HomeController.getHome);

export default appRouter;
