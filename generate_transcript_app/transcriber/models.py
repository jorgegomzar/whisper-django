import os
from django.db import models


class MediaFile(models.Model):
    file = models.FileField(upload_to='uploads/')
    transcription = models.TextField(blank=True, null=True)
    vtt_file = models.FileField(upload_to='captions/', blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.file.name or "no_name"
    
    @property
    def extension(self) -> str:
        _, extension = os.path.splitext(self.file.name)  # type: ignore
        return extension.lstrip(".")
