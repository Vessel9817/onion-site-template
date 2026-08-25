const assert = require('node:assert/strict');
const { describe, it } = require('node:test');
const { initiator, isInitiator } = require('../src/replicas');

/** @type {import('../global').RsInitiateConfig} */
const config = {
    _id: 'dataset',
    members: [
        { _id: 1, host: 'mongo-1:27017', priority: 2 },
        { _id: 2, host: 'mongo-2:27017', priority: 1 },
        { _id: 3, host: 'mongo-3:27017', priority: 1 }
    ]
};

void describe('replicas', () => {
    void it('names the first member, without its port', () => {
        assert.equal(initiator(config), 'mongo-1');
    });

    void it('recognizes only that member as the initiator', () => {
        assert.equal(isInitiator(config, 'mongo-1'), true);
        assert.equal(isInitiator(config, 'mongo-2'), false);
        assert.equal(isInitiator(config, 'mongo-1:27017'), false);
    });

    void it('refuses a configuration with no members', () => {
        assert.throws(() => initiator({ _id: 'dataset', members: [] }), /no members/);
    });
});
