ARG NODE_VERSION=node:lts-alpine3.22@sha256:76db75ca7e7da9148ae42c92d9be12d12a8d7b03e171f18339355d8078d644a0

FROM ${NODE_VERSION}

RUN mkdir -p /usr/app/src
WORKDIR /usr/app/src
COPY [ "package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./" ]
RUN \
    npm i && \
    mv ./node_modules/ ../

# 1000:1000 corresponds to user "node"
COPY --link --chown=1000:1000 [ "./", "./" ]

USER node
EXPOSE 3000
CMD [ "npm", "start" ]
