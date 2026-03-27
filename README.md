# Onion Site Template

[![CI](https://github.com/Vessel9817/onion-site-template/actions/workflows/ci.yml/badge.svg)](https://github.com/Vessel9817/onion-site-template/actions/workflows/ci.yml)

## Compatibility

This project is OS-agnostic, being fully containerized.
We officially support recent versions of Node and npm
(consequently also npx) for up-to-date security releases.
As such, other Node package managers (e.g, yarn, pnpm)
may not be supported. Where possible, package manager commands are replaced
in the *source code* with an equivalent Node CLI command.
(I.e, `npm run ABC` is equivalent to `node --run=ABC`)
For ease of use, *documentation* still uses npm.

## Licenses

This project is licensed under the [MIT](./LICENSE.md) license.

However, to view the licenses of the Node packages we explicitly depend on,
run the following command:

```shell
npm run license-report
```

## Installation

### Installing Dependencies

- Clone this repository
- Install Docker Desktop

### Configuring Secrets

#### General

Rename the following files to remove the `.example` postfix:

- [./src/mongo/secrets/.env.example](./src/mongo/secrets/.env.example)
- [./src/mongo/secrets/root/username.txt.example](./src/mongo/secrets/root/username.txt.example)
- [./src/mongo/secrets/root/password.txt.example](./src/mongo/secrets/root/password.txt.example)
- [./src/mongo/secrets/express/username.txt.example](./src/mongo/secrets/express/username.txt.example)
- [./src/express/secrets/express/password.txt.example](./src/express/secrets/express/password.txt.example)
- [./src/onionscan/.env.example](./src/onionscan/.env.example)

The same goes with these files, except that these values should be memorable:

- [./src/express/secrets/dev/username.txt.example](./src/express/secrets/dev/username.txt.example)
- [./src/express/secrets/dev/password.txt.example](./src/express/secrets/dev/password.txt.example)

Although this project will work with the example credentials
in each of these files, **for your own security, please change them.**

#### tor

If you have an existing onion domain, the public/private keys and other
secrets can be placed in [`./src/tor/secrets/`](./src/tor/secrets).
If you don't, one will automatically be generated for you in the aforementioned
directory. Your website domain will be found in `./src/tor/secrets/hostname`,
following the following format: (Onion v3 address)

`abcdefghabcdefghabcdefghabcdefghabcdefghabcdefghabcdefgh.onion`

This domain should also be specified in
[./src/onionscan/.env](./src/onionscan/.env)

## Running

### Production

For production mode, run **one** of the following equivalent commands
in the top-level directory:

```shell
npm start
npm run start
npm run start:prod
```

### Development

To attach all debugging containers intended for development-only use,
run the following command in the top-level directory:

```shell
npm run start:dev
```

This can be done before or after starting production mode,
as they collectively depend on all production containers unrelated to tor.

### Shutdown

To stop the website, run **one** of the following equivalent commands
in the top-level directory:

```shell
npm stop
npm run stop
```

### Updating

To update the website, run the following command in the top-level directory:

```shell
npm run build
```

Then, stop and start the website.

In general, you should be able to omit the shutdown procedure,
but some services may not function correctly.
For instance, `vanguards` currently requires a restart if `tor` restarts,
as does `express` if `mongo` restarts.

## Maintenance

### OnionScan

Performs a comprehensive scan of the website, identifying fingerprints
and computing correlation vectors accordingly. It can also be used to find
misconfigurations, as it checks for ports that may not meant to be publicly
exposed.

Usage:

```shell
# Start the website and expose it to the tor network
npm run onionscan

# Stop only onionscan
docker compose down onionscan

# Stop onionscan and the website
npm stop
```

### ESLint

A code linter. Used to prettify code, ensuring teams conform to the same
stylistic standards. Also used to address potential errors, such as
[the many edge cases of JavaScript](https://github.com/denysdovhan/wtfjs)
that make the language infamous for being poorly designed.

Usage:

```shell
# Displays linting issues
npm run eslint

# Fixes linting issues, displaying any requiring manual fixing
npm run eslint:fix
```

## Credits

- [OnionScan](https://github.com/harr1424/onionscan)
- [boilerplate](https://github.com/Anonymous-Humanoid/chromium-extension-boilerplate),
  modified to lint and prettify this Node project
- Many more projects we explicitly or inadvertently depend on

## Issues and Contribution

See: [CONTRIBUTING](./CONTRIBUTING.md)

Regarding the [compatibility](#compatibility) section, pull requests for adding
support for other Node package ecosystems are welcome if you include
maintenance steps. (E.g, if we have to synchronize multiple version lock files,
we want to know.) It would be greatly appreciated if a minimal
[CI workflow](./.github/workflows) were included for verification.
