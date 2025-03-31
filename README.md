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

All in separate processes:

- Run Docker
- Run `npm run broker`
- Run `npm run create_topic test-topic`
- Optionally, you may now terminate the broker process

## Further runs

All in separate processes:

- Run Docker
- Run `npm run broker`

Then, in no particular order, and as many times as you want:

- Run `npm run consumer`
- Run `npm run producer`

## Secrets

- /hostname.txt
  - `...`.onion
- /kafka/.env
  - CLIENT_ID="`...`"

## Licenses

[See more](./licenses)

## Credits

- [onionscan](https://github.com/harr1424/onionscan)
- [boilerplate](https://github.com/Anonymous-Humanoid/chromium-extension-boilerplate)

## Issues and Contribution

See the [TODOs](TODO.md)

- No sample website is yet implemented
  - As a result, `npm run start:webserver` is currently useless
