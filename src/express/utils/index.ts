import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import { http } from './constants';

export function validationWrapper<T extends RequestHandler>(
    callback: T
): (...args: Parameters<T>) => Promise<void> {
    return async (req, res, next) => {
        try {
            if (validationResult(req).isEmpty()) {
                await callback(req, res, next);
            }
            else {
                res.status(http.BAD_REQUEST);
                validationResult(req).throw();
            }
        }
        catch (err) {
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
        }
        catch (err) {
            next(err);
        }
    };
}
