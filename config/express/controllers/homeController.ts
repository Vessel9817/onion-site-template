import { type RequestHandler } from 'express';

const getHome: RequestHandler = (req, res) => {
    res.render('pages/home/index');
};

export { getHome };
