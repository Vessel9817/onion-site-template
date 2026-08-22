import express from 'express';
import { connect, reconnectOnDisconnect } from './db/connection';
import { msgBoard } from './env';
import { csp } from './middleware';
import { appRouter, notFoundRouter } from './routes';

const app = express();
const port = 3000;

app.set('view engine', 'ejs');

// Removing fingerprintable headers
app.disable('x-powered-by');
app.disable('etag');

// Setting global app middleware
app.use(express.json()); // Parse Content-Type: json
app.use(express.urlencoded({ extended: false })); // Encodes special characters in URLs
app.use(csp); // Restricts application permissions
app.use('/', appRouter); // Serves app
app.use('/', notFoundRouter); // Catches errors

// Starting server
reconnectOnDisconnect(msgBoard.uri);
void connect(msgBoard.uri);

app.listen(port, () => {
    console.log('Server is running!');
});
