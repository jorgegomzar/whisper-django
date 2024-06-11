#!/bin/bash

docker buildx build --platform=linux/amd64 -t jorgegomzar/whisper-django .
docker push jorgegomzar/whisper-django
