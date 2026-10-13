import express, { type Router } from 'express';
import { errorHandler, errorPage } from '../middleware';

// Returns a 404 Not Found page
const router: Router = express.Router();

router.use('/', errorPage, errorHandler);

export default router;
