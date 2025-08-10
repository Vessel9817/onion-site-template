import express from 'express';
import { errorPage } from '../middleware';

const router = express.Router();

router.use('/', errorPage);

export default router;
