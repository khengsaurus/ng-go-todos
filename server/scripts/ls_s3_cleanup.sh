#!/bin/bash

awslocal s3 rm --recursive s3://ng-go-todos && awslocal s3api delete-bucket --bucket ng-go-todos