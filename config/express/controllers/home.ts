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
            res.status(200).render('pages/home/status', {
                msg: 'Server online!'
            });
        })
        .catch(() => {
            // Service unavailable
            res.status(503).render('pages/home/status', {
                msg: 'Server took too long to respond'
            });
        });
};
