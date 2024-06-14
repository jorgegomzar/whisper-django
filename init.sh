#!/bin/bash

# wait for DB to be ready
sleep 15
python generate_transcript_app/manage.py migrate
python generate_transcript_app/manage.py crontab add

uwsgi --ini uwsgi.ini
