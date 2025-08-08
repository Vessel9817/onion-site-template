import express from 'express';
import { errorPage } from '../middleware';

const ERROR_ROUTER = express.Router();

ERROR_ROUTER.use('/', errorPage);

export default ERROR_ROUTER;
