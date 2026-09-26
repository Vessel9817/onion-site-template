import { type PipelineStage } from 'mongoose';
import assert from 'node:assert/strict';
import { describe, it, type TestContext } from 'node:test';
import {
    createMsg,
    deleteMsg,
    editMsg,
    getMsgs,
    MsgModel,
    type HydratedMsg,
    type StoredMsg
} from '../db/msgBoard';
import { MSG_INDEX, stubAggregate } from './support';

function pipelineOf(call: { arguments: unknown[] }): PipelineStage[] {
    return call.arguments[0] as PipelineStage[];
}

void describe('msgBoard', () => {
    void it('timestamps new messages to a 100ms boundary', async (t: TestContext) => {
        const insertOne = t.mock.method(MsgModel, 'insertOne',
            () => Promise.resolve() as unknown as ReturnType<typeof MsgModel.insertOne>);
        const earliest = Math.floor(Date.now() / 100) * 100;

        await createMsg({ name: 'ann', content: 'hello' });

        const doc = insertOne.mock.calls[0].arguments[0] as HydratedMsg;

        assert.equal(doc.name, 'ann');
        assert.equal(doc.content, 'hello');
        assert.equal(doc.lastModified % 100, 0);
        assert.ok(doc.lastModified >= earliest);
    });

    void it('gives each new message its own 32 character hex index', async (t: TestContext) => {
        const insertOne = t.mock.method(MsgModel, 'insertOne',
            () => Promise.resolve() as unknown as ReturnType<typeof MsgModel.insertOne>);

        await createMsg({ name: 'ann', content: 'hello' });
        await createMsg({ name: 'ann', content: 'hello' });

        const [first, second] = insertOne.mock.calls.map((call) => call.arguments[0] as StoredMsg);

        assert.match(first.index, /^[0-9a-f]{32}$/);
        assert.match(second.index, /^[0-9a-f]{32}$/);
        assert.notEqual(first.index, second.index);
    });

    void it('edits by index without writing the index back', async (t: TestContext) => {
        const update = t.mock.method(MsgModel, 'findOneAndUpdate',
            () => Promise.resolve(null) as unknown as ReturnType<typeof MsgModel.findOneAndUpdate>);
        const earliest = Math.floor(Date.now() / 100) * 100;

        await editMsg({ index: MSG_INDEX, name: 'ann', content: 'edited' });

        const [filter, doc] = update.mock.calls[0].arguments as [unknown, HydratedMsg];

        assert.deepEqual(filter, { index: { $eq: MSG_INDEX } });
        assert.ok(!('index' in doc));
        assert.equal(doc.content, 'edited');
        assert.ok(doc.lastModified >= earliest);
    });

    void it('deletes by index', async (t: TestContext) => {
        const deleteOne = t.mock.method(MsgModel, 'deleteOne', () => ({
            exec: () => Promise.resolve({ acknowledged: true, deletedCount: 1 })
        }) as unknown as ReturnType<typeof MsgModel.deleteOne>);

        await deleteMsg(MSG_INDEX);

        assert.deepEqual(deleteOne.mock.calls[0].arguments[0], { index: { $eq: MSG_INDEX } });
    });

    void it('omits the skip stage on the first page', async (t: TestContext) => {
        const aggregate = stubAggregate(t, []);

        await getMsgs(1);

        const stages = pipelineOf(aggregate.mock.calls[0]);

        assert.ok(!stages.some((stage) => '$skip' in stage));
    });

    void it('skips whole pages and returns oldest first', async (t: TestContext) => {
        const newest = { lastModified: 2 };
        const oldest = { lastModified: 1 };
        const aggregate = stubAggregate(t, [newest, oldest]);

        const msgs = await getMsgs(3);
        const stages = pipelineOf(aggregate.mock.calls[0]);

        assert.deepEqual(stages.at(1), { $skip: 20 });
        assert.deepEqual(msgs.at(0), oldest);
    });

    void it('leaves the ObjectId out of the query result', async (t: TestContext) => {
        const aggregate = stubAggregate(t, []);

        await getMsgs(1);

        const stages = pipelineOf(aggregate.mock.calls[0]);

        assert.deepEqual(stages.at(-1), { $project: { _id: 0 } });
    });
});
