import json
from django.http.response import Http404, HttpResponse, HttpResponseServerError
from django.shortcuts import render
from django.template.defaulttags import register

from .forms import MediaFileForm
from .models import MediaFile
from .tasks import transcribe_file


def index(request):
    if request.method == 'POST':
        form = MediaFileForm(request.POST, request.FILES)
        if form.is_valid():
            media_file: MediaFile = form.save()
            # async transcribe file
            transcribe_file.delay(media_file.id)  # type: ignore
    form = MediaFileForm()
    return render(request, 'transcriber/index.html', { 'form': form, })


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


def list_uploaded(request):
    if request.method != "GET":
        return Http404("Wrong method. Use GET.")

    uploaded_not_deleted = MediaFile.objects.filter(  # type: ignore
        deleted=False,
    ).exclude(
        vtt_transcription=None,
    ).order_by("-uploaded_at")

    return HttpResponse(json.dumps([
        {
            "id": media.id,
            "title": media.file.name.replace("uploads/", ""),
            "uploaded_at": media.uploaded_at.strftime("%Y-%m-%d %H:%M:%S"),
        }
        for media in uploaded_not_deleted
    ]).encode())


@register.filter(name='split')
def split(value, key): 
     value.split("key")
     return value.split(key)
