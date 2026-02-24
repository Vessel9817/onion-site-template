#!/bin/sh

# Update prompt breaks table formatting
npm config set update-notifier false

helper="$(dirname "$0")/helper.sh"

"${helper}" --config=./src/license-report/configs/website.config.json
"${helper}" --config=./src/license-report/configs/license-report.config.json
"${helper}" --config=./src/license-report/configs/express.config.json
"${helper}" --config=./src/license-report/configs/mongo.config.json
