ARG PYTHON_VERSION=python:3.5.10-slim@sha256:2348c9c9fa90808066919c036d59919fbf82c7f9277c2ff8b6b8cc6e72f5b9d7

FROM ${PYTHON_VERSION}

WORKDIR /project/
COPY [ "./requirements.txt", "./" ]
RUN pip install -r "./requirements.txt"

ENTRYPOINT [ "vanguards" ]
