#!/bin/sh
# Brings up the smallest chain that proves the template serves traffic:
# tor -> nginx -> express -> mongo. The tor healthcheck fetches the onion
# through its own SOCKS port, so a healthy stack is the assertion.
set -eu

# Should be called from the project root

TOR_COMPOSE='src/tor/docker-compose.yml'
ONION='[a-z0-9]\{56\}\.onion'

# Materialising the examples would destroy a configured deployment.
for configured in src/express/secrets/.env src/mongo/secrets/.env; do
    if [ -e "${configured}" ]; then
        echo "refusing to run: ${configured} already exists" >&2
        exit 1
    fi
done

find src -name '*.example' -not -path 'src/onionprobe/onionprobe/*' \
    -exec sh -c 'cp "$1" "${1%.example}"' _ {} \;

openssl rand -base64 756 > src/mongo/secrets/keyFile.pem
chmod 0400 src/mongo/secrets/keyFile.pem
# mongod reads the keyfile as its own user, so the file takes that owner,
# as the README asks. A container does the chown so no sudo is needed.
docker run --rm -v "${PWD}/src/mongo/secrets/keyFile.pem:/keyFile.pem" \
    mongo:8 chown 999:999 /keyFile.pem

# The root compose file mounts the hostname as a secret, so tor has to
# generate one first. Tor chowns its bind-mounted directory to a uid this
# shell does not have, so the hostname is read from inside the container.
docker compose -f "${TOR_COMPOSE}" up -d

waited=0

while :; do
    if onion=$(docker compose -f "${TOR_COMPOSE}" exec -T tor \
        cat /var/lib/tor/website/hostname 2>/dev/null); then
        onion=$(printf '%s' "${onion}" | tr -d '[:space:]')

        if [ -n "${onion}" ]; then
            break
        fi
    fi

    waited=$((waited + 1))

    if [ "${waited}" -ge 10 ]; then
        echo 'tor produced no hostname' >&2
        docker compose -f "${TOR_COMPOSE}" logs tor >&2
        exit 1
    fi

    sleep 1
done

docker compose -f "${TOR_COMPOSE}" down

sed -i "s/${ONION}/${onion}/" src/onionprobe/config.yml

docker compose --profile production up --wait --wait-timeout 900 tor
