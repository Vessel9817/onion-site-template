# TODOs

## Backend branch

- If Express cannot complete a DB action, an error should be served to the user
- Investigate how Express handles NUL bytes, for security purposes
- Fix error page
- Fix frontend CSS
- Replace the Bootstrap dependency with something self-made
- Add TTL to MongoDB documents so that they expire
- Document methods and classes

## General

- Env file safety check ([dotenvx prebuild](https://dotenvx.com/features/prebuild))
- Support Docker swarm mode:
  - Create self-signed TLS certificates for inter-container communication security
  - If possible, perform a test run of swarm mode
- Create webpack configurations instead of using ts-node in production
- Store encrypted mongo passwords rather than plaintext, if and where possible
- Fix tsc package.json command
- Configure tests and container health checks
- Configure ratelimiting
- Fix ESLint issues
- Configure Dependabot for Docker
- Update README:
  - Add usage instructions for each npm command
- Merge onionscan branch
- Integrate code coverage tool
