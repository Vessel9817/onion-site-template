#!/bin/sh

# Update prompt breaks table formatting
npm config set update-notifier false

script_dir="$(dirname "$0")"
config_dir="${script_dir}/configs"
helper="${script_dir}/helper.sh"

# Spaces in config file name will break this
find "${config_dir}" -type f -exec "${helper}" --config={} \;
