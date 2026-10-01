import app from './app';
import { connect } from './db/connection';
import { msgBoard } from './env';

const port = 3000;

// Starting server
void connect(msgBoard.uri);

app.listen(port, () => {
    console.log('Server is running!');
});
