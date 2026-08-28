import { type Request, type RequestHandler, type Response } from 'express';
import { validationResult } from 'express-validator';
import type { WithId } from 'mongodb';
import { Types } from 'mongoose';
import { MsgBoard } from '../db';
import { MSG_PAGE_SIZE } from '../db/msgBoard';
import { http } from '../utils';
import { redirect } from '../utils/shims';

/** The last page whose $skip fits a 32-bit integer */
const MAX_PAGE = Math.floor((2 ** 31 - 1) / MSG_PAGE_SIZE);

/** Validation messages keyed by form field */
type FieldErrors = Partial<Record<'name' | 'content' | 'id', string>>;

/** A rejected submission, echoed back into the form it came from */
interface Rejected {
    errors: FieldErrors;
    /** The message being edited or deleted, if any */
    id?: string;
    name?: string;
    content?: string;
}

/**
 * Reads the 1-indexed page number from the query string
 * @param req The request
 * @returns The page number, defaulting to the first page
 */
function getPage(req: Request): number {
    const params = req.query as { page?: string };
    const rawPage = Number(params.page);

    if (!Number.isFinite(rawPage)) {
        return 1;
    }

    // Keeps the pipeline's $skip within a 32-bit integer
    return Math.min(Math.max(1, Math.trunc(rawPage)), MAX_PAGE);
}

/**
 * Renders the message board
 * @param req The request
 * @param res The response
 * @param rejected A rejected submission to show alongside the board
 */
async function renderBoard(req: Request, res: Response, rejected?: Rejected): Promise<void> {
    const page = getPage(req);
    const msgs = await MsgBoard.getMsgs(page);
    const formattedMsgs = msgs.map((e) => ({
        id: e._id.toString(),
        name: e.name,
        content: e.content,
        lastModified: new Date(e.lastModified).toLocaleString('en-US', {
            dateStyle: 'long',
            timeStyle: 'long',
            timeZone: 'UTC'
        }),
        dateTime: new Date(e.lastModified).toISOString()
    }));
    const args = {
        msgs: formattedMsgs,
        page: page,
        hasOlder: msgs.length === MSG_PAGE_SIZE,
        rejected: rejected ?? { errors: {} }
    };

    res.render('pages/chat', args);
}

/**
 * Collects validation messages by field
 * @param req The request
 * @returns The first message for each failing field
 */
function fieldErrors(req: Request): FieldErrors {
    const errors: FieldErrors = {};

    for (const [field, error] of Object.entries(validationResult(req).mapped())) {
        if (field === 'name' || field === 'content' || field === 'id') {
            errors[field] = String(error.msg);
        }
    }

    return errors;
}

/**
 * Displays the chat home page
 * @param req The request
 * @param res The response
 */
export const getChat: RequestHandler = async (req, res) => {
    await renderBoard(req, res);
};

/**
 * Creates a new message
 * @param req The request
 * @param res The response
 */
export const sendMsg: RequestHandler = async (req, res) => {
    const params = req.body as {
        name: string;
        content: string;
    };

    if (!validationResult(req).isEmpty()) {
        res.status(http.codes.BAD_REQUEST);
        await renderBoard(req, res, {
            errors: fieldErrors(req),
            name: params.name,
            content: params.content
        });
        return;
    }

    const msg: MsgBoard.Msg = {
        name: params.name,
        content: params.content
    };

    await MsgBoard.createMsg(msg);

    redirect(res, '/chat');
};

/**
 * Updates a message
 * @param req The request
 * @param res The response
 */
export const editMsg: RequestHandler = async (req, res) => {
    const params = req.body as {
        name: string;
        content: string;
        id: string;
    };

    if (!validationResult(req).isEmpty()) {
        res.status(http.codes.BAD_REQUEST);
        await renderBoard(req, res, {
            errors: fieldErrors(req),
            id: params.id,
            name: params.name,
            content: params.content
        });
        return;
    }

    const newMsg: WithId<MsgBoard.Msg> = {
        _id: new Types.ObjectId(params.id),
        name: params.name,
        content: params.content
    };

    await MsgBoard.editMsg(newMsg);

    redirect(res, '/chat');
};

/**
 * Deletes a message
 * @param req The request
 * @param res The response
 */
export const deleteMsg: RequestHandler = async (req, res) => {
    const params = req.body as { id: string };

    if (!validationResult(req).isEmpty()) {
        res.status(http.codes.BAD_REQUEST);
        await renderBoard(req, res, {
            errors: fieldErrors(req),
            id: params.id
        });
        return;
    }

    const id = new Types.ObjectId(params.id);

    await MsgBoard.deleteMsg(id);

    redirect(res, '/chat');
};
