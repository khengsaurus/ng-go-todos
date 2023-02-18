#!/bin/bash

# Init app as a docker image, using remote services

APP="ng-go-todos-s"
TAG="latest"
PORTS="8091:8080"
BUILD_PATH="."

# Build app image if not exists
if [[ "$(docker images -q $APP:$TAG 2> /dev/null)" == "" ]]; 
  then docker build $BUILD_PATH -t $APP:$TAG
fi

docker run --name $APP -p $PORTS -e APP_ID=$APP -d $APP:$TAG