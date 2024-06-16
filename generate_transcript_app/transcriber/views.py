import io
import whisper
from django.http.response import HttpResponse, HttpResponseServerError
from django.shortcuts import render, redirect
from django.template.defaulttags import register
from whisper.utils import WriteVTT

from .forms import MediaFileForm
from .models import MediaFile


def index(request):
    if request.method == 'POST':
        form = MediaFileForm(request.POST, request.FILES)
        if form.is_valid():
            media_file: MediaFile = form.save()
            # Trigger Whisper AI transcription
            vtt_transcription = transcribe_file(media_file.file.path)  # type: ignore
            media_file.vtt_transcription = vtt_transcription  # type: ignore
            media_file.save()
            return redirect('transcriber:detail', pk=media_file.pk)
    else:
        form = MediaFileForm()

    uploaded_not_deleted = MediaFile.objects.filter(  # type: ignore
        deleted=False
    ).order_by("-uploaded_at")
    return render(request, 'transcriber/index.html', {
        'form': form,
        'uploaded_not_deleted': uploaded_not_deleted,
    })


def detail(request, pk):
    media_file = MediaFile.objects.get(pk=pk)  # type: ignore
    if request.method == "GET":
        return render(
            request,
            'transcriber/detail.html',
            {
                'media_file': media_file,
            }
        )
    if request.method == "POST":
        try:
            media_file.json_save = request.POST.get("json_save", "")
            media_file.save()
        except Exception:
            return HttpResponseServerError(b"Failed to save data into DB.")
        return HttpResponse(b"Status saved to DB.")


def transcribe_file(file_path: str) -> str:
    """From a file, it generates:

    - VTT transcription text
    """
    model = whisper.load_model("base")
    result = model.transcribe(file_path, language="en")

    vtt_transcription = io.StringIO()
    WriteVTT("vtt").write_result(result, vtt_transcription)
    vtt_transcription.seek(0)

    return vtt_transcription.getvalue()


@register.filter(name='split')
def split(value, key): 
     value.split("key")
     return value.split(key)
