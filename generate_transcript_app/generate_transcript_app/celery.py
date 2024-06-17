import logging
import os
from celery import Celery


logger = logging.getLogger("celery")

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'generate_transcript_app.settings')

app = Celery('transcriber')
app.config_from_object('generate_transcript_app.settings', namespace='CELERY')
app.autodiscover_tasks()

logger.info("Celery app is up!")
