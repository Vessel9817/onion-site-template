import mongoose from 'mongoose';
import assert from 'node:assert/strict';
import { describe, it, type TestContext } from 'node:test';
import { mockEnv } from '../support';

void describe('connection', () => {
    void it('leaves reconnection to the driver', async (t: TestContext) => {
        mockEnv({}, t);

        const { msgBoard } = await import('../../env');
        const dial = t.mock.method(mongoose, 'connect', () => Promise.resolve(mongoose));
        const { connect } = await import('../../db/connection');

        await connect(msgBoard.uri);
        // What Mongoose emits on a replica set while there is no primary
        mongoose.connection.emit('disconnected');

        assert.equal(dial.mock.callCount(), 1);
        assert.equal(dial.mock.calls[0].arguments[0], msgBoard.uri);
    });

    void it('closes the connection after a failed attempt, then retries', async (t: TestContext) => {
        mockEnv({}, t);
        t.mock.timers.enable({ apis: ['setTimeout'] });
        t.mock.method(console, 'error', () => undefined);
        t.mock.method(mongoose, 'connect', () => Promise.reject(new Error('refused')));

        const { msgBoard } = await import('../../env');
        const close = t.mock.method(mongoose.connection, 'close', () => Promise.resolve(mongoose.connection));
        const retry = t.mock.method(globalThis, 'setTimeout');
        const { connect } = await import('../../db/connection');

        await connect(msgBoard.uri);

        assert.equal(close.mock.callCount(), 1);
        assert.equal(retry.mock.callCount(), 1);
    });
});
