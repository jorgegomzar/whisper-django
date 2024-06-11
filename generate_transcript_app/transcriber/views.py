import whisper
from django.shortcuts import render, redirect
from django.template.defaulttags import register
from pathlib import Path
from whisper.utils import WriteVTT

from .forms import MediaFileForm
from .models import MediaFile


def index(request):
    if request.method == 'POST':
        form = MediaFileForm(request.POST, request.FILES)
        if form.is_valid():
            media_file: MediaFile = form.save()
            # Trigger Whisper AI transcription
            transcription, vtt_file = transcribe_file(media_file.file.path, media_file.extension)  # type: ignore
            media_file.transcription = transcription  # type: ignore
            media_file.vtt_file = vtt_file  # type: ignore
            media_file.save()
            return redirect('transcriber:detail', pk=media_file.pk)
    else:
        form = MediaFileForm()
    return render(request, 'transcriber/index.html', {'form': form})


def detail(request, pk):
    media_file = MediaFile.objects.get(pk=pk)  # type: ignore
    return render(
        request,
        'transcriber/detail.html',
        {
            'media_file': media_file,
            'vtt_transcription': Path(media_file.vtt_file.path).open().read(),
        }
    )


def transcribe_file(file_path: str, file_extension: str) -> tuple[str, str]:
    """From a file, it generates:

    - transcription text
    - VTT transcription file path --> for media player captions
    """
    vtt_file_path_str = file_path.replace(file_extension, 'vtt').replace("uploads", "captions")
    vtt_file_path = Path(vtt_file_path_str)

    vtt_file_path.parent.mkdir(parents=True, exist_ok=True)

    model = whisper.load_model("base")
    result = model.transcribe(file_path)

    transcription: str = result["text"]  # type: ignore

    with vtt_file_path.open(mode="wt") as vtt_file:
        WriteVTT("vtt").write_result(result, vtt_file)

    return transcription, vtt_file_path.relative_to(Path(__file__).parent.parent / "media/").__str__()


@register.filter(name='split')
def split(value, key): 
     value.split("key")
     return value.split(key)
