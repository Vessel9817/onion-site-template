// NOTE: These types are extremely incomplete and only serve this project's needs

// Global variable type information:
// https://www.mongodb.com/docs/manual/reference/method/
declare global {
    const connect: (uri: string) => Db;
    var db: Db;
    const disableTelemetry: () => void;
    const load: (path: string) => void;
    const rs: Rs;
}

interface Db {
    auth: (username: string, password: string) => void;
    createCollection: (name: string) => void;
    createUser: (options: {
        user: string;
        pwd: string;
        roles?: {
            role: string;
            db: string;
        }[];
    }) => void;
    getSiblingDB: (name: string) => Db;
}

interface Rs {
    initiate: (config?: RsInitiateConfig) => void;
}

interface RsInitiateConfig {
    _id: string;
    members: {
        _id: number;
        host: string;
        priority?: number;
    }[];
}

export { };
