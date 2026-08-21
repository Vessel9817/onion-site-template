import assert from 'node:assert/strict';
import { describe, it, type TestContext } from 'node:test';
import { ObjectId } from 'mongodb';
import { type PipelineStage } from 'mongoose';
import {
    createMsg,
    editMsg,
    getMsgs,
    type HydratedMsg,
    MsgModel
} from '../db/msgBoard';
import { stubAggregate } from './support';

function pipelineOf(call: { arguments: unknown[] }): PipelineStage[] {
    return call.arguments[0] as PipelineStage[];
}

describe('msgBoard', () => {
    it('timestamps new messages to a 100ms boundary', async (t: TestContext) => {
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

    it('excludes the id from the stored document when editing', async (t: TestContext) => {
        const update = t.mock.method(MsgModel, 'findByIdAndUpdate',
            () => Promise.resolve() as unknown as ReturnType<typeof MsgModel.findByIdAndUpdate>);
        const id = new ObjectId();

        await editMsg({ _id: id, name: 'ann', content: 'edited' });

        const [target, doc] = update.mock.calls[0].arguments;

        assert.equal(target, id);
        assert.ok(!('_id' in (doc as object)));
    });

    it('omits the skip stage on the first page', async (t: TestContext) => {
        const aggregate = stubAggregate(t, []);

        await getMsgs(1);

        const stages = pipelineOf(aggregate.mock.calls[0]);

        assert.ok(!stages.some((stage) => '$skip' in stage));
    });

    it('skips whole pages and returns oldest first', async (t: TestContext) => {
        const newest = { lastModified: 2 };
        const oldest = { lastModified: 1 };
        const aggregate = stubAggregate(t, [newest, oldest]);

        const msgs = await getMsgs(3);
        const stages = pipelineOf(aggregate.mock.calls[0]);

        assert.deepEqual(stages.at(1), { $skip: 20 });
        assert.deepEqual(msgs.at(0), oldest);
    });
});
