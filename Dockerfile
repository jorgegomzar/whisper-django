FROM python:3.11

RUN mkdir -p /app
WORKDIR /app

RUN apt update && apt install -y ffmpeg
RUN pip install -U pip
RUN pip install -U poetry

COPY generate_transcript_app .
COPY pyproject.toml .
COPY poetry.lock .
COPY requirements-whisper.txt .
COPY uwsgi.ini .

RUN poetry config virtualenvs.create false
RUN poetry install
RUN pip install -r requirements-whisper.txt

CMD ["/usr/local/bin/uwsgi", "--ini", "uwsgi.ini"]
# CMD ["tail", "-f", "/dev/null"]
