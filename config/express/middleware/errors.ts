import { RequestHandler, ErrorRequestHandler } from 'express';

// Same error codes as in nginx config
const KNOWN_ERRORS = new Set<number>([
    // 4XX
    400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414,
    415, 416, 417, 418, 421, 422, 423, 424, 425, 426, 428, 429, 431, 451,
    // 5XX
    500, 501, 502, 503, 504, 505, 506, 507, 508, 510, 511
]);

const ERROR_EXPLANATION = new Map<number, string>([
    [500, 'Server has an outage, likely for maintenance.'],
    [501, 'Under construction.'],
    [502, 'Server has a temporary outage, likely for maintenance.']
]);

/**
 * Displays an internal error page
 * @param err The error
 * @param req The request
 * @param res The response
 * @param next The callback function for the next middleware
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.error('Express handled uncaught error:', err);

    const explanation = (
        !KNOWN_ERRORS.has(res.statusCode)
            ? "We're not sure what happened."
            : ERROR_EXPLANATION.get(res.statusCode) ?? 'Please try again later.'
        )
        + ' If you believe this to be an error, contact the website maintainers.';
    const args = {
        code: res.statusCode,
        msg: res.statusMessage,
        explanation
    };

    res.render('pages/home/error', args);
    next(err);
};

/**
 * Throws a 404 Not Found error
 * @param req The request
 * @param res The response
 * @param next The callback function for the next middleware
 */
export const errorPage: RequestHandler = (req, res, next) => {
    res.status(404);
    next(new Error(`Cannot find page: ${req.url}`));
};
