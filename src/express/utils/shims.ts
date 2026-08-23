import { type Response } from 'express';
import { http } from './constants';

/**
 * Clamps `Date.now` to the nearest 100ms
 * @returns The current time
 * @see {@link https://2019.www.torproject.org/projects/torbrowser/design/#:~:text=Timing-based%20Side%20Channels The Design and Implementation of the Tor Browser}
 */
export function dateNow(): number {
    return Math.floor(Date.now() / 100) * 100;
}

/**
 * Sends a temporary redirect without Express's body template
 * @returns The response, which is no longer writable
 */
export function redirect<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ResBody = any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Locals extends Record<string, any> = Record<string, any>
>(
    res: Response<ResBody, Locals>,
    path: string
): Response<ResBody, Locals> {
    return res
        .status(http.codes.SEE_OTHER)
        .location(path)
        .end();
}
