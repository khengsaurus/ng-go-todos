#!/bin/bash

docker compose down && docker compose up -d

bash scripts/ls_s3_init.sh