// NOTE: These types are extremely incomplete and only serve this project's needs

// Global variable type information:
// https://www.mongodb.com/docs/manual/reference/method/
declare global {
    const __dirname: string;
    const __filename: string;
    const connect: (uri: string) => Db;
    var db: Db;
    const disableTelemetry: () => void;
    const load: (path: string) => void;
    const rs: Rs;
}

export interface Db {
    adminCommand: (command: 'ping') => { ok: number };
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
    getUsers: () => { ok: number; users: User[] };
    hello: () => Hello;
    // Simplified rundown of a highly extensible method
    runCommand: (options: RunCommandOptions) => RunCommandOutputs;
}

export interface Hello {
    isWritablePrimary: boolean;
    ok: number;
}

export interface RunCommandOptions {
    serverStatus?: number;
    tcmalloc?: number;
}

export interface RunCommandOutputs {
    ok?: number;
    tcmalloc?: {
        usingPerCPUCaches?: boolean;
        tcmalloc?: {
            cpu_free?: number;
        };
    };
}

export interface Rs {
    initiate: (config?: RsInitiateConfig) => void;
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
