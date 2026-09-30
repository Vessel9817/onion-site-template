#!/bin/sh
# Running the smoke test's private Tor network: 4 authorities and 8 relays
set -eu

addr="${TESTNET_ADDRESS:?}"
consensus="http://${addr}:7001/tor/status-vote/current/consensus-microdesc"
conf='/smoke/conf'
tn='/smoke/tn'
shared='/smoke/shared'

# Counting relays vanguards can pick; the torrcs make all Guard and none Exit
usable() {
    # Skipping any proxy Docker passes in, since the address is internal
    curl -s -m 5 --noproxy '*' "${consensus}" | awk '
        $1 == "r" { n++ }
        $1 == "s" && !/ Authority/ && / Fast/ && / Guard/ && / Running/ &&
            / Stable/ && / Valid/ { ok[n] = 1 }
        $1 == "w" && ok[n] && $2 ~ /^Bandwidth=[1-9]/ { count++ }
        $1 == "bandwidth-weights" && / Wmg=[1-9]/ { weights = 1 }
        END { print weights ? count + 0 : 0 }'
}

# Checking health: the DirAuthority lines are out and 8 relays are usable
if [ "${1:-}" = 'check' ]; then
    test -s "${shared}/torrc-defaults" && test "$(usable)" -ge 8
    exit
fi

# Clearing the last run's lines, since the named volume outlives the container
rm -f "${shared}/torrc-defaults" "${shared}/torrc-defaults.tmp"
rm -rf "${tn}"
mkdir -p "${tn}"
: > "${tn}/dirauth"

# Making a node's keys and printing its relay identity fingerprint
fingerprint() {
    tor --ignore-missing-torrc -f /nonexistent DataDirectory "${tn}/$1" \
        Nickname "$1" ORPort 1 --list-fingerprint |
        awk -v nick="$1" '$1 == nick { $1 = ""; gsub(/ /, ""); print }'
}

for n in $(seq 1 4); do
    mkdir -p "${tn}/a${n}/keys"
    chmod 700 "${tn}/a${n}"
    # Certifying the address and DirPort the authority serves on
    echo 'smoke' | tor-gencert --create-identity-key --passphrase-fd 0 -m 1 \
        -a "${addr}:700${n}" -i "${tn}/a${n}/keys/authority_identity_key" \
        -s "${tn}/a${n}/keys/authority_signing_key" \
        -c "${tn}/a${n}/keys/authority_certificate" > /dev/null
    v3ident=$(awk '$1 == "fingerprint" { print $2 }' \
        "${tn}/a${n}/keys/authority_certificate")
    echo "DirAuthority a${n} orport=500${n} no-v2 v3ident=${v3ident}" \
        "${addr}:700${n} $(fingerprint "a${n}")" >> "${tn}/dirauth"
done

# Writing the bandwidth file: a timestamp, then one bandwidth for every relay
{
    date +%s

    for n in $(seq 1 8); do
        mkdir -p "${tn}/r${n}"
        chmod 700 "${tn}/r${n}"
        echo "node_id=\$$(fingerprint "r${n}") bw=4096"
    done
} > "${tn}/bandwidth"

# Prefixing each node's lines with its nickname; $! is sed, which ends with tor
pids=''

for n in $(seq 1 4); do
    tor -f "${conf}/torrc-authority" DataDirectory "${tn}/a${n}" \
        Nickname "a${n}" Address "${addr}" ORPort "${addr}:500${n}" \
        DirPort "${addr}:700${n}" 2>&1 | sed -u "s/^/a${n} /" &
    pids="${pids} $!"
done

for n in $(seq 1 8); do
    tor -f "${conf}/torrc-relay" DataDirectory "${tn}/r${n}" \
        Nickname "r${n}" Address "${addr}" ORPort "${addr}:510${n}" 2>&1 |
        sed -u "s/^/r${n} /" &
    pids="${pids} $!"
done

# Holding the DirAuthority lines back until the consensus has 8 usable relays
deadline=$(($(date +%s) + 240))

until [ "$(usable)" -ge 8 ]; do
    for pid in ${pids}; do
        if ! kill -0 "${pid}" 2>/dev/null; then
            echo 'testnet: a node exited before the consensus was ready' >&2
            exit 1
        fi
    done

    if [ "$(date +%s)" -ge "${deadline}" ]; then
        echo 'testnet: no consensus with 8 usable relays within 240 s' >&2
        exit 1
    fi

    sleep 2
done

# Publishing the DirAuthority lines by rename, so tor never reads half a file
cp "${tn}/dirauth" "${shared}/torrc-defaults.tmp"
mv "${shared}/torrc-defaults.tmp" "${shared}/torrc-defaults"
echo 'testnet: the consensus lists 8 relays vanguards can use'

# Keep network container running
wait
