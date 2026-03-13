import { RequestHandler } from 'express';
import { errorWrapper } from '../utils';

export const getHome: RequestHandler = errorWrapper((req, res) => {
    res.render('pages/home/index');
});
