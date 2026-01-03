ARG PYTHON_VERSION=python:3.5.10-slim

FROM ${PYTHON_VERSION}

WORKDIR /project/ 

RUN pip install vanguards==0.3.1

ENTRYPOINT [ "vanguards" ]
CMD [ "--control_port", "9099" ]
