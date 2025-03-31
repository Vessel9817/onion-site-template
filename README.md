# Website

## Installation

- Clone this repository
- Install Go (tested on the current latest version, 1.21.4)
  - Add Go to the PATH variable
  - Set the GOPATH environment variable
- Install [onionscan](https://github.com/harr1424/onionscan)
  - Run `go install github.com/harr1424/onionscan@latest`
- Install Docker Desktop
- Configure the secrets as shown below

## Secrets

- /hostname.txt
  - `...`.onion
- /kafka/.env
  - CLIENT_ID="`...`"

## Contribution

See the [TODOs](TODO.md)
