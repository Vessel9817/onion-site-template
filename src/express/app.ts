import cors from 'cors';
import express from 'express';
import { domain } from './env';
import { appRouter, notFoundRouter } from './routes';

const app = express();

app.set('view engine', 'ejs');

// Removing fingerprintable headers
app.disable('x-powered-by');

// Setting global app middleware
app.use(cors({ origin: domain })); // Sets CORS policy
app.use(express.json()); // Parse Content-Type: json
app.use(express.urlencoded({ extended: false })); // Encodes special characters in URLs
app.use('/', appRouter); // Serves app
app.use('/', notFoundRouter); // Catches errors

export default app;
