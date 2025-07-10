import { type RequestHandler } from 'express';
import { getStatusRes } from '../kafka/consumer';
import { v4 as uuid } from 'uuid';
import { Unauthorized } from '../kafka/shared';
import { PRODUCER } from '../kafka/producer';

export const getHome: RequestHandler = (req, res) => {
    res.render('pages/home/index');
};

export const getStatus: RequestHandler = async (req, res) => {
    const ID = uuid();

    await Unauthorized.MsgBoardDb.V1.sendMsgs(PRODUCER, [
        {
            type: 'status',
            id: ID
        }
    ]);
    getStatusRes(ID)
        .then(() => {
            // OK
            res.status(400).send('Server: Online');
        })
        .catch(() => {
            // Service unavailable
            res.status(503).send('Server: Took too long to respond');
        });
};
