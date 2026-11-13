# Onion Site Template

[![MIT license][license-badge]](LICENSE.md)
[![CI][ci-badge]][ci-workflow]
[![CodeQL][codeql-badge]][codeql-workflow]

## Compatibility

This project aims to be OS-agnostic and fully containerized.
We officially support LTS versions of Node for up-to-date security releases.
Where possible, package manager commands are replaced in the source code
with an equivalent Node CLI command.
(E.g, `npm run ABC` is equivalent to `node --run=ABC`)
However, npm is used in some places that use npm-specific functionality.

## Licensing

This project is licensed under the [MIT](./LICENSE.md) license.

However, to view the licenses of the Node packages we explicitly depend on,
run the following command:

```shell
npm run license-report
```

This does not include the licenses of submodules, Docker dependencies,
or others. If you intend to use this project in a corporate environment,
please consult a lawyer to investigate terms that would satisfy
the licensing of this repository's various modules and their dependencies.

## Installation

### Installing Dependencies

- Install Docker Desktop (for experts, just Docker and Docker Compose)
- Clone this repository:

    ```shell
    git clone --recurse-submodules https://github.com/Vessel9817/onion-site-template.git
    ```

### Configuring Secrets

#### General

Rename the following files to remove the `.example` postfix:

- [src/mongo/secrets/.env.example](./src/mongo/secrets/.env.example)
- [src/mongo/secrets/root/username.txt.example](./src/mongo/secrets/root/username.txt.example)
- [src/mongo/secrets/root/password.txt.example](./src/mongo/secrets/root/password.txt.example)
- [src/mongo/secrets/express/username.txt.example](./src/mongo/secrets/express/username.txt.example)
- [src/mongo/secrets/express/password.txt.example](./src/mongo/secrets/express/password.txt.example)
- [src/express/secrets/.env.example](./src/express/secrets/.env.example)
- [src/onionscan/.env.example](./src/onionscan/.env.example)
- [src/onionprobe/config.yml.example](./src/onionprobe/config.yml.example)
- [src/onionprobe/prometheus-tests.yml.example](./src/onionprobe/prometheus-tests.yml.example)

The same goes with these files, except that these values should be memorable:

- [src/grafana/secrets/username.txt.example](./src/grafana/secrets/username.txt.example)
- [src/grafana/secrets/password.txt.example](./src/grafana/secrets/password.txt.example)
- [src/grafana/secrets/email.txt.example](./src/grafana/secrets/email.txt.example)

Although this project will work with the example credentials
in each of these files, **for your own security, please change them.**

Next, create a key file for MongoDB replicas. The replica set members use
it to authenticate each other, and it turns authorization on, so every
client needs the credentials above. Run the following command in the
project root:

```shell
openssl rand -base64 756 > ./src/mongo/secrets/keyFile.pem
```

If you plan to run this project in swarm mode, you're done. If not,
set its Linux permissions:

```sh
chmod 0400 ./src/mongo/secrets/keyFile.pem
stat -c %a ./src/mongo/secrets/keyFile.pem # Should print 400
```

If you're using WSL and the output doesn't match (e.g, 555), then you'll need
to add the following setting in `/etc/wsl.conf`:

```ini
[automount]
options = "metadata"
```

Then restart WSL:

```shell
wsl --shutdown
```

And try setting the permissions again.

Finally, set the remaining permissions as follows:

```sh
sudo chown 999:999 ./src/mongo/secrets/keyFile.pem
stat -c %u:%g ./src/mongo/secrets/keyFile.pem # Should print 999:999
```

#### tor

**If you don't have an onion domain**, run the following command in the
project root to generate one:

```shell
npm run generate-onion
```

Then, [`src/tor/secrets/`](./src/tor/secrets) should be populated almost
instantly. In more formal terms, terminate the process once you see the
following output:

```log
[notice] Bootstrapped 0% (starting): Starting
```

From here, the container will attempt to publish your website to the tor
network. It will fail indefinitely. At this point, the credentials have been
generated, so it's safe to shut it down.

If you do have an existing onion domain, such as through [OnionMine][onionmine],
the public/private keys and other secrets can be placed in
[`src/tor/secrets/`](./src/tor/secrets) instead.

Your website domain will be found in `src/tor/secrets/hostname`.
This domain should also be specified in `src/onionprobe/config.yml`
and `src/onionprobe/prometheus-tests.yml` where the placeholder onion address
`abcdefghabcdefghabcdefghabcdefghabcdefghabcdefghabcdefgh.onion` is present.

## Running

### Production

For production mode, run **one** of the following equivalent commands
in the project root:

```shell
npm start
npm run start
npm run start:prod
```

### Development

To attach all debugging containers intended for development-only use,
run the following command in the project root:

```shell
npm run start:dev
```

This can be done before or after starting production mode,
as they collectively depend on all production containers unrelated to tor.

### Database shell

To open `mongosh` on the replica set, logged in as the administrator from
[`src/mongo/secrets/root/`](./src/mongo/secrets/root), run the following
command in the project root while the website is running:

```shell
npm run mongosh
```

### Shutdown

To stop the website, run **one** of the following equivalent commands
in the project root:

```shell
npm stop
npm run stop
```

### Updating

To update the website, run the following command in the project root:

```shell
# Pull base images and build compose project
npm run build:pull
```

Then, stop and start the website.

When building the `nginx` image with a custom `GIXY_URL`, checksum verification
is enabled by default. To disable it, build with
`docker compose build --build-arg GIXY_VERIFY_CHECKSUM=false nginx`.

In general, you should be able to omit the shutdown procedure,
but some services may not function correctly.

## Kubernetes

Not officially supported. For translating Docker Compose configurations
to Kubernetes, see the [Kompose docs][kompose]. Note that Docker Desktop
comes with the required Kubernetes utilities.

## Scanning

OnionScan performs a comprehensive scan of the website, identifying fingerprints
and computing correlation vectors accordingly. It can also be used to find
misconfigurations, as it checks for ports that may not have meant to be publicly
exposed. Custom configurations are not supported.

Usage:

```shell
# Start the website and expose it to the tor network
npm run onionscan

# Stop only onionscan
docker compose down onionscan

# Stop onionscan and the website
npm stop
```

## Credits

- [OnionProbe][onionprobe]
- [OnionScan][onionscan]
- [Anonymous-Humanoid/chromium-extension-boilerplate][boilerplate],
  modified to lint and prettify this Node project
- Many more projects we explicitly or inadvertently depend on

## Issues and Contribution

1. See the [Contributing guidelines](./CONTRIBUTING.md).

[license-badge]: https://raw.githubusercontent.com/Vessel9817/onion-site-template/refs/heads/main/badge.svg
[ci-workflow]: https://github.com/Vessel9817/onion-site-template/actions/workflows/ci.yml
[ci-badge]: https://github.com/Vessel9817/onion-site-template/actions/workflows/ci.yml/badge.svg
[codeql-workflow]: https://github.com/Vessel9817/onion-site-template/actions/workflows/codeql.yml
[codeql-badge]: https://github.com/Vessel9817/onion-site-template/actions/workflows/codeql.yml/badge.svg
[onionmine]: https://onionservices.torproject.org/apps/base/onionmine/
[kompose]: https://kubernetes.io/docs/tasks/configure-pod-container/translate-compose-kubernetes/
[onionprobe]: https://gitlab.torproject.org/tpo/onion-services/onionprobe
[onionscan]: https://github.com/harr1424/onionscan
[boilerplate]: https://github.com/Anonymous-Humanoid/chromium-extension-boilerplate
