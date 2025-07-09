# TODOs

## Backend branch

- Create healthchecks for express and backend containers
  (new broker is causing a race condition on startup)
- Create express validators
- Document methods and classes
- Absorb model creation to assert documents match the type
  defined in modelWrapper and schemaWrapper
- Create backend_debug container for testing backend routes
- Create proper consumer configuration

## General

- **Do not bake tor secrets into image, this is a security risk!**
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
  - Connect Express to Kafka
  - Create debug Kafka container
- Update README:
  - Add usage instructions for each npm command
  - Add reference to getting an onion hostname and associated keys
- Add updating command
- Merge onionscan branch
- Integrate code coverage tool
