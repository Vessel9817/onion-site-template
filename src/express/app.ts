import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import { domain, msgBoard } from './env';
import { appRouter, notFoundRouter } from './routes';

const app = express();
const port = 3000;

app.set('view engine', 'ejs');

// Removing fingerprintable headers
app.disable('x-powered-by');

// Setting global app middleware
app.use(cors({ origin: `https://${domain}` })); // Sets CORS policy
app.use(express.json()); // Parse Content-Type: json
app.use(express.urlencoded({ extended: false })); // Encodes special characters in URLs
app.use('/', appRouter); // Serves app
app.use('/', notFoundRouter); // Catches errors

// Starting server
try {
    await mongoose.connect(msgBoard.uri);
}
catch (err) {
    console.error('Failed to connect to database:', err);
}

app.listen(port, () => {
    console.log('Server is running!');
});
