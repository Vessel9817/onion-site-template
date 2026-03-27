// Global variable type information:
// https://www.mongodb.com/docs/manual/reference/method/
declare global {
    const connect: (uri: string) => Db;
    var db: Db;
    const disableTelemetry: () => void;
    const load: (path: string) => void;
}

interface Db {
    auth: (username: string, password: string) => void;
    createCollection: (name: string) => void;
    createUser: {
        user: string;
        pwd: string;
        roles?: {
            role: string;
            db: string;
        }[];
    };
    getSiblingDB: (name: string) => Db;
}

export { };
