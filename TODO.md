# TODOs

## Backend branch

- Investigate how Express handles NUL bytes, for security purposes
- Create express validators
- Fix error page
- Fix frontend CSS
- Cache Bootstrap
- Install Bootstrap locally to prevent exit node usage,
  or replace the dependency entirely
- Add TTL to MongoDB documents so that they expire
- Document methods and classes

## General

- Support Docker swarm mode:
  - Create self-signed TLS certificates for inter-container communication security
  - If possible, perform a test run of swarm mode
- Create Vanguards container for improved hidden service security
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
- Add Linux support for `license-report`.
  Better yet, containerize it for cross-platform reproducibility.
