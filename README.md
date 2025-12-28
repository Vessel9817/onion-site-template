# Onion Site Template

Note: this project- which includes this documentation- is currently in beta.
See the Issues and Contribution section below.

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
run the following command: (currently only supported on Windows)

```shell
npm run license-report
```

## Installation

### Installing Dependencies

- Clone this repository
- Install the node modules by running `npm install` in the top-level
  project directory
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

- [./config/mongo/secrets/.env.example](./config/mongo/secrets/.env.example)
- [./config/mongo/debug/secrets/.env.example](./config/mongo/debug/secrets/.env.example)
- [./config/express/secrets/.env.example](./config/express/secrets/.env.example)

Although this project will work with the example credentials
in each of these files, **for your own security, please change them.**

#### tor

If you have an existing onion domain, the public/private keys and other
secrets can be placed in [`./config/tor/secrets/`](./config/tor/secrets).
If you don't, one will automatically be generated for you in the aforementioned
directory. Your website URL will be found in `./config/tor/secrets/hostname`.

## Running

For production mode, run one of the following equivalent commands
in the top-level directory:

```sh
npm start
npm run start
npm run start:prod
```

To attach all debugging containers intended for development-only use,
run the following command in the top-level directory:

```sh
npm run start:dev
```

This can be done before or after starting production mode,
as they collectively depend on all production containers unrelated to tor.

## Credits

- [onionscan](https://github.com/harr1424/onionscan)
- [boilerplate](https://github.com/Anonymous-Humanoid/chromium-extension-boilerplate),
  modified to lint and prettify this Node project
- Many more projects we explicitly or inadvertently depend on

## Issues and Contribution

See: [CONTRIBUTING](./CONTRIBUTING.md)
