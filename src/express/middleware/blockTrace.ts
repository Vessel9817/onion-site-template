import { RequestHandler } from 'express';

/**
 * For security reasons, blocks the TRACE method
 * @param req The request
 * @param res The response
 * @param next The callback function for the next middleware
 */
export const blockTrace: RequestHandler = (req, res, next) => {
    if (req.method.trim().toLowerCase() === 'trace') {
        res.status(405).send('Method Not Allowed');
    }
    next();
};
