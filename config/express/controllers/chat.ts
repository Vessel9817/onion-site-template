import { RequestHandler } from 'express';
import { ObjectId, WithId } from 'mongodb';
import { MsgBoard } from '../db';
import { errorWrapper } from '../utils';

export const getChat: RequestHandler = errorWrapper(async (req, res) => {
    const params = req.query as { page?: string };
    const rawPage = Number(params.page);
    const page = Number.isFinite(rawPage) ? Math.min(1, rawPage) : 1;
    const msgs = await MsgBoard.getMsgs(page);

    // Newest messages at bottom
    msgs.reverse();

    const formattedMsgs = msgs.map((e) => ({
        id: e._id,
        name: e.name,
        content: e.content,
        lastModified: new Date(e.lastModified).toLocaleString('en-US', {
            dateStyle: 'long',
            timeStyle: 'long',
            timeZone: 'UTC'
        })
    }));
    const args = {
        msgs: formattedMsgs,
        page
    };

    res.render('pages/chat', args);
});

export const sendMsg: RequestHandler = errorWrapper(async (req, res) => {
    const params = req.body as {
        name: string;
        content: string;
    };
    const msg: MsgBoard.Msg = {
        name: params.name,
        content: params.content
    };

    await MsgBoard.createMsg(msg);

    res.redirect('/chat');
});

export const editMsg: RequestHandler = errorWrapper(async (req, res) => {
    const params = req.body as {
        name: string;
        content: string;
        id: string;
    };
    const newMsg: WithId<MsgBoard.Msg> = {
        _id: new ObjectId(params.id),
        name: params.name,
        content: params.content
    };

    await MsgBoard.editMsg(newMsg);

    res.redirect('/chat');
});

export const deleteMsg: RequestHandler = errorWrapper(async (req, res) => {
    const params = req.body as { id: string };
    const id = new ObjectId(params.id);

    await MsgBoard.deleteMsg(id);

    res.redirect('/chat');
});
