#!/bin/bash

python /src/generate_transcript_app/manage.py migrate
python /src/generate_transcript_app/manage.py crontab add

uwsgi --ini /src/uwsgi.ini
