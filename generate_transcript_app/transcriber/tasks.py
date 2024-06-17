import io
import logging
import whisper
from celery import shared_task
from whisper.utils import WriteVTT

from .models import MediaFile


logger = logging.getLogger("tasks")


@shared_task(name="transcribe_file")
def transcribe_file(media_file_id: int) -> None:
    """From a MediaFile id, generates the transcription vtt and
    stores its value into the DB.

    Then triggers a notification to the user. --> TODO
    """
    logger.info("Transcribe file task received for MediaFile:%d" % media_file_id)
    media_file = MediaFile.objects.get(pk=media_file_id)  # type: ignore

    model = whisper.load_model("base")
    result = model.transcribe(media_file.file.path, language="en")

    vtt_transcription = io.StringIO()
    WriteVTT("vtt").write_result(result, vtt_transcription)
    vtt_transcription.seek(0)
    media_file.vtt_transcription = vtt_transcription.getvalue()
    media_file.save()
    logger.info("Transcription saved to DB!")
