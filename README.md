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
run the following command: (currently only supports Windows and npx)

```shell
npm run license-report
```

## Installation

### Installing Dependencies

- Clone this repository
- Install the node modules by running `npm install` in the top-level
  project directory
- Install Docker or Docker Desktop

Optionally, install onionscan:

- Install Go (tested on the current latest version, 1.21.4)
  - Add Go to the PATH variable
  - Set the GOPATH environment variable
- Install [onionscan](https://github.com/harr1424/onionscan)
  - Run `go install github.com/harr1424/onionscan@latest`

### Configuring Secrets

#### General

Remove the `.example` extension from the following files,
renaming them all to `.env`:

- [`mongo`](./config/mongo/.env.example)
- [`mongo_debug`](./config/mongo/debug/.env.example)
- [`backend`](./config/backend/.env.example)

Although this project will work with the example credentials
in each of these files, **for your own security, please change them.**

#### tor

**If you have an existing onion domain**, the public/private keys and other
secrets can be placed in [`./config/tor/secrets`](./config/tor/secrets).

**If you don't have an existing onion domain**, run the tor container.
This will generate a domain name and related secrets in the container
at `/var/lib/tor/website/`. To reuse this domain, as per the above steps,
save and copy them to the host filesystem at
[`./config/tor/secrets`](./config/tor/secrets).

This process would be done automatically with a bind mount if the permissions
allowed such, but unfortunately, there isn't an elegant cross-platform solution
to this.

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
as they collectively depend on all production containers except tor.

## Credits

- [onionscan](https://github.com/harr1424/onionscan)
- [boilerplate](https://github.com/Anonymous-Humanoid/chromium-extension-boilerplate),
  modified to lint and prettify this Node project
- Many more projects we explicitly or inadvertently depend on

## Issues and Contribution

This project is currently in beta. We welcome issues or pull requests,
but before opening one, we ask that you first see the [TODOs](./TODO.md)
for any currently planned fixes or features.

- **Currently, only static website functionality is supported.**
  Implementing dynamic website functionality is our top priority,
  and would bring this project out of beta.
- Kafka is currently implemented independently
  and requires further integration to communicate
  with Express and the Express backend.
- Express is currently implemented independently,
  but is fully functional through the debug container.
- The Express backend is currently implemented independently,
  <!-- but is integrated with MongoDB. -->
  with partial integration with MongoDB.
