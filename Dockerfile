FROM python:3.11-slim

RUN mkdir -p /app
WORKDIR /app

RUN apt update && apt install -y ffmpeg build-essential pkg-config default-mysql-client libpython3-dev default-libmysqlclient-dev
RUN pip install -U pip
RUN pip install -U poetry

COPY pyproject.toml /app/pyproject.toml
COPY poetry.lock /app/poetry.lock

RUN poetry config virtualenvs.create false
RUN poetry install

COPY generate_transcript_app/ /app/generate_transcript_app/
COPY uwsgi.ini /app/uwsgi.ini

CMD ["/usr/local/bin/uwsgi", "--ini", "uwsgi.ini"]
# CMD ["tail", "-f", "/dev/null"]
