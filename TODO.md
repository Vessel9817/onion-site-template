# TODOs

## Backend branch

- Investigate how Express handles NUL bytes, for security purposes
- Create express validators
- Integrate database actions into the backend consumer
- Move express node modules into `/usr/app` by moving the
  [source code](./config/express/) into [`src/`](./config/express/src/)
  folder in order to cache the majority of the `chown`-ing done by the
  [Dockerfile](./config/express/Dockerfile)
- Move [`/config/backend/src/db/kafka/`](./config/backend/src/db/kafka/)
  to [`/config/backend/src/kafka/`](./config/backend/src/kafka/)
- Create fallback express error page
- Document methods and classes
- Absorb model creation to assert documents match the type
  defined in modelWrapper and schemaWrapper

## General

- **Do not bake tor secrets into image, this is a security risk!**
- Create Vanguards container for improved hidden service security
- Support Docker swarm mode
- Create kafka_debug container for testing container intercommunication
- Create webpack configurations instead of using ts-node in production
- Move towards becoming OS-agnostic
- Store encrypted mongo passwords rather than plaintext, if and where possible
- Fix tsc package.json command
- Configure tests and container health checks
- Start versioning package.json files
- Configure ratelimiting
- Configure modified Docker images to be rebuilt upon container creation
- Fix ESLint issues
- Configure Dependabot for Docker
- Configure Docker containers
  - Connect NGINX to Express
  - Create debug Kafka container
- Update README:
  - Add usage instructions for each npm command
  - Add reference to getting an onion hostname and associated keys
- Add updating command
- Merge onionscan branch
- Integrate code coverage tool
- Add Linux support for `license-report`.
  Better yet, containerize it for cross-platform reproducibility.
