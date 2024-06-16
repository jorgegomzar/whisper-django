#!/usr/bin/make

dev: build down up

build:
	docker buildx build --platform=linux/amd64 -t jorgegomzar/whisper-django .

push:
	docker push jorgegomzar/whisper-django

up:
	docker compose up -d

down:
	docker compose down

sh:
	docker exec -it whisper-django bash
