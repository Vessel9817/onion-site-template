#!/bin/sh

script_dir="$(dirname "$0")"

"${script_dir}/onionscan" --verbose -webport=8080 --torProxyAddress="${TOR_PROXY}" "${ONION_HOSTNAME}"
