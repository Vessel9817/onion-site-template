import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
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
APP.use(blockTrace); // Blocks TRACE requests
APP.use('/', APP_ROUTER); // Serves app
APP.use('/', NOT_FOUND_ROUTER); // Catches errors
APP.use(errorHandler); // Handles errors

// Starting server
void (async () => {
    await mongoose.connect(MONGODB_URI);

    APP.listen(PORT, () => {
        console.log('Server is running!');
    });
})();
