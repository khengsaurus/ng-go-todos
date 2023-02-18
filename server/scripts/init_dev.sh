#!/bin/bash

# Init app with docker-compose, all external services running locally in docker

docker compose down && docker compose up -d

sleep 10

bash scripts/ls_s3_init.sh