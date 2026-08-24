import assert from 'node:assert/strict';
import { type Server } from 'node:http';
import { after, before, describe, it, type TestContext } from 'node:test';
import app from '../app';
import { MsgModel } from '../db/msgBoard';
import { http } from '../utils';
import { stubAggregate } from './support';

let server: Server;
let base: string;

function post(path: string, fields: Record<string, string>) {
    return fetch(base + path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(fields),
        redirect: 'manual'
    });
}

before(async () => {
    await new Promise<void>((resolve) => {
        server = app.listen(0, () => {
            resolve();
        });
    });

    const address = server.address();

    if (address === null || typeof address === 'string') {
        throw new Error('expected a TCP address');
    }

    base = `http://127.0.0.1:${address.port.toString()}`;
});

after(async () => {
    await new Promise<void>((resolve, reject) => {
        server.close((err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
});

void describe('routes', () => {
    void it('serves the home page', async () => {
        const res = await fetch(base + '/');

        assert.equal(res.status, http.codes.OK);
        assert.match(await res.text(), /Home/);
    });

    void it('renders an error page for an unknown path', async () => {
        const res = await fetch(base + '/nonexistent');

        assert.equal(res.status, http.codes.NOT_FOUND);
        assert.match(await res.text(), /Not Found/);
    });

    void it('renders stored messages', async (t: TestContext) => {
        stubAggregate(t, [{ _id: 'id', name: 'ann', content: 'hello', lastModified: 0 }]);

        const res = await fetch(base + '/chat');

        assert.equal(res.status, http.codes.OK);
        assert.match(await res.text(), /hello/);
    });

    void it('passes the requested page through to the query', async (t: TestContext) => {
        const aggregate = stubAggregate(t, []);

        await fetch(base + '/chat?page=5');

        const stages = aggregate.mock.calls[0].arguments[0]!;

        assert.deepEqual(stages.at(1), { $skip: 40 });
    });

    void it('rejects a message with no content', async (t: TestContext) => {
        const insertOne = t.mock.method(MsgModel, 'insertOne',
            () => Promise.resolve() as unknown as ReturnType<typeof MsgModel.insertOne>);

        const res = await post('/chat/send', { name: 'ann', content: '' });

        assert.equal(res.status, http.codes.BAD_REQUEST);
        assert.equal(insertOne.mock.callCount(), 0);
    });

    void it('redirects to the board after accepting a message', async (t: TestContext) => {
        const insertOne = t.mock.method(MsgModel, 'insertOne',
            () => Promise.resolve() as unknown as ReturnType<typeof MsgModel.insertOne>);

        const res = await post('/chat/send', { name: 'ann', content: 'hello' });

        assert.equal(res.status, http.codes.SEE_OTHER);
        assert.equal(res.headers.get('location'), '/chat');
        assert.equal(insertOne.mock.callCount(), 1);
    });

    void it('rejects a delete with a malformed id', async () => {
        const res = await post('/chat/delete', { id: 'not-a-valid-object-id' });

        assert.equal(res.status, http.codes.BAD_REQUEST);
    });

    void it('reports a failed query without leaking the cause', async (t: TestContext) => {
        t.mock.method(MsgModel, 'aggregate', () => ({
            exec: () => Promise.reject(new Error('connection refused'))
        }) as unknown as ReturnType<typeof MsgModel.aggregate>);

        const res = await fetch(base + '/chat');
        const body = await res.text();

        // No connection behind the failure
        assert.equal(res.status, http.codes.SERVICE_UNAVAILABLE);
        assert.doesNotMatch(body, /connection refused/);
        assert.doesNotMatch(body, /stack/);
        assert.doesNotMatch(body, /trace/);
    });

    void it('omits the Server header', async () => {
        const res = await fetch(base);
        const header = res.headers.keys().find((name) => name.toLowerCase() === 'server');

        assert.equal(header, undefined);
    });

    void it('omits the X-Powered-By header', async () => {
        const res = await fetch(base);
        const header = res.headers.keys().find((name) => name.toLowerCase() === 'x-powered-by');

        assert.equal(header, undefined);
    });

    void it('omits the X-Served-By header', async () => {
        const res = await fetch(base);
        const header = res.headers.keys().find((name) => name.toLowerCase() === 'x-served-by');

        assert.equal(header, undefined);
    });

    void it('omits the X-Jsd-* header', async () => {
        const regex = /^x-jsd-/i;
        const res = await fetch(base);
        const header = res.headers.keys().find((name) => regex.test(name));

        assert.equal(header, undefined);
    });

    void it('omits the ETag header', async () => {
        const res = await fetch(base);
        const header = res.headers.keys().find((name) => name.toLowerCase() === 'etag');

        assert.equal(header, undefined);
    });
});
