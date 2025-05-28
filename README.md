# Onion Site Template

This documentation, as well as the overall project, is currently
under construction, see the Issues and Contribution section below.

## Compatibility

This project officially supports the latest stable versions of Node and npm
for up-to-date security releases. Other Node package managers (e.g, yarn, pnpm)
may not be supported.

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
- [`api`](./config/api/.env.example)

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
as it depends on all production containers except for tor.

<!--
### Kafka

All in separate processes:

- Run Docker
- Run `npm run broker`
- Run `npm run create_topic test-topic`
- Optionally, you may now terminate the broker process
-->

## Licenses

See [our license](./licenses/Vessel9817.license)
and some of our [upstream licenses](./licenses)
Though we can't include them all, (e.g, node modules) we try to be respectful
of the open-source contributors whose work we've built upon.

## Credits

- [onionscan](https://github.com/harr1424/onionscan)
- [boilerplate](https://github.com/Anonymous-Humanoid/chromium-extension-boilerplate),
  modified to lint and prettify this Node project
- Many more projects we explicitly or inadvertently depend on

## Issues and Contribution

See the [TODOs](TODO.md)

- **Currently, only static website functionality is supported.**
  We're working on it, see below.
- Kafka is currently implemented independently
  and requires further integration to communicate with other components
- Express is currently implemented independently,
  but is fully functional through the debug container
