import { RequestHandler } from 'express';
import { ObjectId, WithId } from 'mongodb';
import { MsgBoard } from '../db';

const PAGE = 1;

export const getChat: RequestHandler = async (req, res) => {
    const msgs = await MsgBoard.getMsgs(PAGE);

    msgs.reverse();

    const formattedEntries = msgs.map((e) => ({
        id: e._id,
        name: e.name,
        content: e.content,
        lastModified: new Date(e.lastModified).toLocaleString('en-US', {
            dateStyle: 'long',
            timeStyle: 'long',
            timeZone: 'UTC'
        })
    }));

    res.render('pages/chat', {
        msgs: formattedEntries
    });
};

export const sendMsg: RequestHandler = async (req, res) => {
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
};

export const editMsg: RequestHandler = async (req, res) => {
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
};

export const deleteMsg: RequestHandler = async (req, res) => {
    const params = req.body as { id: string };
    const id = new ObjectId(params.id);

    await MsgBoard.deleteMsg(id);

    res.redirect('/chat');
};
