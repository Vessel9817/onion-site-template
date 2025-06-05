import mongoose, { type Mongoose } from 'mongoose';
import { MONGODB_URI } from '../env';
import { CollectionManager, type UntrackedSchemaWrapper } from './collections';

/**
 * An adapter to abstract database management operations
 */
export class DbManager {
    private manager?: Mongoose;

    get isConnected(): boolean {
        return this.manager != null;
    }

    /**
     * Asserts that the provided database connection is non-nullish.
     * Equivalent to class-level {@link isConnected} getter property.
     * @param manager The database manager
     */
    private static assertConnected(
        manager?: Mongoose | null
    ): asserts manager is Mongoose {
        if (manager == null) {
            throw new Error('Database is not connected');
        }
    }

    /**
     * Connects to the database
     * @returns {Promise<void>} Resolves when the connection is established
     */
    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            mongoose
                .connect(MONGODB_URI)
                .then((manager) => {
                    manager.connection.once('close', () => {
                        this.manager = undefined;

                        console.log('DB manager disconnected!');
                    });

                    // Disabling automatic pluralization of collection names
                    manager.pluralize(null);
                    console.log('DB manager connected!');

                    resolve();
                })
                .catch(reject);
        });
    }

    /**
     * Disconnects from the database
     * @returns {Promise<void>} Resolves when the connection is closed
     */
    async disconnect(): Promise<void> {
        await this.manager?.disconnect();
    }

    async getCollection<T extends mongoose.mongo.BSON.Document>(
        name: string
    ): Promise<CollectionManager<T> | undefined> {
        DbManager.assertConnected(this.manager);

        const collections = await this.manager.connection.listCollections();
        const collectionNames = collections.map((c) => c.name);

        if (!collectionNames.includes(name)) {
            return undefined;
        }

        const collection =
            this.manager.connection.collection<UntrackedSchemaWrapper<T>>(name);

        return new CollectionManager<T>(collection);
    }
}
