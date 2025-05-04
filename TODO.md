# TODOs

- Fix ESLint issues
- Configure Dependabot for Docker
- Configure Docker containers
  - Migrate Onionscan to a container
  - Connect NGINX to Kafka
  - Connect Kafka to express
  - Connect express to MongoDB
  - Remove webserver and webpack config
- Move `/utils/kafka/` to `/config/kafka/`
- Rename config folder to src
- Configure repo security settings and make public
- Update README
  - Add usage instructions for each npm command
  - Add reference to getting an onion hostname and associated keys
  - Add updating section
- Validate environment variables in onionscan.cmd
- Fix onionscan.cmd:
  - `-timeout 1` doesn't prevent hanging after results are output
- Integrate code coverage tool
- Specify React version in eslint-plugin-react
  [settings](https://github.com/jsx-eslint/eslint-plugin-react#configuration)
