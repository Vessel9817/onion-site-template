# TODOs

- Configure tests
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
