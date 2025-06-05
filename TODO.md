# TODOs

## Backend branch

- Merge [kafka](./config/kafka/) and [express](./config/express/)
- Create Kafka Dockerfile to eliminate need for
  `npm run create_topic unauthorized.msg_board_db.v1`
- Rename [api](./config/api) to backend
- Document methods and classes
- Absorb model creation to assert documents match the type
  defined in modelWrapper and schemaWrapper
- Create backend_debug container for testing backend routes
- Refactor MONGODB_URI so that DbManager can take in a collection (name)
  as a constructor argument
- Create proper consumer configuration

## General

- Create kafka_debug container for testing container intercommunication
- Create webpack configurations instead of using ts-node in production
- Move towards becoming OS-agnostic
- Store encrypted mongo passwords rather than plaintext, if and where possible
- Fix tsc package.json command
- Configure tests and container health checks
- Name Kafka broker volumes
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
