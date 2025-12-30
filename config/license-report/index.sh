#!/bin/sh

# Update prompt breaks table formatting
npm config set update-notifier false

helper="$(dirname "$0")/helper.sh"

"${helper}" --config=./config/license-report/configs/website.config.json
"${helper}" --config=./config/license-report/configs/license-report.config.json
"${helper}" --config=./config/license-report/configs/express.config.json
"${helper}" --config=./config/license-report/configs/mongo.config.json
