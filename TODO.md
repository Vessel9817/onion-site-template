# TODOs

## Backend branch

- Rename [api](./config/api) to backend
- Document methods and classes
- Create the sample messages collection
- Absorb model creation to assert documents match the type
  defined in modelWrapper and schemaWrapper

## General

- Move towards becoming OS-agnostic
- Store encrypted mongo passwords rather than plaintext, if and where possible
- Fix tsc package.json command
- Configure tests and container health checks
- Name Kafka broker volumes
- Start versioning package.json files
- Configure ratelimiting
- Configure modified Docker images to be rebuilt upon container creation
- Fix ESLint issues
- Absorb env vars into env files for clarity
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
