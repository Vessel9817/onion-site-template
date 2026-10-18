import app from './app';
import { connect, createShutdownHandler } from './db/connection';
import { msgBoard } from './env';

// Starting server
const port = 3000;

void connect(msgBoard.uri);

const server = app.listen(port, () => {
    console.log('Server is running!');
});

createShutdownHandler(server);
