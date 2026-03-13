# TODOs

- `mongo-express` image deprecated due to maintainer inactivity:
  fork or find alternative
- If Express cannot complete a DB action, an error should be served to the user
- Fix error page
- Fix frontend CSS
- Replace the Bootstrap dependency with something locally hosted
- Document methods and classes
- Env file safety check ([dotenvx prebuild](https://dotenvx.com/features/prebuild))
- Support Docker swarm mode:
  - Create self-signed TLS certificates for container network security
  - Perform a test run of swarm mode
- Create webpack configurations instead of using ts-node in production
- [Encrypt secrets](https://dotenvx.com/docs/quickstart),
  primarily in the case of plaintext mongo passwords
- Configure tests and container health checks
  - Configure [Onionprobe](https://onionservices.torproject.org/apps/web/onionprobe/standalone/)
- Configure ratelimiting
- Update README:
  - Add usage instructions for each npm command
- Fix onionscan:
  - `-timeout 1` doesn't prevent hanging after results are output
  - Validate environment variables
- Integrate code coverage tool
- Migrate `mongosh` command to a Docker command
