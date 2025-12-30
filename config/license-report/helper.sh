#!/bin/sh

echo  ------------
#echo package name
#echo ------------

# This separate file exists to prevent the whole script from terminating
# when license-report or a dependency calls process.exit(0)
npx license-report --output=table "$@"
