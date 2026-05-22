# Onion Site Template

[![CI][ci-badge]][ci-workflow]

## Compatibility

This project is OS-agnostic, being fully containerized.
We officially support recent versions of Node and npm
(consequently also npx) for up-to-date security releases.
As such, other Node package managers (e.g, yarn, pnpm)
may not be supported. Where possible, package manager commands are replaced
in the *source code* with an equivalent Node CLI command.
(I.e, `npm run ABC` is equivalent to `node --run=ABC`)
For ease of use, *documentation* still uses npm.

## Licensing

This project is licensed under the [MIT](./LICENSE.md) license.

However, to view the licenses of the Node packages we explicitly depend on,
run the following command:

```shell
npm run license-report
```

This does not include the licenses of submodules, Docker dependencies,
or others. If you intend to use this project in a corporate environment,
please consult a lawyer to investigate terms that would satisfy
the licensing of this repository's various modules and their dependencies.

## Installation

### Installing Dependencies

- Clone this repository
- Install Docker Desktop

### Configuring Secrets

#### General

Rename the following files to remove the `.example` postfix:

- [src/mongo/secrets/.env.example](./src/mongo/secrets/.env.example)
- [src/mongo/secrets/root/username.txt.example](./src/mongo/secrets/root/username.txt.example)
- [src/mongo/secrets/root/password.txt.example](./src/mongo/secrets/root/password.txt.example)
- [src/mongo/secrets/express/username.txt.example](./src/mongo/secrets/express/username.txt.example)
- [src/mongo/secrets/express/password.txt.example](./src/mongo/secrets/express/password.txt.example)
- [src/express/secrets/.env.example](./src/express/secrets/.env.example)
- [src/onionscan/.env.example](./src/onionscan/.env.example)
- [src/onionprobe/config.yml.example](./src/onionprobe/config.yml.example)

The same goes with these files, except that these values should be memorable:

- [src/mongo/secrets/dev/username.txt.example](./src/mongo/secrets/dev/username.txt.example)
- [src/mongo/secrets/dev/password.txt.example](./src/mongo/secrets/dev/password.txt.example)
- [src/grafana/secrets/username.txt.example](./src/grafana/secrets/username.txt.example)
- [src/grafana/secrets/password.txt.example](./src/grafana/secrets/password.txt.example)
- [src/grafana/secrets/email.txt.example](./src/grafana/secrets/email.txt.example)

Although this project will work with the example credentials
in each of these files, **for your own security, please change them.**

#### tor

If you don't have an onion domain, run the following in the project directory
to generate one:

```shell
docker compose -f ./src/tor/docker-compose.yml up -d
docker compose -f ./src/tor/docker-compose.yml down
```

If you do have an existing onion domain, such as through [OnionMine][onionmine],
the public/private keys and other secrets can be placed in
[`src/tor/secrets/`](./src/tor/secrets).
If you don't, one will automatically be generated for you in the aforementioned
directory. Your website domain will be found in `src/tor/secrets/hostname`,
abiding by the following regex: (Onion v3 address)

`[a-z0-9]{56}\.onion`

This domain should also be specified in
`src/onionscan/.env`, `src/express/.env` and `src/onionprobe/config.yml`
where the placeholder onion address is present.

## Running

### Production

For production mode, run **one** of the following equivalent commands
in the project directory:

```shell
npm start
npm run start
npm run start:prod
```

### Development

To attach all debugging containers intended for development-only use,
run the following command in the project directory:

```shell
npm run start:dev
```

This can be done before or after starting production mode,
as they collectively depend on all production containers unrelated to tor.

### Shutdown

To stop the website, run **one** of the following equivalent commands
in the project directory:

```shell
npm stop
npm run stop
```

### Updating

To update the website, run the following command in the project directory:

```shell
# Pull base images and build compose project
npm run build -- --pull
```

Then, stop and start the website.

In general, you should be able to omit the shutdown procedure,
but some services may not function correctly.
For instance, `express` currently requires a restart if `mongo` restarts.

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
[the many edge cases of JavaScript][wtfjs] that make the language infamous
for being initially built on hasty designs.

Usage:

```shell
# Displays linting issues
npm run eslint

# Fixes linting issues, displaying any requiring manual fixing
npm run eslint:fix
```

## Credits

- [OnionProbe][onionprobe]
- [OnionScan][onionscan]
- [Anonymous-Humanoid/chromium-extension-boilerplate][boilerplate],
  modified to lint and prettify this Node project
- Many more projects we explicitly or inadvertently depend on

## Issues and Contribution

1. See the [Contributing guidelines](./CONTRIBUTING.md).
1. Regarding the [compatibility](#compatibility) section, pull requests for adding
    support for other Node package ecosystems are welcome if you include
    maintenance steps. (E.g, if we have to synchronize multiple version lock files,
    we want to know.) It would be greatly appreciated if a minimal
    [CI workflow](./.github/workflows) were included for verification.
1. Git hooks are located in [.githooks](./.githooks).
    This means your Git config should be set as follows:

    ```shell
    git config core.hooksPath .githooks
    ```

[ci-workflow]: https://github.com/Vessel9817/onion-site-template/actions/workflows/ci.yml
[ci-badge]: https://github.com/Vessel9817/onion-site-template/actions/workflows/ci.yml/badge.svg
[onionmine]: https://onionservices.torproject.org/apps/base/onionmine/
[wtfjs]: https://github.com/denysdovhan/wtfjs
[onionprobe]: https://gitlab.torproject.org/tpo/onion-services/onionprobe
[onionscan]: https://github.com/harr1424/onionscan
[boilerplate]: https://github.com/Anonymous-Humanoid/chromium-extension-boilerplate
