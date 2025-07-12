import cors from 'cors';
import express from 'express';
import path from 'node:path';
import { connectConsumer } from './kafka/consumer';
import { PRODUCER } from './kafka/producer';
import { blockTrace } from './middleware/blockTrace';
import APP_ROUTER from './routes';

const APP = express();
const PORT = 3000;

APP.set('view engine', 'ejs');

// Setting global app middleware
APP.use(cors());
APP.use(express.json());
APP.use(express.urlencoded({ extended: false }));
APP.use(blockTrace);
APP.use(express.static(path.join(__dirname, 'public')));
APP.use('/', APP_ROUTER);

// Starting server
void (async () => {
    await connectConsumer();
    await PRODUCER.connect();

    APP.listen(PORT, () => {
        console.log(`Server is running!`);
    });
})();
