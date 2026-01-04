ARG PYTHON_VERSION=python:3.5.10-slim

FROM ${PYTHON_VERSION}

WORKDIR /project/
COPY [ "./requirements.txt", "./" ]
RUN pip install -r "./requirements.txt"

ENTRYPOINT [ "vanguards" ]
CMD [ "--control_port", "9099" ]
