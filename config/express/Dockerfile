FROM node:lts-alpine3.22

# Installing dependencies
RUN \
    apk update && \
    apk add --no-cache curl
WORKDIR /usr/app/src
COPY [ "./package.json", "./package-lock.json*", "./npm-shrinkwrap.json*", "./" ]
RUN npm i

# Copying source files
# 1000:1000 corresponds to user "node"
COPY --link --chown=1000:1000 [ "./", "./" ]

# Running app
USER node
EXPOSE 3000
HEALTHCHECK --interval=5s --timeout=1s --start-period=10s --retries=3 \
    CMD [ "curl", "-f", "localhost:3000" ]
CMD [ "npm", "start" ]
