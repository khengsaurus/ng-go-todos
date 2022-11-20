#!/bin/bash

python3 scripts/ls_s3_create_bucket.py

sleep 2

curl 'http://localhost:8080/admin/files' \
--request DELETE \
--header 'Authorization: Bearer - admin'