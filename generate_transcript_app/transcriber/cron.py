import os
from collections.abc import Iterable
from datetime import datetime, timedelta

from .models import MediaFile


def delete_old_files_from_disk(older_than_x_days: int = 1):
    """Deletes files from disk older than x days."""
    def delete_file_path(path):
        if os.path.isfile(path):
            os.remove(path)

    yesterday = datetime.now() - timedelta(days=older_than_x_days)
    media_files_to_delete: Iterable[MediaFile] = MediaFile.objects(  # type: ignore
        deleted__ne=True,
        uploaded_at__lte=yesterday
    )

    for media_file in media_files_to_delete:
        delete_file_path(media_file.file.path)  # type: ignore
        delete_file_path(media_file.vtt_file.path)  # type: ignore
        media_file.deleted = True
        media_file.save()
