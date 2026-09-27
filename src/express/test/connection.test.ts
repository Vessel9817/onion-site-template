import mongoose from 'mongoose';
import assert from 'node:assert/strict';
import { describe, it, type TestContext } from 'node:test';
import { connect } from '../db/connection';

const URI = 'mongodb://mongo-1:27017/test';

void describe('connection', () => {
    void it('leaves reconnection to the driver', async (t: TestContext) => {
        const dial = t.mock.method(mongoose, 'connect', () => Promise.resolve(mongoose));

        await connect(URI);
        // What Mongoose emits on a replica set while there is no primary
        mongoose.connection.emit('disconnected');

        assert.equal(dial.mock.callCount(), 1);
        assert.equal(dial.mock.calls[0].arguments[0], URI);
    });
});
