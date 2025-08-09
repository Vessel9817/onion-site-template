# TODOs

## Backend branch

- Investigate how Express handles NUL bytes, for security purposes
- Create express validators
- Reimplement message editing and deletion
- Create frontend for document paging
- Add TTL to MongoDB documents so that they expire
- Document methods and classes

## General

- Create self-signed TLS certificates for inter-container communication security
- Create Vanguards container for improved hidden service security
- Support Docker swarm mode
- Create webpack configurations instead of using ts-node in production
- Move towards becoming OS-agnostic
- Store encrypted mongo passwords rather than plaintext, if and where possible
- Fix tsc package.json command
- Configure tests and container health checks
- Configure ratelimiting
- Configure modified Docker images to be rebuilt upon container creation
- Fix ESLint issues
- Configure Dependabot for Docker
- Update README:
  - Add usage instructions for each npm command
- Add updating command
- Merge onionscan branch
- Integrate code coverage tool
- Add Linux support for `license-report`.
  Better yet, containerize it for cross-platform reproducibility.
