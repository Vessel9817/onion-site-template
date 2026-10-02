// NOTE: These types are extremely incomplete and only serve this project's needs
// Global variable type information:
// https://www.mongodb.com/docs/v9.0/reference/method/
declare global {
    const __dirname: string;
    const __filename: string;
    /**
     * @see {@link https://www.mongodb.com/docs/v9.0/reference/method/connect/ Reference}
     */
    const connect: (uri: string) => Db;
    var db: Db;
    const disableTelemetry: () => void;
    const load: (path: string) => void;
    const rs: Rs;
}

export interface Db {
    /**
     * @see {@link https://www.mongodb.com/docs/v9.0/reference/method/db.admincommand/ Reference}
     */
    adminCommand: (command: 'ping') => { ok: number };
    /**
     * @see {@link https://www.mongodb.com/docs/v9.0/reference/method/db.auth/ Reference}
     */
    auth: (username: string, password: string) => { ok: number };
    /**
     * @see {@link https://www.mongodb.com/docs/v9.0/reference/method/db.createcollection/ Reference}
     */
    createCollection: (name: string) => void;
    /**
     * @see {@link https://www.mongodb.com/docs/v9.0/reference/method/db.createuser/ Reference}
     */
    createUser: (options: {
        user: string;
        pwd: string;
        roles?: {
            role: string;
            db: string;
        }[];
    }) => void;
    /**
     * @see {@link https://www.mongodb.com/docs/v9.0/reference/method/db.getsiblingdb/ Reference}
     */
    getSiblingDB: (name: string) => Db;
    /**
     * @see {@link https://www.mongodb.com/docs/v9.0/reference/method/db.getusers/ Reference}
     */
    getUsers: () => { ok: number; users: User[] };
    /**
     * @see {@link https://www.mongodb.com/docs/v9.0/reference/method/db.hello/ Reference}
     */
    hello: () => Hello;
    /**
     * @see {@link https://www.mongodb.com/docs/v9.0/reference/method/db.serverstatus/ Reference}
     */
    serverStatus: (options?: ServerStatusOptions) => ServerStatusOutputs;
}

export interface Hello {
    isWritablePrimary: boolean;
    ok: number;
}

export interface ServerStatusOptions {
    tcmalloc?: number;
}

export interface ServerStatusOutputs {
    ok?: number;
    storageEngine?: {
        name: string;
    };
    connections?: {
        current: number;
        available: number;
    };
    tcmalloc?: {
        usingPerCPUCaches: boolean;
        tcmalloc: {
            cpu_free: number;
        };
    };
}

export interface Rs {
    /**
     * @see {@link https://www.mongodb.com/docs/v9.0/reference/method/rs.initiate/ Reference}
     */
    initiate: (config?: RsInitiateConfig) => void;
    /**
     * @see {@link https://www.mongodb.com/docs/v9.0/reference/method/rs.status/ Reference}
     */
    status: () => { ok: number };
}

export interface RsInitiateConfig {
    _id: string;
    members: {
        _id: number;
        host: string;
        priority?: number;
    }[];
}

export interface User {
    user: string;
}
