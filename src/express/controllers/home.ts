import { type RequestHandler } from 'express';

/**
 * Displays the home page
 * @param req The request
 * @param res The response
 */
export const getHome: RequestHandler = (req, res) => {
    res.render('pages/home/index');
};
