import logging
import os
from collections.abc import Iterable
from datetime import datetime, timedelta
from typing import Union

from .models import MediaFile


logger = logging.getLogger("cron")


def delete_old_files_from_disk(older_than_x_days: Union[str, int] = 1):
    """Deletes files from disk older than x days."""
    if not isinstance(older_than_x_days, int):
        older_than_x_days = int(older_than_x_days)

    def delete_file_path(path):
        if os.path.isfile(path):
            os.remove(path)

    yesterday = datetime.now() - timedelta(days=older_than_x_days)
    media_files_to_delete: Iterable[MediaFile] = MediaFile.objects.filter(  # type: ignore
        deleted=False,
        uploaded_at__lte=yesterday
    )

    total_files_deleted = media_files_to_delete.count()  # type: ignore

    for media_file in media_files_to_delete:
        delete_file_path(media_file.file.path)  # type: ignore
        delete_file_path(media_file.vtt_file.path)  # type: ignore
        media_file.deleted = True  # type: ignore
        media_file.save()

    logger.info("%d files deleted from disk" % total_files_deleted)
