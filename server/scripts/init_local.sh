#!/bin/bash

docker compose down && docker compose up -d

sleep 10

bash scripts/ls_s3_init.sh