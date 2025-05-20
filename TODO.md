# TODOs

## Backend branch

- Connect backend to MongoDB
- Add mongo user for better IAM between users and devs
- Document [example env](./config/api/.env.example) usage
- Rename [api](./config/api) to backend

## General

- Store encrypted mongo passwords rather than plaintext, if and where possible
- Replace horrible install-all package.json command with workspaces
- Configure tests and container health checks
- Configure ratelimiting
- Configure modified Docker images to be rebuilt upon container creation
- Fix ESLint issues
- Explicitly add globals to ESLint config
- Configure Dependabot for Docker
- Configure Docker containers
  - Connect NGINX to Express
  - Connect Express to Kafka
  - Create debug Kafka container
- Rename config folder to src
- Update README:
  - Add usage instructions for each npm command
  - Add reference to getting an onion hostname and associated keys
- Add updating command
- Merge onionscan branch
- Integrate code coverage tool
- Specify React version in eslint-plugin-react
  [settings](https://github.com/jsx-eslint/eslint-plugin-react#configuration)
