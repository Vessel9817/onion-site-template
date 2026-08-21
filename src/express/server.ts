import mongoose from 'mongoose';
import app from './app';
import { msgBoard } from './env';

const port = 3000;

try {
    await mongoose.connect(msgBoard.uri);
}
catch (err) {
    console.error('Failed to connect to database:', err);
}

app.listen(port, () => {
    console.log('Server is running!');
});
