import { mock, type MockModuleContext, type TestContext } from 'node:test';
import { MsgModel } from '../db/msgBoard';

export const MSG_INDEX = 'fedcba9876543210fedcba9876543210';

export function stubAggregate(t: TestContext, docs: unknown[]) {
    return t.mock.method(MsgModel, 'aggregate', () => ({
        exec: () => Promise.resolve(docs)
    }) as ReturnType<typeof MsgModel.aggregate>);
}

export function post(
    path: string,
    fields: Record<string, string>
): Promise<Response> {
    return fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(fields),
        redirect: 'manual'
    });
}

export function mockEnv(
    exports?: Partial<typeof import('../env')>,
    t?: TestContext
): MockModuleContext {
    const defaults: typeof import('../env') = {
        msgBoard: {
            uri: 'mongodb://mongo-1:27017/test'
        },
        forceShutdownTimeoutMs: 8000,
        dbRetryIntervalMs: 5000
    };

    return (t ? t.mock : mock).module(
        import.meta.resolve('../env'),
        {
            exports: {
                ...defaults,
                ...exports
            }
        }
    );
}
