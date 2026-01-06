import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';

const HTTP_BAD_REQUEST = 400;

export function validationWrapper<T extends RequestHandler>(
    callback: T
): (...args: Parameters<T>) => Promise<void> {
    return async (req, res, next) => {
        try {
            if (validationResult(req).isEmpty()) {
                await callback(req, res, next);
            } else {
                res.status(HTTP_BAD_REQUEST);
                validationResult(req).throw();
            }
        } catch (err) {
            next(err);
        }
    };
}

export function errorWrapper<T extends RequestHandler>(
    callback: T
): (...args: Parameters<T>) => Promise<void> {
    return async (req, res, next) => {
        try {
            await callback(req, res, next);
        } catch (err) {
            next(err);
        }
    };
}
