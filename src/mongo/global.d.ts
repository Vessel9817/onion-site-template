/* eslint-disable @typescript-eslint/no-explicit-any */

// Global variable type information:
// https://www.mongodb.com/docs/manual/reference/method/
declare global {
    var config: {
        set: (k: any, v: any) => any;
        get: (k: any) => any;
    };
    const connect: (uri: string) => Db;
    var db: Db;
    const disableTelemetry: () => void;
    const load: (path: string) => void;
    const print: (...args: any[]) => void;
    const printJson: (...args: any[]) => void;
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
