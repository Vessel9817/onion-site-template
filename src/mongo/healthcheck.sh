#!/bin/bash

# Source:
# https://github.com/docker-library/mongo/issues/339#issuecomment-2444049958

if ! mongosh --quiet --eval "try{disableTelemetry();return rs.status().ok;}catch(err){console.error(err);throw err;}" &> /dev/null; then
    echo "Replica set not initialized, attempting to initiate..."
    if ! mongosh --quiet --eval "try{rs.initiate(require('./replicas.json'));}catch(err){console.error(err);throw err;}"; then
        echo "Failed to initiate replica set" >&2
        exit 1
    fi

    # Final health check
    if ! mongosh --quiet --eval "try{disableTelemetry();return rs.status().ok;}catch(err){console.error(err);throw err;}" &> /dev/null; then
        echo "Health check failed: Replica set is not ok." >&2
        exit 1
    fi
fi

echo "Health check passed: Replica set is ok."
