#!/bin/sh

helper="$(dirname "$0")/helper.sh"

"${helper}" --config=./config/license-report/configs/website.config.json
"${helper}" --config=./config/license-report/configs/express.config.json
"${helper}" --config=./config/license-report/configs/mongo.config.json