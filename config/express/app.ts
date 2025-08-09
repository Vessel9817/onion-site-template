import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import path from 'node:path';
import { MONGODB_URI } from './env';
import { blockTrace, errorHandler } from './middleware';
import { APP_ROUTER, NOT_FOUND_ROUTER } from './routes';

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

// Setting error handlers
APP.use('/', NOT_FOUND_ROUTER);
APP.use(errorHandler);

// Starting server
void (async () => {
    await mongoose.connect(MONGODB_URI);

    APP.listen(PORT, () => {
        console.log('Server is running!');
    });
})();
