// Global variable type information:
// https://www.mongodb.com/docs/manual/reference/method/
declare global {
    // eslint-disable-next-line no-var, @typescript-eslint/no-explicit-any
    var db: any;
    const config: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set: (k: any, v: any) => any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        get: (k: any) => any;
    };
    const disableTelemetry: () => void;
}

export {};
