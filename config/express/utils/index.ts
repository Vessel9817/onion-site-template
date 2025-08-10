import { RequestHandler } from 'express';

export function errorWrapper<T extends RequestHandler>(callback: T): ((...args: Parameters<T>) => Promise<void>) {
    return async (req, res, next) => {
        try {
            await callback(req, res, next);
        }
        catch (err) {
            next(err);
        }
    };
}
