# TODOs

- Configure Dependabot for Docker
- Configure Docker containers
  - Migrate from copying files to mounting read-only volumes
  - Connect NGINX to Kafka
  - Connect Kafka to webserver
  - Connect webserver to database
  - Define a webserver entry point for Webpack
- Move `/utils/kafka/` to `/config/kafka/`
- Configure repo security settings
- Update README
  - Add usage instructions for each npm command
  - Add reference to getting an onion hostname and associated keys
  - Add updating section
- Add .dockerignore file
- Validate environment variables in onionscan.cmd
- Fix onionscan.cmd:
  - `-timeout 1` doesn't prevent hanging after results are output
  - Replace with an OS-agnostic solution
- Remove unused npm dependencies
- Integrate code coverage tool
- Move Webpack config to /config
- Use Webpack secrets alias and bundling or remove it
- Specify React version in eslint-plugin-react
  [settings](https://github.com/jsx-eslint/eslint-plugin-react#configuration)
- Explore what each .babelrc preset and plugin does
