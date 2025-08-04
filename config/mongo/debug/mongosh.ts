import child_process from 'node:child_process';
import { AUTH_DB, CONNECTION_STRING, CONTAINER_NAME } from './env';

function quoteString(s: string, quote: `'` | `"` = `'`): string {
    // https://stackoverflow.com/a/1315213
    return quote + s.replaceAll(/(['"])/g, `${quote}\\$1${quote}`) + quote;
}

const cmd = `mongosh `
    + `--authenticationDatabase ${quoteString(AUTH_DB)} `
    + `-f './src/disableTelemetry.mongodb.js' --shell `
    + CONNECTION_STRING;

// TODO Just replace with a container, this is ridiculous
child_process.execSync(`docker exec -it ${CONTAINER_NAME} ${cmd}`, {
    stdio: 'inherit'
});
