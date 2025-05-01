# Website

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

### Kafka

All in separate processes:

- Run Docker
- Run `npm run broker`
- Run `npm run create_topic test-topic`
- Optionally, you may now terminate the broker process

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

All in separate processes:

- Run Docker
- Run `npm run broker`

Then, in no particular order, and as many times as you want:

- Run `npm run consumer`
- Run `npm run producer`

## Secrets

- ./hostname.txt
  - `...`.onion
- ./kafka/.env
  - CLIENT_ID="`...`"
- ./config/tor/secrets

  ```shell
  sudo addgroup debian-tor
  sudo chmod -R 0770 .
  ```

## Licenses

[See more](./licenses)

## Credits

- [onionscan](https://github.com/harr1424/onionscan)
- [boilerplate](https://github.com/Anonymous-Humanoid/chromium-extension-boilerplate)

## Issues and Contribution

See the [TODOs](TODO.md)

- No sample website is yet implemented
  - As a result, `npm run start:webserver` is currently useless
