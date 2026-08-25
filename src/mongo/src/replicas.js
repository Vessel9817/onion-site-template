/**
 * Which member initiates the replica set
 */

/**
 * @typedef {import('../global').RsInitiateConfig} RsInitiateConfig
 */

/**
 * Returns the hostname of the member that initiates the replica set: the first one listed
 * @param {RsInitiateConfig} config The replica set configuration
 * @returns {string}
 */
function initiator(config) {
    if (config.members.length === 0) {
        throw new Error('Replica set configuration lists no members');
    }

    return config.members[0].host.split(':')[0];
}

/**
 * Whether this host is the member that initiates the replica set
 * @param {RsInitiateConfig} config The replica set configuration
 * @param {string} hostname This host's name
 * @returns {boolean}
 */
function isInitiator(config, hostname) {
    return initiator(config) === hostname;
}

module.exports = {
    initiator: initiator,
    isInitiator: isInitiator
};
