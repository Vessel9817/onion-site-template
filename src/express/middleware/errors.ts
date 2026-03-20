import { ErrorRequestHandler, RequestHandler } from 'express';
import { http } from '../utils/constants';

// Same error codes as in nginx config
const KNOWN_ERRORS = Object.keys(http).map(Number).filter((c) => c >= 400 && c <= 599);
const DEFAULT_EXPLANATIONS: Iterable<[number, string]> = KNOWN_ERRORS.keys().map(
    (code) => [code, 'Please try again later.']
);
const ERROR_EXPLANATIONS = new Map<number, string>([
    ...DEFAULT_EXPLANATIONS,
    [http.INTERNAL_SERVER_ERROR, 'Server has an outage, likely for maintenance.'],
    [http.NOT_IMPLEMENTED, 'Under construction.'],
    [http.BAD_GATEWAY, 'Server has a temporary outage, likely for maintenance.']
]);

/**
 * Displays an internal error page
 * @param err The error
 * @param req The request
 * @param res The response
 * @param next The callback function for the next middleware
 */
export const errorHandler: ErrorRequestHandler = (err, req, res) => {
    // Logging stack trace internally, NOT handing over to client
    console.error('Express handled uncaught error:', err);

    const explanation
        = (ERROR_EXPLANATIONS.get(res.statusCode) ?? "We're not sure what happened.")
          + ' If you believe this to be an error, contact the website maintainers.';
    const args = {
        code: res.statusCode,
        msg: res.statusMessage,
        explanation
    };

    res.render('pages/home/error', args);
};

/**
 * Throws a 404 Not Found error
 * @param req The request
 * @param res The response
 * @param next The callback function for the next middleware
 */
export const errorPage: RequestHandler = (req, res, next) => {
    res.status(http.NOT_FOUND);
    next(errorHandler);
};
