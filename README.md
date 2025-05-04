# Onion Site Template

This documentation, as well as the overall project, is currently
under construction, see the Issues and Contribution section below.

## Installation

- Clone this repository
- Install Go (tested on the current latest version, 1.21.4)
  - Add Go to the PATH variable
  - Set the GOPATH environment variable
- Install [onionscan](https://github.com/harr1424/onionscan)
  - Run `go install github.com/harr1424/onionscan@latest`
- Install Docker or Docker Desktop
- Configure the secrets as shown below

## Initial Run

<!-- ### Kafka

All in separate processes:

- Run Docker
- Run `npm run broker`
- Run `npm run create_topic test-topic`
- Optionally, you may now terminate the broker process -->

### Tor

If you have an existing onion domain, the public/private keys and other
secrets can be placed in `./config/tor/secrets`.

If you don't have an existing onion domain, run the Tor container.
This will generate a domain name and related secrets in the container
at `/var/lib/tor/website/`. To reuse this domain, as per the above steps,
save and copy them to the host filesystem at `./config/tor/secrets`.

This process would be done automatically with a bind mount if the permissions
allowed such.

<!-- If the host filesystem had the necessary permissions set, could it be done? -->

## Further runs

<!-- All in separate processes:

- Run Docker
- Run `npm run broker`

Then, in no particular order, and as many times as you want:

- Run `npm run consumer`
- Run `npm run producer` -->

For development mode, run:

```sh
npm run start:dev
```

For production mode, run one of the following equivalent commands:

```sh
npm run start
npm run start:prod
```

## Secrets

- ./kafka/.env
  - CLIENT_ID="`...`"
- ./config/express/.env
  - PORT="`...`"
- ./config/tor/secrets/

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
