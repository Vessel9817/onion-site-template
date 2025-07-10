FROM node:lts-alpine3.22

# Installing dependencies
RUN \
    apk update && \
    apk add --no-cache curl
WORKDIR /usr/app/src
COPY [ "./express/package.json", "./express/package-lock.json*", "./express/npm-shrinkwrap.json*", "./" ]
RUN npm i

# Copying source files
COPY "./express" "."
COPY "./backend/src/db/kafka/shared/" "./kafka/shared/"

# Running app
RUN chown -R node /usr/app/src
USER node
EXPOSE 3000
HEALTHCHECK --interval=5s --timeout=1s --start-period=10s --retries=3 \
    CMD [ "curl", "-f", "localhost:3000" ]
CMD [ "npm", "start" ]
