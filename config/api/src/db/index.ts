import mongoose, { Mongoose } from 'mongoose';
import { MONGODB_URI } from '../env.js';

class Database {
    private DB?: Mongoose;

    private static _assertConnected(db?: Mongoose): asserts db is Mongoose {
        if (db == null) {
            throw new Error('Database is not connected');
        }
    }

    private assertConnected(): void {
        Database._assertConnected(this.DB);
    }

    /**
     * Connects to the database.
     * @returns {Promise<void>} A promise that resolves when the connection is established.
     */
    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            mongoose
                .connect(MONGODB_URI)
                .then((db) => {
                    this.DB = db;
                    resolve();
                })
                .catch(reject);
        });
    }

    async disconnect(): Promise<void> {
        await this.DB?.disconnect();
        console.log('Database disconnected!');
    }
}
