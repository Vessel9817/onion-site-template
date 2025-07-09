#!/usr/bin/env sh

# Adding topics in background after broker has started, even if they already exist
# See: https://docs.docker.com/engine/containers/multi-service_container/
bash /opt/kafka/bin/kafka-topics.sh --create --bootstrap-server localhost:9092 --topic unauthorized.msg-board-db.v1 &

# Running broker (foreground server)
'/etc/kafka/docker/run'
