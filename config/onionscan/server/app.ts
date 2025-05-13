import express, { type RequestHandler } from 'express';
import cors from 'cors';
import path from 'node:path';

const PORT = 3000;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const handler: RequestHandler = (req, res) => {
    res.statusMessage = 'Tor is not an HTTP Proxy';
    res.status(501).sendFile(path.join(__dirname, 'html', 'error.html'));
};

app.get('/', handler);

app.listen(PORT, () => {
    console.log(`Server is running!`);
});
