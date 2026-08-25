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
        stubAggregate(t, []);
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

    void it('rejects a delete with a malformed id', async (t: TestContext) => {
        stubAggregate(t, []);

        const res = await post('/chat/delete', { id: 'not-a-valid-object-id' });

        assert.equal(res.status, http.codes.BAD_REQUEST);
    });

    void it('shows a rejected message on the board with its input kept', async (t: TestContext) => {
        stubAggregate(t, []);

        const res = await post('/chat/send', { name: 'ann', content: '' });
        const body = await res.text();

        assert.equal(res.status, http.codes.BAD_REQUEST);
        assert.match(body, /Please enter a message/);
        assert.match(body, /id="send-content-error"/);
        assert.match(body, /aria-invalid="true" aria-describedby="send-content-error"/);
        assert.match(body, /id="send-name" [^>]*value="ann"/);
    });

    void it('shows a rejected delete on the board', async (t: TestContext) => {
        stubAggregate(t, []);
        t.mock.method(MsgModel, 'findById',
            () => Promise.resolve(null) as unknown as ReturnType<typeof MsgModel.findById>);

        const res = await post('/chat/delete', { id: '0123456789abcdef01234567' });
        const body = await res.text();

        assert.equal(res.status, http.codes.BAD_REQUEST);
        assert.match(body, /<p class="error" role="alert">That message no longer exists<\/p>/);
    });

    void it('rejects a name or message that is only whitespace', async (t: TestContext) => {
        stubAggregate(t, []);
        const insertOne = t.mock.method(MsgModel, 'insertOne',
            () => Promise.resolve() as unknown as ReturnType<typeof MsgModel.insertOne>);

        const blankName = await post('/chat/send', { name: '   ', content: 'hello' });
        const zeroWidthName = await post('/chat/send', { name: '\u200B', content: 'hello' });
        const blankContent = await post('/chat/send', { name: 'ann', content: ' \n\t ' });

        assert.equal(blankName.status, http.codes.BAD_REQUEST);
        assert.equal(zeroWidthName.status, http.codes.BAD_REQUEST);
        assert.equal(blankContent.status, http.codes.BAD_REQUEST);
        assert.match(await blankName.text(), /Please enter your display name/);
        assert.match(await blankContent.text(), /Please enter a message/);
        assert.equal(insertOne.mock.callCount(), 0);
    });

    void it('rejects control and text direction characters', async (t: TestContext) => {
        stubAggregate(t, []);
        const insertOne = t.mock.method(MsgModel, 'insertOne',
            () => Promise.resolve() as unknown as ReturnType<typeof MsgModel.insertOne>);

        const newlineName = await post('/chat/send', { name: 'an\nn', content: 'hello' });
        const bidiName = await post('/chat/send', { name: 'ann\u202E', content: 'hello' });
        const nullContent = await post('/chat/send', { name: 'ann', content: 'hel\u0000lo' });

        assert.equal(newlineName.status, http.codes.BAD_REQUEST);
        assert.equal(bidiName.status, http.codes.BAD_REQUEST);
        assert.equal(nullContent.status, http.codes.BAD_REQUEST);
        assert.match(await bidiName.text(), /text direction/);
        assert.equal(insertOne.mock.callCount(), 0);
    });

    void it('counts a submitted CRLF as the one character the browser counted', async (t: TestContext) => {
        const insertOne = t.mock.method(MsgModel, 'insertOne',
            () => Promise.resolve() as unknown as ReturnType<typeof MsgModel.insertOne>);

        // 1024 lines of "a" joined by CRLF: 2047 characters once normalized, 3070 as sent
        const content = Array<string>(1024).fill('a').join('\r\n');
        const res = await post('/chat/send', { name: 'ann', content });

        assert.equal(res.status, http.codes.SEE_OTHER);
        assert.equal(insertOne.mock.callCount(), 1);
        const stored = insertOne.mock.calls[0]?.arguments[0] as { content: string };
        assert.doesNotMatch(stored.content, /\r/);
        assert.equal(stored.content.length, 2047);
    });

    void it('rejects a field sent more than once', async (t: TestContext) => {
        stubAggregate(t, []);
        const insertOne = t.mock.method(MsgModel, 'insertOne',
            () => Promise.resolve() as unknown as ReturnType<typeof MsgModel.insertOne>);

        const res = await fetch(base + '/chat/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'name=ann&name=bob&content=hello',
            redirect: 'manual'
        });

        assert.equal(res.status, http.codes.BAD_REQUEST);
        assert.match(await res.text(), /Please enter your display name/);
        assert.equal(insertOne.mock.callCount(), 0);
    });

    void it('rejects a message over the limit and says by how much', async (t: TestContext) => {
        stubAggregate(t, []);

        const res = await post('/chat/send', { name: 'ann', content: 'a'.repeat(2049) });

        assert.equal(res.status, http.codes.BAD_REQUEST);
        assert.match(await res.text(), /got 2049/);
    });

    void it('clamps the page number', async (t: TestContext) => {
        const aggregate = stubAggregate(t, []);

        await fetch(base + '/chat?page=1e300');
        await fetch(base + '/chat?page=-5');

        const stages = aggregate.mock.calls[0]?.arguments[0] as { $skip?: number }[];
        const skip = stages.find((stage) => stage.$skip != null)?.$skip;
        assert.ok(skip != null && skip <= 2 ** 31 - 1);
        assert.equal((aggregate.mock.calls[1]?.arguments[0] as unknown[]).length, 2);
    });

    void it('constrains the compose form without scripts', async (t: TestContext) => {
        stubAggregate(t, []);

        const body = await (await fetch(base + '/chat')).text();

        assert.match(body, /name="name" [^>]*required maxlength="32" pattern=/);
        assert.match(body, /name="content" [^>]*required maxlength="2048"/);
        assert.doesNotMatch(body, /<script/);
    });

    void it('marks the current page in the navigation', async () => {
        const body = await (await fetch(base + '/')).text();

        assert.match(body, /<a href="\/" aria-current="page">Home<\/a>/);
        assert.doesNotMatch(body, /<a href="\/chat" aria-current="page">/);
        assert.match(body, /class="skip" href="#main"/);
        assert.match(body, /<main id="main">/);
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

    void it('answers a malformed JSON body with 400, not the database status', async () => {
        const res = await fetch(base + '/chat/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '{not json',
            redirect: 'manual'
        });
        const body = await res.text();

        assert.equal(res.status, http.codes.BAD_REQUEST);
        assert.match(body, /400 Bad Request/);
        assert.doesNotMatch(body, /Unexpected token|JSON|body-parser/);
    });

    void it('answers an oversized body with 413', async () => {
        const res = await post('/chat/send', { name: 'ann', content: 'a'.repeat(150_000) });

        assert.equal(res.status, http.codes.CONTENT_TOO_LARGE);
        assert.match(await res.text(), /413 /);
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
