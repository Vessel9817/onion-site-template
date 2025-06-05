import assert from 'node:assert';

assert.ok(
    process.env.ME_CONFIG_MONGODB_ADMINUSERNAME != null,
    'Root MongoDB username is missing from env'
);
export const ROOT_USERNAME = process.env.ME_CONFIG_MONGODB_ADMINUSERNAME;

assert.ok(
    process.env.ME_CONFIG_MONGODB_ADMINPASSWORD != null,
    'Root MongoDB password is missing from env'
);
export const ROOT_PASSWORD = process.env.ME_CONFIG_MONGODB_ADMINPASSWORD;
