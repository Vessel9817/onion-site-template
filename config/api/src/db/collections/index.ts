import mongoose, {
    model,
    Schema,
    Types,
    type CompileModelOptions,
    type SchemaDefinition,
    type SchemaOptions
} from 'mongoose';

type Document = mongoose.mongo.BSON.Document;
type WithId<T> = T & { id: string };

export interface UntrackedSchemaWrapper<T extends Document> {
    data: T;
}

interface TrackingSchemaWrapper<T extends Document>
    extends UntrackedSchemaWrapper<T> {
    _id: Types.ObjectId;
}

export type SchemaAdapter<T extends Document> = WithId<
    UntrackedSchemaWrapper<T>
>;

export interface Collection<
    TUntracked extends Document,
    UTracked extends Document
> {
    name: string;

    // CRUD operations
    create: (...data: TUntracked[]) => PromiseLike<UTracked[]>;
    filter: (
        query: Partial<TUntracked>,
        limit: number,
        id?: string
    ) => PromiseLike<UTracked[]>;
    update: (...data: UTracked[]) => PromiseLike<void>;
    remove: (...data: UTracked[]) => PromiseLike<void>;
}

export class CollectionManager<T extends Document>
    implements Collection<T, SchemaAdapter<T>>
{
    private readonly collection: mongoose.Collection<UntrackedSchemaWrapper<T>>;

    constructor(collection: mongoose.Collection<UntrackedSchemaWrapper<T>>) {
        this.collection = collection;
    }

    get name(): string {
        return this.collection.name;
    }

    protected assignIds(...data: T[]): TrackingSchemaWrapper<T>[] {
        return data.map((datum) => {
            return {
                ...this.documentWrapper(datum),
                _id: new Types.ObjectId()
            };
        });
    }

    protected documentWrapper(
        doc: T,
        id?: string
    ): UntrackedSchemaWrapper<T> | SchemaAdapter<T>;
    protected documentWrapper(
        doc: Partial<T>,
        id?: string
    ): UntrackedSchemaWrapper<Partial<T>> | SchemaAdapter<Partial<T>>;
    protected documentWrapper(
        doc: T | Partial<T>,
        id?: string
    ): UntrackedSchemaWrapper<T | Partial<T>> | SchemaAdapter<T | Partial<T>> {
        return {
            data: doc,
            id
        };
    }

    protected static schemaWrapper(schema: SchemaDefinition): Schema {
        const schemaWrapper: SchemaDefinition = {
            _id: Types.ObjectId,
            id: String,
            data: schema,
            __v: Number
        };
        const schemaOptions: SchemaOptions = {
            typeKey: 'type',
            id: true,
            _id: true,
            timestamps: false,
            versionKey: '__v'
        };

        return new Schema(schemaWrapper, schemaOptions);
    }

    static modelWrapper(
        name: string,
        schema: SchemaDefinition,
        collection?: string,
        options?: CompileModelOptions
    ) {
        const newSchema = CollectionManager.schemaWrapper(schema);
        const newModel = model(name, newSchema, collection, options);

        return newModel;
    }

    async create(...data: T[]): Promise<SchemaAdapter<T>[]> {
        let ids: Record<number, Types.ObjectId>;

        if (data.length < 1) {
            return [];
        }

        const newData = this.assignIds(...data);

        if (newData.length === 1) {
            const output = await this.collection.insertOne(newData[0]);

            ids = { 0: output.insertedId };
        } else {
            const output = await this.collection.insertMany(newData);

            ids = output.insertedIds;
        }

        return Object.entries(ids).map(([index, id]) => {
            return {
                data: newData[Number(index)].data,
                id: id.toHexString()
            };
        });
    }

    async filter(
        query: Partial<T>,
        limit: number,
        id?: string
    ): Promise<SchemaAdapter<T>[]> {
        let results: TrackingSchemaWrapper<T>[];
        const newQuery = this.documentWrapper(query, id);

        if (limit <= 1 || id != null) {
            const result = await this.collection.findOne(newQuery);
            results = result == null ? [] : [result];
        } else {
            results = await this.collection.find(newQuery, { limit }).toArray();
        }

        return results.map((doc) => {
            return {
                data: doc.data,
                id: doc._id.toHexString()
            };
        });
    }

    async update(...data: readonly SchemaAdapter<T>[]): Promise<void> {
        if (data.length === 1) {
            await this.collection.insertOne(data[0]);
        } else if (data.length > 1) {
            await this.collection.insertMany(data);
        }
    }

    async remove(...data: SchemaAdapter<T>[]): Promise<void> {
        if (data.length === 1) {
            await this.collection.deleteOne(data[0]);
        } else if (data.length > 1) {
            await this.collection.deleteMany(data);
        }
    }
}
