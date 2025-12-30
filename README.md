# Onion Site Template

This documentation, as well as the overall project, is currently
under construction, see the Issues and Contribution section below.

This project is currently in beta. Until further notice,
**please use the [`backend`][backend] branch** while we work on a full release.

[backend]: https://github.com/Vessel9817/onion-site-template/tree/backend

## Installation

### Installing Dependencies

- Clone this repository
- Install the node modules by running `npm run install-all`, or the equivalent
  for your particular Node.js package manager (e.g, npm, yarn, pnpm)
- Install Go (tested on the current latest version, 1.21.4)
  - Add Go to the PATH variable
  - Set the GOPATH environment variable
- Install [onionscan](https://github.com/harr1424/onionscan)
  - Run `go install github.com/harr1424/onionscan@latest`
- Install Docker or Docker Desktop

### Configuring Secrets

Remove the `.example` extension from the following files,
renaming them all to `.env`:

- [`./config/mongo/.env.example`](./config/mongo/.env.example)
- [`./config/mongo/debug/.env.example`](./config/mongo/debug/.env.example)

Although this project will work with the example credentials
in each of these files, **for your own security, please change them.**

<!--
### Kafka

All in separate processes:

- Run Docker
- Run `npm run broker`
- Run `npm run create_topic test-topic`
- Optionally, you may now terminate the broker process
-->

### Configuring Tor Secrets

If you have an existing onion domain, the public/private keys and other
secrets can be placed in [`./config/tor/secrets`](./config/tor/secrets).

If you don't have an existing onion domain, run the Tor container.
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

This can be done after starting production mode,
or it can be done to also start production mode.

## Licenses

See [our license](./licenses/Vessel9817.license)
and some of our [upstream licenses](./licenses)
Though we can't include them all, (e.g, node modules) we try to be respectful
of the open-source contributors whose work we've built upon.

## Credits

- [onionscan](https://github.com/harr1424/onionscan)
- [boilerplate](https://github.com/Anonymous-Humanoid/chromium-extension-boilerplate)

## Issues and Contribution

See the [TODOs](TODO.md)

- **Currently, only static website functionality is supported.**
  We're working on it, see below.
- Kafka is currently implemented independently
  and requires further integration to communicate with other components
- Express is currently implemented independently,
  but is fully functional through the debug container
