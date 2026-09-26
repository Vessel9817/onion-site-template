import { type TestContext } from 'node:test';
import { MsgModel } from '../db/msgBoard';

export const MSG_INDEX = 'fedcba9876543210fedcba9876543210';

export function stubAggregate(t: TestContext, docs: unknown[]) {
    return t.mock.method(MsgModel, 'aggregate', () => ({
        exec: () => Promise.resolve(docs)
    }) as ReturnType<typeof MsgModel.aggregate>);
}
