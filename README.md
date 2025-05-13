# Onion Site Template

This documentation, as well as the overall project, is currently
under construction, see the Issues and Contribution section below.

## Installation

### Installing Dependencies

- Clone this repository
- Install the node modules by running `npm run install-all`, or the equivalent
  for your particular Node.js package manager (e.g, npm, yarn, pnpm)
- Install Docker Desktop. If already installed, please use
  the default `desktop-linux` context.

### Configuring Secrets From Template

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

### Configuring tor Secrets

If you have an existing onion domain, the public/private keys and other
secrets can be placed in [`./config/tor/secrets/`](./config/tor/secrets).

If you don't have an existing onion domain, run the tor container.
This will generate a domain name and related secrets in the container
at `/var/lib/tor/website/`. To reuse this domain, as per the above steps,
save and copy them to the host filesystem at
[`./config/tor/secrets/`](./config/tor/secrets).

Side note: This process would be done automatically with a bind mount if the
permissions allowed such, but unfortunately, there isn't an elegant
cross-platform solution to this.

Finally, create a `.env` file in the `./config/onionscan/` directory
with the following text:

```env
HOSTNAME="abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcd.onion"
```

Where the above onion address represents the one you just generated,
which can be found in the text file `./config/tor/secrets/hostname`.

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
