import cors from 'cors';
import express from 'express';
import path from 'node:path';
import { connectProducer } from './kafka/producer';
import appRouter from './routes';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', appRouter);

void (async () => {
    await connectProducer();

    app.listen(PORT, () => {
        console.log(`Server is running!`);
    });
})();
