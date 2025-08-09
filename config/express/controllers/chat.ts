import { Response, type RequestHandler } from 'express';
import { MsgBoard } from '../db';

const PAGE = 1;

export const getChat: RequestHandler = async (req, res) => {
    const msgs = await MsgBoard.getMsgs(PAGE);

    msgs.reverse();

    const formattedEntries = msgs.map((e) => ({
        ...e,
        date: new Date(e.date).toLocaleString('en-US', {
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
    const msg: MsgBoard.PartialMsg = {
        name: params.name,
        content: params.content
    };

    await MsgBoard.createMsg(msg);

    res.redirect('/chat');
};
