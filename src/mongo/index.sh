#!/bin/sh

mongosh \
    --host "${HOST}" \
    --port "${PORT}" \
    --eval 'try{disableTelemetry();const assert=require("node:assert");try{assert.strictEqual(rs.status().ok,1);}catch{rs.initiate(require("./replicas.json"),{force:true});assert.strictEqual(rs.status().ok,1);}}catch(err){console.error("Failed to initialize replica set:",err);throw err;}'
