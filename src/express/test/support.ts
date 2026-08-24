import { type TestContext } from 'node:test';
import { MsgModel } from '../db/msgBoard';

export function stubAggregate(t: TestContext, docs: unknown[]) {
    return t.mock.method(MsgModel, 'aggregate', () => ({
        exec: () => Promise.resolve(docs)
    }) as ReturnType<typeof MsgModel.aggregate>);
}
