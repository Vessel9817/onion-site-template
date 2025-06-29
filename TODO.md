# TODOs

## Main Branch

- Merge `backend` into `main`

## General

- Create Vanguard container for improved tor security
- Configure tests
- Migrate from debian-slim to alpine for reduced image size
- Support Docker swarm mode
- Create kafka_debug container for testing container intercommunication
- Create webpack configurations instead of using ts-node in production
- Move towards becoming OS-agnostic
- Store encrypted mongo passwords rather than plaintext, if and where possible
- Fix tsc package.json command
- Configure tests and container health checks
- Name Kafka broker volumes
- Start versioning package.json files
- Configure ratelimiting
- Configure Docker images to be rebuilt upon container creation
- Fix ESLint issues
- Explicitly add globals to ESLint config
- Configure Dependabot for Docker
- Configure Docker containers
  - Migrate Onionscan to a container
  - Connect NGINX to Express
  - Connect Express to Kafka
  - Connect API to MongoDB
- Rename config folder to src
- Update README:
  - Add usage instructions for each npm command
  - Add reference to getting an onion hostname and associated keys
- Add updating command
- Fix onionscan.cmd:
  - `-timeout 1` doesn't prevent hanging after results are output
  - Validate environment variables
- Integrate code coverage tool
- Specify React version in eslint-plugin-react
  [settings](https://github.com/jsx-eslint/eslint-plugin-react#configuration)
