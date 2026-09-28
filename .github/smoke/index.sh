#!/bin/sh
# Brings up the smallest chain that proves the template serves traffic:
# tor -> nginx -> express -> mongo. The tor healthcheck fetches the onion
# through its own SOCKS port, so a healthy stack with vanguards' state file
# is the assertion.
set -eu

# Should be called from the project root

TOR_NETWORK='website_tor'
NGINX_NETWORK='website_nginx'
TOR_COMPOSE='src/tor/docker-compose.yml'
TESTNET_COMPOSE='.github/smoke/testnet.yml'

# Materialising the examples would destroy a configured deployment.
for configured in src/express/secrets/.env src/mongo/secrets/.env; do
    if [ -e "${configured}" ]; then
        echo "refusing to run: ${configured} already exists" >&2
        exit 1
    fi
done

# Refusing a renamed project, which the checks below would not see
if [ -n "${COMPOSE_PROJECT_NAME:-}" ]; then
    echo 'refusing to run: COMPOSE_PROJECT_NAME is set' >&2
    exit 1
fi

# Refusing to rewire a running website stack onto the smoke test's networks
project='label=com.docker.compose.project=website'
containers=$(docker ps -aq --filter "${project}")
networks=$(docker network ls -q --filter "${project}")

if [ -n "${containers}${networks}" ]; then
    echo 'refusing to run: the website compose project already exists' >&2
    echo 'if an earlier smoke test left it, remove it with:' >&2
    echo 'docker compose --profile production -f docker-compose.yml \' >&2
    echo "    -f ${TESTNET_COMPOSE} down --volumes" >&2
    echo 'this also deletes the volumes of any website deployment' >&2
    exit 1
fi

find src -name '*.example' -not -path 'src/onionprobe/onionprobe/*' \
    -exec sh -c 'cp "$1" "${1%.example}"' _ {} \;

openssl rand -base64 756 > src/mongo/secrets/keyFile.pem
chmod 0400 src/mongo/secrets/keyFile.pem
# mongod reads the keyfile as its own user, so the file takes that owner,
# as the README asks. A container does the chown so no sudo is needed.
docker run --rm -v "${PWD}/src/mongo/secrets/keyFile.pem:/keyFile.pem" \
    mongo:8 chown 999:999 /keyFile.pem

# Failing unless the network has no route off the host
internal() {
    if [ "$(docker network inspect -f '{{.Internal}}' "$1")" != true ]; then
        echo "$1 is not an internal network" >&2
        exit 1
    fi
}

# The root compose file mounts the hostname as a secret, so tor has to
# generate one first. Tor chowns its bind-mounted directory to a uid this
# shell does not have, so the hostname is read from inside the container.
# DisableNetwork writes the keys without tor opening a connection.
keygen=$(docker compose -f "${TOR_COMPOSE}" run -d tor DisableNetwork 1)
internal "${TOR_NETWORK}"

waited=0

while :; do
    if onion=$(docker exec "${keygen}" \
        cat /var/lib/tor/website/hostname 2>/dev/null); then
        onion=$(printf '%s' "${onion}" | tr -d '[:space:]')

        if [ -n "${onion}" ]; then
            break
        fi
    fi

    waited=$((waited + 1))

    if [ "${waited}" -ge 10 ]; then
        echo 'tor produced no hostname' >&2
        docker logs "${keygen}" >&2
        exit 1
    fi

    sleep 1
done

docker rm -f "${keygen}" > /dev/null
docker compose -f "${TOR_COMPOSE}" down

# Starting the private Tor network after the down above, while images build
docker compose -f docker-compose.yml -f "${TESTNET_COMPOSE}" up -d testnet
internal "${TOR_NETWORK}"
docker compose --profile production -f docker-compose.yml \
    -f "${TESTNET_COMPOSE}" up --wait --wait-timeout 900 tor
internal "${NGINX_NETWORK}"

# Waiting for vanguards' state file, which it writes once it has picked layers
deadline=$(($(date +%s) + 60))

until docker compose --profile production -f docker-compose.yml \
    -f "${TESTNET_COMPOSE}" exec -T tor test -s /project/vanguards.state; do
    if [ "$(date +%s)" -ge "${deadline}" ]; then
        echo 'vanguards wrote no state within 60 s' >&2
        exit 1
    fi

    sleep 1
done

# Keeping the onion tor's log, hidden service lines included, in passing runs
docker logs tor
