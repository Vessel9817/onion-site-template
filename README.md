# Onion Site Template

## Compatibility

This project is OS-agnostic, except for some of the optional features used,
which are currently Windows-only. We officially support recent versions of
Node and npm (consequently also npx) for up-to-date security releases.
As such, other Node package managers (e.g, yarn, pnpm)
may not be supported. Where possible, package manager commands are replaced
with an equivalent Node CLI command.

## Licenses

This project is licensed under the [MIT](./LICENSE.md) license.

However, to view the licenses of the Node packages we explicitly depend on,
run the following command:

```shell
node --run=license-report
```

## Installation

### Installing Dependencies

- Clone this repository
- Install Docker or Docker Desktop

Optionally, install [onionscan](https://github.com/harr1424/onionscan):

- Install Go (tested on the current latest version, 1.21.4):
  - Add Go to the PATH variable
  - Set the GOPATH environment variable
- Install onionscan:
  - Run `go install github.com/harr1424/onionscan@latest`

### Configuring Secrets

#### General

Rename the following files from `.env.example` to `.env`:

- [./src/mongo/secrets/.env.example](./src/mongo/secrets/.env.example)
- [./src/mongo/debug/secrets/.env.example](./src/mongo/debug/secrets/.env.example)
- [./src/express/secrets/.env.example](./src/express/secrets/.env.example)

Although this project will work with the example credentials
in each of these files, **for your own security, please change them.**

#### tor

If you have an existing onion domain, the public/private keys and other
secrets can be placed in [`./src/tor/secrets/`](./src/tor/secrets).
If you don't, one will automatically be generated for you in the aforementioned
directory. Your website URL will be found in `./src/tor/secrets/hostname`.

## Running

For production mode, run **one** of the following equivalent commands
in the top-level directory:

```shell
npm start
npm run start
npm run start:prod
```

To attach all debugging containers intended for development-only use,
run the following command in the top-level directory:

```shell
npm run start:dev
```

This can be done before or after starting production mode,
as they collectively depend on all production containers unrelated to tor.

To stop the website, run **one** of the following equivalent commands:

```shell
npm stop
npm run stop
```

## Credits

- [onionscan](https://github.com/harr1424/onionscan)
- [boilerplate](https://github.com/Anonymous-Humanoid/chromium-extension-boilerplate),
  modified to lint and prettify this Node project
- Many more projects we explicitly or inadvertently depend on

## Issues and Contribution

See: [CONTRIBUTING](./CONTRIBUTING.md)
