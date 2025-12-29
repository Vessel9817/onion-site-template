// Global variable type information:
// https://www.mongodb.com/docs/manual/reference/method/
declare global {
    var config: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set: (k: any, v: any) => any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        get: (k: any) => any;
    };
    const connect: (uri: string) => Db;
    const disableTelemetry: () => void;
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

export {};
