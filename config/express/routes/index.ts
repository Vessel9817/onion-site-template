import express from 'express';
import { HomeController } from '../controllers';
import { sendMsgs } from '../kafka/producer';

const appRouter = express.Router();

// Building routes
appRouter.get('/', HomeController.getHome);

// TODO TESTING
appRouter.get('/test-kafka', async (req, res) => {
    await sendMsgs([
        {
            type: 'create',
            name: 'name',
            content: 'content',
            date: Date.now()
        }
    ]);
    res.send('Kafka message sent!');
});

export default appRouter;
